import { withDb } from "../../../utils/db";

export default class InventariosDatabase {
    /** Trae todas las materias primas con su info de sucursal y unidad de medida */
    static async getMateriasPrimas() {
        return withDb(async (db) => {
            // Migración defensiva: columna STOCK_ANTERIOR para calcular delta al sincronizar
            try { await db.runAsync(`ALTER TABLE MATERIA_PRIMA_SUCURSAL ADD COLUMN STOCK_ANTERIOR REAL`); }
            catch (_) { /* ya existe */ }
            return db.getAllAsync(`
                SELECT
                    mp.UUID,
                    mp.NOMBRE,
                    mps.ID              AS ID_SUCURSAL_ROW,
                    mps.UUID            AS UUID_SUCURSAL,
                    mps.STOCK_ACTUAL,
                    mps.STOCK_ANTERIOR,
                    mps.STOCK_MINIMO,
                    mps.STOCK_MAXIMO,
                    um.UUID             AS UUID_UNIDAD,
                    um.NOMBRE           AS UNIDAD_NOMBRE,
                    um.ABREVIACION      AS UNIDAD_ABREVIACION,
                    mps.SINCRONIZADO
                FROM MATERIA_PRIMA mp
                LEFT JOIN MATERIA_PRIMA_SUCURSAL mps ON mps.ID_MATERIA_PRIMA = mp.UUID
                LEFT JOIN UNIDAD_MEDIDA um ON um.UUID = mps.ID_UNIDAD_MEDIDA
                ORDER BY mp.NOMBRE ASC
            `);
        });
    }

    /** Actualiza el stock guardando el anterior para determinar incremento/decremento */
    static async actualizarStock(uuidSucursal, nuevoStock) {
        return withDb(async (db) => {
            const row = await db.getFirstAsync(
                `SELECT STOCK_ACTUAL FROM MATERIA_PRIMA_SUCURSAL WHERE UUID = ?`,
                [uuidSucursal]
            );
            const stockAnterior = row?.STOCK_ACTUAL ?? nuevoStock;
            await db.runAsync(
                `UPDATE MATERIA_PRIMA_SUCURSAL
                 SET STOCK_ACTUAL = ?, STOCK_ANTERIOR = ?, SINCRONIZADO = 0
                 WHERE UUID = ?`,
                [nuevoStock, stockAnterior, uuidSucursal]
            );
        });
    }

    /** Registros pendientes de sincronizar con UUID del tipo de movimiento */
    static async getPendientesSincronizar() {
        return withDb(async (db) => {
            return db.getAllAsync(`
                SELECT
                    mps.UUID            AS rawMaterialBranchId,
                    mps.STOCK_ACTUAL    AS stockActual,
                    mps.STOCK_ANTERIOR  AS stockAnterior
                FROM MATERIA_PRIMA_SUCURSAL mps
                WHERE mps.SINCRONIZADO = 0
            `);
        });
    }

    /** UUID del tipo de movimiento por code (ej. "IN-APP" o "OUT-APP") */
    static async getTipoMovimientoByCode(code) {
        return withDb(async (db) => {
            // Crea la tabla si aún no existe (dispositivos que no han pasado por PantallaDeCarga)
            await db.runAsync(`
                CREATE TABLE IF NOT EXISTS TIPO_MOVIMIENTO_INVENTARIO (
                    ID     INTEGER PRIMARY KEY AUTOINCREMENT,
                    UUID   NVARCHAR UNIQUE,
                    NOMBRE NVARCHAR,
                    CODE   NVARCHAR UNIQUE,
                    FACTOR INTEGER
                )
            `);
            return db.getFirstAsync(
                `SELECT UUID FROM TIPO_MOVIMIENTO_INVENTARIO WHERE CODE = ?`,
                [code]
            );
        });
    }

    /** Marca una lista de UUIDs de MATERIA_PRIMA_SUCURSAL como SINCRONIZADO = 1 */
    static async marcarSincronizados(uuids) {
        if (!uuids?.length) return;
        return withDb(async (db) => {
            const ph = uuids.map(() => "?").join(",");
            await db.runAsync(
                `UPDATE MATERIA_PRIMA_SUCURSAL SET SINCRONIZADO = 1 WHERE UUID IN (${ph})`,
                uuids
            );
        });
    }
}
