import { withDb } from "../../../../utils/db";

export class Database {
  static async getComplementos(articuloUUID) {
    return withDb("DetalleComplemento.getComplementos", async (db) => {
      const id = String(articuloUUID ?? "").trim();
      if (!id) return [];

      let grupos = await db.getAllAsync(
        `SELECT * FROM GRUPO_COMPLEMENTOS WHERE ID_ARTICULO = ? ORDER BY POSICION`,
        [id],
      );

      if (!grupos?.length && /^\d+$/.test(id)) {
        const art = await db.getFirstAsync(
          `SELECT UUID FROM ARTICULO WHERE ID = ?`,
          [Number(id)],
        );
        if (art?.UUID) {
          grupos = await db.getAllAsync(
            `SELECT * FROM GRUPO_COMPLEMENTOS WHERE ID_ARTICULO = ? ORDER BY POSICION`,
            [art.UUID],
          );
        }
      }

      if (!grupos?.length) {
        const art = await db.getFirstAsync(
          `SELECT UUID FROM ARTICULO WHERE UUID = ? OR CAST(ID AS TEXT) = ? LIMIT 1`,
          [id, id],
        );
        if (art?.UUID && art.UUID !== id) {
          grupos = await db.getAllAsync(
            `SELECT * FROM GRUPO_COMPLEMENTOS WHERE ID_ARTICULO = ? ORDER BY POSICION`,
            [art.UUID],
          );
        }
      }

      for (const grupo of grupos ?? []) {
        const grupoId = grupo.UUID ?? grupo.ID;
        grupo.complementos = await db.getAllAsync(
          `SELECT * FROM COMPLEMENTO
           WHERE ID_GRUPO_COMP = ? OR ID_GRUPO_COMP = ?
           ORDER BY POSICION`,
          [String(grupo.UUID ?? ""), String(grupoId ?? "")],
        );
      }
      return grupos ?? [];
    });
  }
}
