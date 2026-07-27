import { withDb } from "../../../utils/db";

export class dataBase {
  static getConfiguracionesModel = async () => {
    return withDb("NipModal.getConfiguracionesModel", async (db) => {
      const configuraciones = await db.getAllAsync(
        `SELECT * FROM CONFIGURACIONES`,
      );
      return configuraciones;
    });
  };
}
