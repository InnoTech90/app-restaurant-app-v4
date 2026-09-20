import AsyncStorage from "@react-native-async-storage/async-storage";
import { withDb } from "../../../utils/db";
import { runDatabaseMigrations } from "../../../utils/databaseMigrations";

export class Database {
  static async asegurarMigraciones() {
    return withDb("Caja.asegurarMigraciones", async (db) => {
      await runDatabaseMigrations(db);
    });
  }

  static async getHistorial() {
    const qrData = await AsyncStorage.getItem("qrCode");

    return withDb("Caja.getHistorial", async (db) => {
      await runDatabaseMigrations(db);
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
      const config = await db.getFirstAsync(
        `SELECT NOMBRE_DISPOCITIVO FROM CONFIGURACIONES LIMIT 1`,
      );
      const nombreConfig = String(config?.NOMBRE_DISPOCITIVO ?? "").trim();
      if (nombreConfig && nombreConfig !== "Dispositivo") {
        return nombreConfig;
      }

      const device = await db.getFirstAsync(
        `SELECT NOMBRE FROM DEVICE
         WHERE ACTIVO = 1 AND NOMBRE IS NOT NULL AND TRIM(NOMBRE) != ''
         LIMIT 1`,
      );
      const nombreDevice = String(device?.NOMBRE ?? "").trim();
      return nombreDevice || nombreConfig || null;
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
      await runDatabaseMigrations(db);
      await db.runAsync(
        `
                UPDATE HISTORIAL_CAJA
                SET ESTATUS = 0,
                    FECHA_CIERRE = CURRENT_TIMESTAMP
                WHERE ID = ?
                `,
        [id],
      );
    });
  }
}
