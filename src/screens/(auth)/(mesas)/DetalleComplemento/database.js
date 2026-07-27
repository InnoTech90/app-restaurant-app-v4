import { withDb } from "../../../../utils/db";

export class Database {
  static async getComplementos(articuloUUID) {
    return withDb("DetalleComplemento.getComplementos", async (db) => {
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
}
