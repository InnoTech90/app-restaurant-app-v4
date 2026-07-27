import AsyncStorage from "@react-native-async-storage/async-storage";
import { withDb } from "../../../../utils/db";

export default class Database {
  // estatus
  // 0: abierta
  // 1: pagada
  // 2: cancelada
  // 3: pendiente de pago
  // 4: comanda impresa (cuenta impresa, pendiente de confirmar pago)
  static async getMenu() {
    return withDb("MenuPrincipal.getMenu", async (db) => {
      const grupos = await db.getAllAsync(
        `SELECT * FROM GRUPO_ARTICULOS ORDER BY POSICION`,
      );
      const articulos = await db.getAllAsync(
        `SELECT * FROM ARTICULO ORDER BY POSICION`,
      );
      return { grupos, articulos };
    });
  }

  static async getComandaCompleta(idMesa) {
    return withDb("MenuPrincipal.getComandaCompleta", async (db) => {
      const comanda = await db.getFirstAsync(
        `SELECT * FROM COMANDA WHERE ID_MESA = ? AND ESTATUS IN (0, 4) AND ACTIVO = 1 LIMIT 1`,
        [idMesa],
      );
      if (!comanda) return null;

      const renglones = await db.getAllAsync(
        `SELECT * FROM COMANDA_ARTICULO WHERE ID_COMANDA = ?`,
        [comanda.ID],
      );

      let totalComanda = 0;

      const articulos = await Promise.all(
        renglones.map(async (renglon) => {
          const articulo = await db.getFirstAsync(
            `SELECT * FROM ARTICULO WHERE UUID = ?`,
            [renglon.ID_ARTICULO],
          );
          const compRows = await db.getAllAsync(
            `SELECT * FROM COMANDA_COMPLEMENTO WHERE ID_COMANDA_ARTICULO = ?`,
            [renglon.ID],
          );
          const complementos = await Promise.all(
            compRows.map(async (cr) => {
              const complemento = await db.getFirstAsync(
                `SELECT * FROM COMPLEMENTO WHERE UUID = ?`,
                [cr.ID_COMPLEMENTO],
              );
              return { ...cr, complemento: complemento ?? null };
            }),
          );
          totalComanda += renglon.TOTAL ?? 0;
          return { ...renglon, articulo: articulo ?? null, complementos };
        }),
      );

      return { comanda, articulos, totalComanda };
    });
  }

  static async getCliente(id) {
    return withDb("MenuPrincipal.getCliente", async (db) => {
      return await db.getFirstAsync(`SELECT * FROM CLIENTES WHERE ID = ?`, [
        id,
      ]);
    });
  }

  static async getClientes() {
    return withDb("MenuPrincipal.getClientes", async (db) => {
      const qrData = await AsyncStorage.getItem("qrCode");
      return await db.getAllAsync(
        `SELECT * FROM CLIENTES WHERE SUCURSAL = ? ORDER BY NOMBRE ASC`,
        [qrData],
      );
    });
  }

  static async setClienteEnComanda(idComanda, idCliente) {
    return withDb("MenuPrincipal.setClienteEnComanda", async (db) => {
      return await db.runAsync(
        `UPDATE COMANDA SET ID_CLIENTE = ? WHERE ID = ?`,
        [idCliente, idComanda],
      );
    });
  }
}
