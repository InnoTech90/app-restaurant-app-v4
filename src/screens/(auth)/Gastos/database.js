import { getDb } from "../../../utils/db";

const toFechaIso = (fecha) => {
  if (fecha instanceof Date) return fecha.toISOString();
  if (fecha) return new Date(fecha).toISOString();
  return new Date().toISOString();
};

export class Database {
  /**
   * Jerarquía: categoría → conceptos → registros (gastos).
   * TOTAL por concepto y por categoría (suma de montos).
   */
  static async getGastosConConceptos() {
    const db = await getDb();
    try {
      await db.runAsync(
        `ALTER TABLE REGISTRO_GASTO ADD COLUMN SINCRONIZADO INTEGER DEFAULT 0`,
      );
    } catch (_) {
      /* columna ya existe */
    }

    const categorias = await db.getAllAsync(
      `SELECT ID, UUID, NOMBRE, DESCRIPCION, SINCRONIZADO
             FROM CATEGORIA_GASTO
             ORDER BY NOMBRE ASC`,
    );

    for (const cat of categorias) {
      cat.conceptos = await db.getAllAsync(
        `SELECT
                    CN.ID,
                    CN.UUID,
                    CN.NOMBRE,
                    CN.DESCRIPCION,
                    CN.PRECIO,
                    CN.SINCRONIZADO,
                    COALESCE(SUM(R.MONTO), 0) AS TOTAL,
                    MAX(CASE WHEN R.SINCRONIZADO = 0 THEN 1 ELSE 0 END) AS TIENE_PENDIENTES
                 FROM CONCEPTO_GASTO CN
                 LEFT JOIN REGISTRO_GASTO R ON R.ID_CONCEPTO = CN.UUID
                 WHERE CN.ID_CATEGORIA = ?
                 GROUP BY CN.ID
                 ORDER BY CN.NOMBRE ASC`,
        [cat.UUID],
      );

      let totalCat = 0;
      for (const concepto of cat.conceptos) {
        totalCat += Number(concepto.TOTAL ?? 0);
        concepto.registros = await db.getAllAsync(
          `SELECT ID, ID_CONCEPTO, MONTO, FECHA, NOTA, SINCRONIZADO
                     FROM REGISTRO_GASTO
                     WHERE ID_CONCEPTO = ?
                     ORDER BY FECHA DESC, ID DESC`,
          [concepto.UUID],
        );
      }
      cat.TOTAL = totalCat;
    }

    return categorias;
  }

  static async getRegistrosByConcepto(idConcepto) {
    const db = await getDb();
    return await db.getAllAsync(
      `SELECT ID, ID_CONCEPTO, MONTO, FECHA, NOTA, SINCRONIZADO
             FROM REGISTRO_GASTO
             WHERE ID_CONCEPTO = ?
             ORDER BY FECHA DESC, ID DESC`,
      [idConcepto],
    );
  }

  static async getRegistroById(id) {
    const db = await getDb();
    return await db.getFirstAsync(
      `SELECT
                R.ID,
                R.ID_CONCEPTO,
                R.MONTO,
                R.FECHA,
                R.NOTA,
                R.SINCRONIZADO,
                CN.NOMBRE AS NOMBRE_CONCEPTO,
                CG.NOMBRE AS NOMBRE_CATEGORIA
             FROM REGISTRO_GASTO R
             JOIN CONCEPTO_GASTO CN ON CN.UUID = R.ID_CONCEPTO
             JOIN CATEGORIA_GASTO CG ON CG.UUID = CN.ID_CATEGORIA
             WHERE R.ID = ?`,
      [id],
    );
  }

  static async insertRegistro({ idConcepto, monto, nota, fecha }) {
    if (!idConcepto) throw new Error("idConcepto es requerido");
    const db = await getDb();
    await db.runAsync(
      `INSERT INTO REGISTRO_GASTO (ID_CONCEPTO, MONTO, FECHA, NOTA, SINCRONIZADO)
             VALUES (?, ?, ?, ?, 0)`,
      [idConcepto, monto, toFechaIso(fecha), nota || null],
    );
  }

  static async updateRegistro({ id, monto, nota, fecha }) {
    if (!id) throw new Error("id de registro es requerido");
    const db = await getDb();
    await db.runAsync(
      `UPDATE REGISTRO_GASTO
             SET MONTO = ?, FECHA = ?, NOTA = ?, SINCRONIZADO = 0
             WHERE ID = ?`,
      [monto, toFechaIso(fecha), nota || null, id],
    );
  }

  static async deleteRegistro(id) {
    if (!id) throw new Error("id de registro es requerido");
    const db = await getDb();
    await db.runAsync(`DELETE FROM REGISTRO_GASTO WHERE ID = ?`, [id]);
  }

  static async getRegistrosPendientes() {
    const db = await getDb();
    return await db.getAllAsync(
      `SELECT
                R.ID,
                R.MONTO,
                R.FECHA,
                R.NOTA,
                CG.UUID AS GRUPO_UUID,
                CN.UUID AS CONCEPTO_UUID
             FROM REGISTRO_GASTO R
             JOIN CONCEPTO_GASTO CN ON CN.UUID = R.ID_CONCEPTO
             JOIN CATEGORIA_GASTO CG ON CG.UUID = CN.ID_CATEGORIA
             WHERE R.SINCRONIZADO = 0`,
    );
  }

  static async marcarRegistrosSincronizados(ids) {
    if (!ids || ids.length === 0) return;
    const db = await getDb();
    const placeholders = ids.map(() => "?").join(",");
    await db.runAsync(
      `UPDATE REGISTRO_GASTO SET SINCRONIZADO = 1 WHERE ID IN (${placeholders})`,
      ids,
    );
  }
}
