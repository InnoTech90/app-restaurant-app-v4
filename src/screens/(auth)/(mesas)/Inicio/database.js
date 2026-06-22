import { withDb } from "../../../../utils/db";

export class Database {
    // estatus
    // 0: abierta
    // 1: pagada
    // 2: cancelada
    // 3: pendiente de pago
    // 4: comanda impresa (cuenta impresa, pendiente de confirmar pago)
    /** Devuelve todas las mesas con el campo TIENE_COMANDA_ACTIVA (1/0) */
    static async getMesas() {
        return withDb(async (db) => {
            const mesas = await db.getAllAsync(`
                SELECT
                    M.*,
                    CASE WHEN C.ID IS NOT NULL THEN 1 ELSE 0 END AS TIENE_COMANDA_ACTIVA
                FROM MESA M
                LEFT JOIN COMANDA C
                    ON C.ID_MESA = M.UUID
                    AND C.ESTATUS IN (0, 4)
                    AND C.ACTIVO = 1
                ORDER BY M.ID
            `);
            return mesas;
        });
    }

    static async getComandaAbierta(idMesa) {
        return withDb(async (db) => {
            const comanda = await db.getFirstAsync(
                `SELECT * FROM COMANDA WHERE ID_MESA = ? AND ESTATUS IN (0, 4) AND ACTIVO = 1 LIMIT 1`,
                [idMesa]
            );
            return comanda;
        });
    }
}