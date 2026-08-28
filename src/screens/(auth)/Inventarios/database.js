import { withDb } from "../../../utils/db";

export default class InventariosDatabase {
  /** Trae todas las materias primas con su info de sucursal y unidad de medida */
  static async getMateriasPrimas() {
    return withDb("Inventarios.getMateriasPrimas", async (db) => {
      // Migración defensiva: columna STOCK_ANTERIOR para calcular delta al sincronizar
      try {
        await db.runAsync(
          `ALTER TABLE MATERIA_PRIMA_SUCURSAL ADD COLUMN STOCK_ANTERIOR REAL`,
        );
      } catch {
        /* ya existe */
      }
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
    return withDb("Inventarios.actualizarStock", async (db) => {
      if (!uuidSucursal) {
        throw new Error("No se encontró el identificador de la materia prima.");
      }

      if (!Number.isFinite(nuevoStock) || nuevoStock < 0) {
        throw new Error("El stock debe ser un número mayor o igual a cero.");
      }

      const row = await db.getFirstAsync(
        `SELECT STOCK_ACTUAL FROM MATERIA_PRIMA_SUCURSAL WHERE UUID = ?`,
        [uuidSucursal],
      );

      if (!row) {
        throw new Error(
          "La materia prima no existe en la base de datos local.",
        );
      }

      await db.runAsync(
        `UPDATE MATERIA_PRIMA_SUCURSAL
                 SET STOCK_ACTUAL = ?, STOCK_ANTERIOR = ?, SINCRONIZADO = 0
                 WHERE UUID = ?`,
        [nuevoStock, row.STOCK_ACTUAL, uuidSucursal],
      );

      return db.getFirstAsync(
        `SELECT UUID, STOCK_ACTUAL, STOCK_ANTERIOR, SINCRONIZADO
         FROM MATERIA_PRIMA_SUCURSAL
         WHERE UUID = ?`,
        [uuidSucursal],
      );
    });
  }

  /** Registros pendientes de sincronizar con UUID del tipo de movimiento */
  static async getPendientesSincronizar() {
    return withDb("Inventarios.getPendientesSincronizar", async (db) => {
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

  /** Cantidad de movimientos locales que todavía no se han enviado a la API. */
  static async getCantidadPendientes() {
    return withDb("Inventarios.getCantidadPendientes", async (db) => {
      const row = await db.getFirstAsync(
        `SELECT COUNT(*) AS cantidad
         FROM MATERIA_PRIMA_SUCURSAL
         WHERE SINCRONIZADO = 0`,
      );

      return Number(row?.cantidad ?? 0);
    });
  }

  /** UUID del tipo de movimiento por code (ej. "IN-APP" o "OUT-APP") */
  static async getTipoMovimientoByCode(code) {
    return withDb("Inventarios.getTipoMovimientoByCode", async (db) => {
      // La tabla TIPO_MOVIMIENTO_INVENTARIO es creada por DatabaseInitializer
      // No crear tabla aquí para evitar duplicación
      return db.getFirstAsync(
        `SELECT UUID FROM TIPO_MOVIMIENTO_INVENTARIO WHERE CODE = ?`,
        [code],
      );
    });
  }

  /** Marca una lista de UUIDs de MATERIA_PRIMA_SUCURSAL como SINCRONIZADO = 1 */
  static async marcarSincronizados(uuids) {
    if (!uuids?.length) return;
    return withDb("Inventarios.marcarSincronizados", async (db) => {
      const ph = uuids.map(() => "?").join(",");
      await db.runAsync(
        `UPDATE MATERIA_PRIMA_SUCURSAL SET SINCRONIZADO = 1 WHERE UUID IN (${ph})`,
        uuids,
      );
    });
  }
}
