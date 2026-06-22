import { getDb } from "../../../utils/db";

export class Database {
    /**
     * Trae todas las categorías de gasto con la cantidad de conceptos asociados.
     * Es la query principal de la vista (equivalente a getMateriasPrimas en Inventarios).
     */
    static async getGastos() {
        const db = await getDb();
        return await db.getAllAsync(
            `SELECT
                CG.ID,
                CG.UUID,
                CG.NOMBRE,
                CG.DESCRIPCION,
                CG.SINCRONIZADO,
                COUNT(CN.ID) AS NUM_CONCEPTOS
             FROM CATEGORIA_GASTO CG
             LEFT JOIN CONCEPTO_GASTO CN ON CN.ID_CATEGORIA = CG.UUID
             GROUP BY CG.ID
             ORDER BY CG.NOMBRE ASC`
        );
    }

    /** Conceptos de una categoría (para la vista detalle / agregar) */
    static async getConceptosByCategoria(idCategoria) {
        const db = await getDb();
        return await db.getAllAsync(
            `SELECT * FROM CONCEPTO_GASTO WHERE ID_CATEGORIA = ? ORDER BY NOMBRE ASC`,
            [idCategoria]
        );
    }

    /**
     * Trae todas las categorías con sus conceptos, total acumulado y flag de pendientes.
     * TIENE_PENDIENTES = 1 si algún REGISTRO_GASTO del concepto no está sincronizado.
     */
    static async getGastosConConceptos() {
        const db = await getDb();
        // Migración defensiva: añade SINCRONIZADO si la tabla no la tiene aún
        try {
            await db.runAsync(`ALTER TABLE REGISTRO_GASTO ADD COLUMN SINCRONIZADO INTEGER DEFAULT 0`);
        } catch (_) { /* columna ya existe */ }
        const categorias = await db.getAllAsync(
            `SELECT ID, UUID, NOMBRE, DESCRIPCION, SINCRONIZADO
             FROM CATEGORIA_GASTO
             ORDER BY NOMBRE ASC`
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
                [cat.UUID]
            );
        }
        return categorias;
    }

    /** Historial de registros de un concepto de gasto */
    static async getRegistrosByConcepto(idConcepto) {
        const db = await getDb();
        return await db.getAllAsync(
            `SELECT ID, MONTO, FECHA, NOTA
             FROM REGISTRO_GASTO
             WHERE ID_CONCEPTO = ?
             ORDER BY ID DESC`,
            [idConcepto]
        );
    }

    /** Inserta un registro de pago de gasto (SINCRONIZADO = 0, fecha en ISO 8601) */
    static async insertRegistro({ idConcepto, monto, nota }) {
        const db = await getDb();
        const fecha = new Date().toISOString();
        await db.runAsync(
            `INSERT INTO REGISTRO_GASTO (ID_CONCEPTO, MONTO, FECHA, NOTA, SINCRONIZADO)
             VALUES (?, ?, ?, ?, 0)`,
            [idConcepto, monto, fecha, nota || null]
        );
    }

    /** Registros pendientes de sincronizar con UUID de grupo y concepto */
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
             WHERE R.SINCRONIZADO = 0`
        );
    }

    /** Marca un lote de registros como SINCRONIZADO = 1 */
    static async marcarRegistrosSincronizados(ids) {
        if (!ids || ids.length === 0) return;
        const db = await getDb();
        const placeholders = ids.map(() => "?").join(",");
        await db.runAsync(
            `UPDATE REGISTRO_GASTO SET SINCRONIZADO = 1 WHERE ID IN (${placeholders})`,
            ids
        );
    }

    /** Inserta una nueva categoría de gasto creada localmente (SINCRONIZADO = 0) */
    static async insertGasto({ nombre, descripcion }) {
        const db = await getDb();
        const uuid = `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        await db.runAsync(
            `INSERT INTO CATEGORIA_GASTO (UUID, NOMBRE, DESCRIPCION, SINCRONIZADO)
             VALUES (?, ?, ?, 0)`,
            [uuid, nombre, descripcion || null]
        );
    }
}
