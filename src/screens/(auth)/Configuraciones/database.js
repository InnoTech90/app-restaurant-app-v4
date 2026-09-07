import { withDb } from "../../../utils/db";
import { runDatabaseMigrations } from "../../../utils/databaseMigrations";

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
