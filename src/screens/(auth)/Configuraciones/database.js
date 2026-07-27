import { withDb } from "../../../utils/db";

export default class Database {
  /**
   * Migraciones seguras: agrega columnas nuevas a tablas existentes.
   * Se puede llamar en cada inicio de la pantalla sin riesgo.
   */
  static async runMigraciones() {
    return withDb("Configuraciones.runMigraciones", async (db) => {
      // COMANDA_ARTICULO → columna IMPRESO
      const colsArticulo = await db.getAllAsync(
        `PRAGMA table_info(COMANDA_ARTICULO)`,
      );
      if (!colsArticulo.some((c) => c.name === "IMPRESO")) {
        await db.runAsync(
          `ALTER TABLE COMANDA_ARTICULO ADD COLUMN IMPRESO INTEGER DEFAULT 0`,
        );
      }

      // CONFIGURACIONES → columnas _ES_PCT
      const colsConfig = await db.getAllAsync(
        `PRAGMA table_info(CONFIGURACIONES)`,
      );
      const nombres = colsConfig.map((c) => c.name);

      if (!nombres.includes("COSTO_ENVIO_ES_PCT")) {
        await db.runAsync(
          `ALTER TABLE CONFIGURACIONES ADD COLUMN COSTO_ENVIO_ES_PCT INTEGER DEFAULT 0`,
        );
      }
      if (!nombres.includes("IMPUESTOS_ES_PCT")) {
        await db.runAsync(
          `ALTER TABLE CONFIGURACIONES ADD COLUMN IMPUESTOS_ES_PCT INTEGER DEFAULT 0`,
        );
      }
      if (!nombres.includes("DESCUENTOS_ES_PCT")) {
        await db.runAsync(
          `ALTER TABLE CONFIGURACIONES ADD COLUMN DESCUENTOS_ES_PCT INTEGER DEFAULT 0`,
        );
      }
    });
  }

  static async getConfiguraciones() {
    return withDb("Configuraciones.getConfiguraciones", async (db) => {
      return await db.getFirstAsync(`SELECT * FROM CONFIGURACIONES LIMIT 1`);
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
