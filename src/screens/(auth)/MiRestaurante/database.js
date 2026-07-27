import { withDb } from "../../../utils/db";

export class Database {
  static async getGeneralData() {
    return withDb("MiRestaurante.getGeneralData", async (db) => {
      const device = await db.getAllAsync(`SELECT * FROM DEVICE`);
      const sucursal = await db.getAllAsync(`SELECT * FROM SUCURSAL`);
      const negocio = await db.getAllAsync(`SELECT * FROM NEGOCIO`);
      const plan = await db.getAllAsync(`SELECT * FROM PLAN`);

      return { device, sucursal, negocio, plan };
    });
  }
}
