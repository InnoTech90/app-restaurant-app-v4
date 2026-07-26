import AsyncStorage from "@react-native-async-storage/async-storage";
import { withDb } from "../../../utils/db";

export class Database {
  static async getHistorial() {
    const qrData = await AsyncStorage.getItem("qrCode");

    return withDb("Caja.getHistorial", async (db) => {
      return await db.getAllAsync(
        `
                SELECT *
                FROM HISTORIAL_CAJA
                WHERE ID_SUCURSAL = ?
                ORDER BY FECHA DESC
                `,
        [qrData],
      );
    });
  }

  static async getNombreDispocitivo() {
    return withDb("Caja.getNombreDispositivo", async (db) => {
      const result = await db.getAllAsync(
        `
                SELECT NOMBRE_DISPOCITIVO
                FROM CONFIGURACIONES
                `,
      );

      return result.length > 0 ? result[0].NOMBRE_DISPOCITIVO : null;
    });
  }

  static async insertarApertura(params) {
    return withDb("Caja.insertarApertura", async (db) => {
      const { idSucursal, nombreDispositivo, monto } = params;

      return await db.runAsync(
        `
                INSERT INTO HISTORIAL_CAJA
                (
                    ID_SUCURSAL,
                    NOMBRE_DISPOCITIVO,
                    MONTO,
                    ESTATUS
                )
                VALUES (?, ?, ?, 1)
                `,
        [idSucursal, nombreDispositivo, monto],
      );
    });
  }

  static async cerrarCaja(id) {
    return withDb("Caja.cerrarCaja", async (db) => {
      await db.runAsync(
        `
                UPDATE HISTORIAL_CAJA
                SET ESTATUS = 0
                WHERE ID = ?
                `,
        [id],
      );
    });
  }
}
