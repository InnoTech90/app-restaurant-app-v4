import AsyncStorage from "@react-native-async-storage/async-storage";
import { withDb } from "../../../../utils/db";

export class Database {
  /** Trae los grupos de complementos y sus complementos para un artículo */
  static async getComplementos(articuloUUID) {
    return withDb("DetalleArticulo.getComplementos", async (db) => {
      const id = String(articuloUUID ?? "").trim();
      if (!id) return [];

      let grupos = await db.getAllAsync(
        `SELECT * FROM GRUPO_COMPLEMENTOS WHERE ID_ARTICULO = ? ORDER BY POSICION`,
        [id],
      );

      // Fallback: si mandaron el ID numérico del artículo
      if (!grupos?.length && /^\d+$/.test(id)) {
        const art = await db.getFirstAsync(
          `SELECT UUID FROM ARTICULO WHERE ID = ?`,
          [Number(id)],
        );
        if (art?.UUID) {
          grupos = await db.getAllAsync(
            `SELECT * FROM GRUPO_COMPLEMENTOS WHERE ID_ARTICULO = ? ORDER BY POSICION`,
            [art.UUID],
          );
        }
      }

      // Fallback: buscar UUID del artículo por si el ID_ARTICULO en grupos usa otra forma
      if (!grupos?.length) {
        const art = await db.getFirstAsync(
          `SELECT UUID, ID FROM ARTICULO WHERE UUID = ? OR ID = ? LIMIT 1`,
          [id, id],
        );
        if (art?.UUID && art.UUID !== id) {
          grupos = await db.getAllAsync(
            `SELECT * FROM GRUPO_COMPLEMENTOS WHERE ID_ARTICULO = ? ORDER BY POSICION`,
            [art.UUID],
          );
        }
      }

      for (const grupo of grupos ?? []) {
        const grupoId = grupo.UUID ?? grupo.ID;
        grupo.complementos = await db.getAllAsync(
          `SELECT * FROM COMPLEMENTO
           WHERE ID_GRUPO_COMP = ? OR ID_GRUPO_COMP = ?
           ORDER BY POSICION`,
          [String(grupo.UUID ?? ""), String(grupoId ?? "")],
        );
      }
      return grupos ?? [];
    });
  }
  static async insertComanda(data) {
    const id_sucursal = await AsyncStorage.getItem("qrCode");
    const device_key = await AsyncStorage.getItem("deviceKey");
    return withDb("DetalleArticulo.insertComanda", async (db) => {
      // Buscar comanda abierta (ESTATUS=0 o impresa=4) para esta mesa
      const comandaExistente = await db.getFirstAsync(
        `SELECT ID FROM COMANDA
         WHERE ID_MESA = ? AND ESTATUS IN (0, 4) AND COALESCE(ACTIVO, 1) = 1
         LIMIT 1`,
        [data.id_mesa],
      );

      let id_comanda;
      if (comandaExistente) {
        // Reutilizar la comanda abierta
        id_comanda = comandaExistente.ID;
      } else {
        // Calcular el siguiente número de folio
        const fichaRow = await db.getFirstAsync(
          `SELECT COALESCE(MAX(FICHA), 0) + 1 AS NEXT_FICHA FROM COMANDA`,
        );
        const nextFicha = fichaRow?.NEXT_FICHA ?? 1;

        // Crear nueva comanda
        const comandaResult = await db.runAsync(
          `INSERT INTO COMANDA (
                    ID_MESA,
                    ID_SUCURSAL,
                    DEVICE_KEY,
                    NOTA,
                    FICHA,
                    ESTATUS,
                    SINCRONIZADO,
                    ACTIVO
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            data.id_mesa,
            id_sucursal,
            device_key,
            data.nota || "",
            nextFicha,
            0,
            0,
            1,
          ],
        );
        id_comanda = comandaResult.lastInsertRowId;

        await db.runAsync(
          `UPDATE MESA SET ESTATUS = 1, ID_COMANDA = ? WHERE UUID = ?`,
          [id_comanda, data.id_mesa],
        );
      }

      // Insertar cada artículo en la comanda
      for (const articulo of data.articulos) {
        const articuloResult = await db.runAsync(
          `INSERT INTO COMANDA_ARTICULO (
                    ID_COMANDA,
                    ID_ARTICULO,
                    CANTIDAD_CANCELADOS,
                    CANTIDAD,
                    PRECIO_VENTA,
                    NOTA,
                    DESCUENTO,
                    SUBTOTAL,
                    TOTAL
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id_comanda,
            articulo.ID_ARTICULO ?? null,
            0,
            articulo.CANTIDAD ?? 0,
            articulo.PRECIO_VENTA ?? 0,
            articulo.NOTA ?? "",
            articulo.DESCUENTO ?? 0,
            articulo.SUBTOTAL ?? 0,
            articulo.TOTAL ?? 0,
          ],
        );

        const id_comanda_articulo = articuloResult.lastInsertRowId;
        for (const complemento of articulo.complementos) {
          await db.runAsync(
            `INSERT INTO COMANDA_COMPLEMENTO (
                        ID_COMANDA_ARTICULO,
                        ID_COMPLEMENTO,
                        CANTIDAD_CANCELADOS,
                        CANTIDAD,
                        PRECIO_VENTA,
                        NOTA,
                        SUBTOTAL,
                        TOTAL
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              id_comanda_articulo ?? null,
              complemento.ID_COMPLEMENTO ?? null,
              0,
              complemento.CANTIDAD ?? 0,
              complemento.PRECIO_VENTA ?? 0,
              complemento.NOTA ?? "",
              complemento.SUBTOTAL ?? 0,
              complemento.TOTAL ?? 0,
            ],
          );
        }
      }
    });
  }

  static async getComandaArticuloCompleto(idComandaArticulo) {
    return withDb("DetalleArticulo.getComandaArticuloCompleto", async (db) => {
      const renglon = await db.getFirstAsync(
        `SELECT * FROM COMANDA_ARTICULO WHERE ID = ?`,
        [idComandaArticulo],
      );
      if (!renglon) return null;

      const articulo = await db.getFirstAsync(
        `SELECT * FROM ARTICULO WHERE UUID = ?`,
        [renglon.ID_ARTICULO],
      );

      const compRows = await db.getAllAsync(
        `SELECT cc.*,
                COALESCE(c.NOMBRE, gc.NOMBRE, cc.NOTA) as COMP_NOMBRE,
                COALESCE(c.PRECIO, cc.PRECIO_VENTA, 0) as COMP_PRECIO,
                COALESCE(c.UUID, gc.UUID, cc.ID_COMPLEMENTO) as COMP_UUID
         FROM COMANDA_COMPLEMENTO cc
         LEFT JOIN COMPLEMENTO c ON cc.ID_COMPLEMENTO = c.UUID
         LEFT JOIN GRUPO_COMPLEMENTOS gc ON cc.ID_COMPLEMENTO = gc.UUID
         WHERE cc.ID_COMANDA_ARTICULO = ?`,
        [idComandaArticulo],
      );

      return {
        renglon,
        articulo: articulo ?? null,
        complementos: compRows.map((cr) => ({
          UUID: String(cr.COMP_UUID ?? cr.ID_COMPLEMENTO ?? ""),
          NOMBRE: cr.COMP_NOMBRE ?? "—",
          PRECIO: Number(cr.COMP_PRECIO ?? cr.PRECIO_VENTA ?? 0) || 0,
          cantidad: Number(cr.CANTIDAD ?? 1) || 1,
        })),
      };
    });
  }

  static async updateComandaArticulo(idComandaArticulo, articulo) {
    return withDb("DetalleArticulo.updateComandaArticulo", async (db) => {
      await db.runAsync(
        `UPDATE COMANDA_ARTICULO
         SET CANTIDAD = ?, PRECIO_VENTA = ?, NOTA = ?, DESCUENTO = ?, SUBTOTAL = ?, TOTAL = ?
         WHERE ID = ?`,
        [
          articulo.CANTIDAD ?? 0,
          articulo.PRECIO_VENTA ?? 0,
          articulo.NOTA ?? "",
          articulo.DESCUENTO ?? 0,
          articulo.SUBTOTAL ?? 0,
          articulo.TOTAL ?? 0,
          idComandaArticulo,
        ],
      );

      await db.runAsync(
        `DELETE FROM COMANDA_COMPLEMENTO WHERE ID_COMANDA_ARTICULO = ?`,
        [idComandaArticulo],
      );

      for (const complemento of articulo.complementos ?? []) {
        await db.runAsync(
          `INSERT INTO COMANDA_COMPLEMENTO (
            ID_COMANDA_ARTICULO,
            ID_COMPLEMENTO,
            CANTIDAD_CANCELADOS,
            CANTIDAD,
            PRECIO_VENTA,
            NOTA,
            SUBTOTAL,
            TOTAL
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            idComandaArticulo,
            complemento.ID_COMPLEMENTO ?? null,
            0,
            complemento.CANTIDAD ?? 0,
            complemento.PRECIO_VENTA ?? 0,
            complemento.NOTA ?? "",
            complemento.SUBTOTAL ?? 0,
            complemento.TOTAL ?? 0,
          ],
        );
      }
    });
  }

  static async getConfiguraciones() {
    return withDb("DetalleArticulo.getConfiguraciones", async (db) => {
      return await db.getFirstAsync(`SELECT * FROM CONFIGURACIONES LIMIT 1`);
    });
  }
}
