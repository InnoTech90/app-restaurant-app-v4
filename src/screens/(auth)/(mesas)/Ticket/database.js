import { withDb } from "../../../../utils/db";

export default class Database {
    // estatus
    // 0: abierta
    // 1: pagada
    // 2: cancelada
    // 3: pendiente de pago
    // 4: comanda impresa (cuenta impresa, pendiente de confirmar pago)

    static async getMesa(uuid) {
        return withDb(async (db) => {
            return await db.getFirstAsync(`SELECT * FROM MESA WHERE UUID = ?`, [uuid]);
        });
    }

    static async getCliente(id) {
        return withDb(async (db) => {
            return await db.getFirstAsync(`SELECT * FROM CLIENTES WHERE ID = ?`, [id]);
        });
    }

    static async cancelarComanda(idComanda) {
        return withDb(async (db) => {
            await db.runAsync(
                `UPDATE COMANDA SET ESTATUS = 2, ACTIVO = 0 WHERE ID = ?`,
                [idComanda]
            );
        });
    }

    static async actualizarCantidadArticulo(idRenglon, cantidad, precioVenta) {
        const total = cantidad * precioVenta;
        return withDb(async (db) => {
            await db.runAsync(
                `UPDATE COMANDA_ARTICULO SET CANTIDAD = ?, SUBTOTAL = ?, TOTAL = ? WHERE ID = ?`,
                [cantidad, total, total, idRenglon]
            );
        });
    }

    static async eliminarArticulo(idRenglon) {
        return withDb(async (db) => {
            await db.runAsync(`DELETE FROM COMANDA_COMPLEMENTO WHERE ID_COMANDA_ARTICULO = ?`, [idRenglon]);
            await db.runAsync(`DELETE FROM COMANDA_ARTICULO WHERE ID = ?`, [idRenglon]);
        });
    }

    static async imprimirTicket(idComanda) {
        return withDb(async (db) => {
            await db.runAsync(
                `UPDATE COMANDA SET CONT_IMPRESO = COALESCE(CONT_IMPRESO, 0) + 1 WHERE ID = ?`,
                [idComanda]
            );
        });
    }

    static async actualizarNota(idComanda, nota) {
        return withDb(async (db) => {
            await db.runAsync(`UPDATE COMANDA SET NOTA = ? WHERE ID = ?`, [nota, idComanda]);
        });
    }

    static async registrarMovimiento(idComanda, idArticulo, tipoNombre) {
        return withDb(async (db) => {
            const tipo = await db.getFirstAsync(
                `SELECT ID FROM COMANDA_MOVIMIENTO_TIPO WHERE TIPO = ? AND ACTIVO = 1`,
                [tipoNombre]
            );
            if (!tipo) return;
            await db.runAsync(
                `INSERT INTO COMANDA_MOVIMIENTOS (ID_COMANDA, ID_ARTICULO, ID_TIPO) VALUES (?, ?, ?)`,
                [idComanda, idArticulo ?? null, tipo.ID]
            );
        });
    }

    static async getPuntosImpresion() {
        return withDb(async (db) => {
            return await db.getAllAsync(`SELECT * FROM PUNTOS_IMPRESION`);
        });
    }

    static async getConfiguraciones() {
        return withDb(async (db) => {
            return await db.getFirstAsync(`SELECT * FROM CONFIGURACIONES LIMIT 1`);
        });
    }

    static async marcarArticulosImpresos(ids) {
        if (!ids?.length) return;
        return withDb(async (db) => {
            const placeholders = ids.map(() => '?').join(',');
            await db.runAsync(
                `UPDATE COMANDA_ARTICULO SET IMPRESO = 1 WHERE ID IN (${placeholders})`,
                ids
            );
        });
    }
}
