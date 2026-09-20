import { withDb } from "../../../../utils/db";

export default class Database {
  // estatus
  // 0: abierta
  // 1: pagada
  // 2: cancelada
  // 3: pendiente de pago
  // 4: comanda impresa (cuenta impresa, pendiente de confirmar pago)

  static async getArticulosComanda(idComanda) {
    return withDb("Ticket.getArticulosComanda", async (db) => {
      const renglones = await db.getAllAsync(
        `SELECT ca.* FROM COMANDA_ARTICULO ca WHERE ca.ID_COMANDA = ? ORDER BY ca.ID ASC`,
        [idComanda],
      );
      return Promise.all(
        renglones.map(async (renglon) => {
          const articulo = await db.getFirstAsync(
            `SELECT * FROM ARTICULO WHERE UUID = ?`,
            [renglon.ID_ARTICULO],
          );
          const compRows = await db.getAllAsync(
            `SELECT cc.*,
                    COALESCE(c.NOMBRE, gc.NOMBRE, cc.NOTA) as COMP_NOMBRE,
                    COALESCE(c.PRECIO, cc.PRECIO_VENTA, 0) as COMP_PRECIO
             FROM COMANDA_COMPLEMENTO cc
             LEFT JOIN COMPLEMENTO c ON cc.ID_COMPLEMENTO = c.UUID
             LEFT JOIN GRUPO_COMPLEMENTOS gc ON cc.ID_COMPLEMENTO = gc.UUID
             WHERE cc.ID_COMANDA_ARTICULO = ?`,
            [renglon.ID],
          );
          const complementos = compRows.map((cr) => ({
            ...cr,
            complemento: {
              UUID: cr.ID_COMPLEMENTO,
              NOMBRE: cr.COMP_NOMBRE,
              PRECIO: cr.COMP_PRECIO,
            },
          }));
          return {
            ...renglon,
            articulo: articulo ?? null,
            complementos,
          };
        }),
      );
    });
  }

  static async getMesa(uuid) {
    return withDb("Ticket.getMesa", async (db) => {
      return await db.getFirstAsync(`SELECT * FROM MESA WHERE UUID = ?`, [
        uuid,
      ]);
    });
  }

  static async getCliente(id) {
    return withDb("Ticket.getCliente", async (db) => {
      return await db.getFirstAsync(`SELECT * FROM CLIENTES WHERE ID = ?`, [
        id,
      ]);
    });
  }

  static async cancelarComanda(idComanda) {
    return withDb("Ticket.cancelarComanda", async (db) => {
      await db.runAsync(
        `UPDATE COMANDA SET ESTATUS = 2, ACTIVO = 0 WHERE ID = ?`,
        [idComanda],
      );
    });
  }

  static async actualizarCantidadArticulo(
    idRenglon,
    cantidad,
    precioVenta,
    { subtotal, total, descuento } = {},
  ) {
    const sub = subtotal ?? cantidad * precioVenta;
    const tot = total ?? sub;
    const desc = descuento ?? 0;
    return withDb("Ticket.actualizarCantidadArticulo", async (db) => {
      await db.runAsync(
        `UPDATE COMANDA_ARTICULO SET CANTIDAD = ?, SUBTOTAL = ?, TOTAL = ?, DESCUENTO = ? WHERE ID = ?`,
        [cantidad, sub, tot, desc, idRenglon],
      );
    });
  }

  static async eliminarArticulo(idRenglon) {
    return withDb("Ticket.eliminarArticulo", async (db) => {
      await db.runAsync(
        `DELETE FROM COMANDA_COMPLEMENTO WHERE ID_COMANDA_ARTICULO = ?`,
        [idRenglon],
      );
      await db.runAsync(`DELETE FROM COMANDA_ARTICULO WHERE ID = ?`, [
        idRenglon,
      ]);
    });
  }

  static async imprimirTicket(idComanda) {
    return withDb("Ticket.imprimirTicket", async (db) => {
      await db.runAsync(
        `UPDATE COMANDA SET CONT_IMPRESO = COALESCE(CONT_IMPRESO, 0) + 1 WHERE ID = ?`,
        [idComanda],
      );
    });
  }

