import * as Device from "expo-device";
import { withDb } from "../../../utils/db";
import { runDatabaseMigrations } from "../../../utils/databaseMigrations";

function obtenerNombreDispositivoLocal() {
  const candidatos = [
    Device.deviceName,
    Device.modelName,
    [Device.brand, Device.modelName].filter(Boolean).join(" "),
  ];
  for (const c of candidatos) {
    const nombre = String(c ?? "").trim();
    if (nombre) return nombre;
  }
  return "";
}

export default class Database {
  /**
   * Migraciones seguras: agrega columnas nuevas a tablas existentes.
   * Se puede llamar en cada inicio de la pantalla sin riesgo.
   */
  static async runMigraciones() {
    return withDb("Configuraciones.runMigraciones", async (db) => {
      await runDatabaseMigrations(db);
    });
  }

  static async getConfiguraciones() {
    return withDb("Configuraciones.getConfiguraciones", async (db) => {
      const config = await db.getFirstAsync(
        `SELECT * FROM CONFIGURACIONES LIMIT 1`,
      );
      if (!config) return null;

      const nombreActual = String(config.NOMBRE_DISPOCITIVO ?? "").trim();
      if (nombreActual && nombreActual !== "Dispositivo") {
        return config;
      }

      const device = await db.getFirstAsync(
        `SELECT NOMBRE FROM DEVICE
         WHERE ACTIVO = 1 AND NOMBRE IS NOT NULL AND TRIM(NOMBRE) != ''
         LIMIT 1`,
      );
      let nombreReal = String(device?.NOMBRE ?? "").trim();
      if (!nombreReal || nombreReal === "Dispositivo") {
        nombreReal = obtenerNombreDispositivoLocal();
      }

      if (nombreReal && nombreReal !== "Dispositivo") {
        config.NOMBRE_DISPOCITIVO = nombreReal;
        await db.runAsync(
          `UPDATE CONFIGURACIONES SET NOMBRE_DISPOCITIVO = ? WHERE ROWID = (
             SELECT ROWID FROM CONFIGURACIONES LIMIT 1
           )`,
          [nombreReal],
        );
      }

      return config;
    });
  }

  static async getFormatosPago() {
    return withDb("Configuraciones.getFormatosPago", async (db) => {
      return await db.getAllAsync(
        `SELECT * FROM METODO_PAGO WHERE ACTIVO = 1 ORDER BY ID ASC`,
      );
    });
  }

  static async getTamañoFuentes() {
    return withDb("Configuraciones.getTamañoFuentes", async (db) => {
      return await db.getAllAsync(
        `SELECT * FROM TAMAÑO_FUENTES WHERE ACTIVO = 1 ORDER BY ID ASC`,
      );
    });
  }

  /** Actualiza un campo de la fila única de CONFIGURACIONES */
  static async updateConfiguracion(campo, valor) {
    return withDb("Configuraciones.updateConfiguracion", async (db) => {
      await db.runAsync(`UPDATE CONFIGURACIONES SET ${campo} = ?`, [valor]);
    });
  }
}