  static async actualizarNota(idComanda, nota) {
    return withDb("Ticket.actualizarNota", async (db) => {
      await db.runAsync(`UPDATE COMANDA SET NOTA = ? WHERE ID = ?`, [
        nota,
        idComanda,
      ]);
    });
  }

  static async registrarMovimiento(idComanda, idArticulo, tipoNombre) {
    return withDb("Ticket.registrarMovimiento", async (db) => {
      const tipo = await db.getFirstAsync(
        `SELECT ID FROM COMANDA_MOVIMIENTO_TIPO WHERE TIPO = ? AND ACTIVO = 1`,
        [tipoNombre],
      );
      if (!tipo) return;
      await db.runAsync(
        `INSERT INTO COMANDA_MOVIMIENTOS (ID_COMANDA, ID_ARTICULO, ID_TIPO) VALUES (?, ?, ?)`,
        [idComanda, idArticulo ?? null, tipo.ID],
      );
    });
  }

  static async getPuntosImpresion() {
    return withDb("Ticket.getPuntosImpresion", async (db) => {
      return await db.getAllAsync(`SELECT * FROM PUNTOS_IMPRESION`);
    });
  }

  static async getConfiguraciones() {
    return withDb("Ticket.getConfiguraciones", async (db) => {
      return await db.getFirstAsync(`SELECT * FROM CONFIGURACIONES LIMIT 1`);
    });
  }

  static async getComplementosDisponibles(articuloUUID) {
    return withDb("Ticket.getComplementosDisponibles", async (db) => {
      const grupos = await db.getAllAsync(
        `SELECT * FROM GRUPO_COMPLEMENTOS WHERE ID_ARTICULO = ? ORDER BY POSICION`,
        [articuloUUID],
      );
      for (const grupo of grupos) {
        grupo.complementos = await db.getAllAsync(
          `SELECT * FROM COMPLEMENTO WHERE ID_GRUPO_COMP = ? ORDER BY POSICION`,
          [grupo.UUID],
        );
      }
      return grupos;
    });
  }

  /**
   * Reemplaza los complementos de un renglón y recalcula el TOTAL del artículo.
   * @param {number} idComandaArticulo
   * @param {Array<{ID_COMPLEMENTO, CANTIDAD, PRECIO_VENTA, SUBTOTAL, TOTAL}>} complementos
   * @param {{ subtotal: number, total: number }} totales
   */
  static async guardarComplementosArticulo(
    idComandaArticulo,
    complementos,
    { subtotal, total, descuento },
  ) {
    return withDb("Ticket.guardarComplementosArticulo", async (db) => {
      await db.runAsync(
        `DELETE FROM COMANDA_COMPLEMENTO WHERE ID_COMANDA_ARTICULO = ?`,
        [idComandaArticulo],
      );

      for (const complemento of complementos ?? []) {
        if (!complemento.ID_COMPLEMENTO || !(complemento.CANTIDAD > 0)) continue;
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
            complemento.ID_COMPLEMENTO,
            0,
            complemento.CANTIDAD,
            complemento.PRECIO_VENTA ?? 0,
            complemento.NOTA ?? "",
            complemento.SUBTOTAL ?? 0,
            complemento.TOTAL ?? 0,
          ],
        );
      }

      await db.runAsync(
        `UPDATE COMANDA_ARTICULO SET SUBTOTAL = ?, TOTAL = ?, DESCUENTO = ? WHERE ID = ?`,
        [subtotal, total, descuento ?? 0, idComandaArticulo],
      );
    });
  }

  static async marcarArticulosImpresos(ids) {
    if (!ids?.length) return;
    return withDb("Ticket.marcarArticulosImpresos", async (db) => {
      const placeholders = ids.map(() => "?").join(",");
      await db.runAsync(
        `UPDATE COMANDA_ARTICULO SET IMPRESO = 1 WHERE ID IN (${placeholders})`,
        ids,
      );
    });
  }
}
