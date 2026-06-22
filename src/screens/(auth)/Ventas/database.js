import { withDb } from "../../../utils/db";

export default class VentasDatabase {
    /**
     * Trae todas las comandas finalizadas (ESTATUS > 0, ACTIVO = 0).
     * Incluye nombre de mesa y cliente.
     * ESTATUS 1 = Pagado, 2 = Pendiente, 3 = Cancelado
     */
    static async getVentas() {
        return withDb(async (db) => {
            const rows = await db.getAllAsync(
                `SELECT
                    c.ID,
                    c.FICHA,
                    c.FECHA,
                    c.ESTATUS,
                    c.TOTAL,
                    c.SUBTOTAL,
                    c.DESCUENTO,
                    c.PROPINA,
                    c.COSTO_ENVIO,
                    c.FORMATO_PAGO,
                    c.NOTA,
                    c.SINCRONIZADO,
                    c.ID_CLIENTE,
                    c.ID_MESA,
                    m.NOMBRE AS MESA_NOMBRE,
                    cl.NOMBRE AS CLIENTE_NOMBRE,
                    (SELECT COUNT(*) FROM COMANDA_ARTICULO ca WHERE ca.ID_COMANDA = c.ID) AS NUM_ARTICULOS
                FROM COMANDA c
                LEFT JOIN MESA m ON c.ID_MESA = m.UUID
                LEFT JOIN CLIENTES cl ON c.ID_CLIENTE = cl.ID
                WHERE c.ACTIVO = 0 AND c.ESTATUS > 0
                ORDER BY c.ID DESC`
            );
            return rows;
        });
    }

    /**
     * Datos completos de una venta específica, con sus artículos y complementos.
     */
    static async getDetalleVenta(idComanda) {
        return withDb(async (db) => {
            const comanda = await db.getFirstAsync(
                `SELECT
                    c.*,
                    m.NOMBRE AS MESA_NOMBRE,
                    cl.NOMBRE AS CLIENTE_NOMBRE
                FROM COMANDA c
                LEFT JOIN MESA m ON c.ID_MESA = m.UUID
                LEFT JOIN CLIENTES cl ON c.ID_CLIENTE = cl.ID
                WHERE c.ID = ?`,
                [idComanda]
            );
            if (!comanda) return null;

            const articulos = await db.getAllAsync(
                `SELECT
                    ca.*,
                    a.NOMBRE AS ARTICULO_NOMBRE,
                    a.PRECIO AS ARTICULO_PRECIO
                FROM COMANDA_ARTICULO ca
                LEFT JOIN ARTICULO a ON ca.ID_ARTICULO = a.UUID
                WHERE ca.ID_COMANDA = ?
                ORDER BY ca.ID ASC`,
                [idComanda]
            );

            const articulosConComplementos = await Promise.all(
                articulos.map(async (art) => {
                    const complementos = await db.getAllAsync(
                        `SELECT cc.*, comp.NOMBRE AS COMP_NOMBRE, comp.PRECIO AS COMP_PRECIO
                         FROM COMANDA_COMPLEMENTO cc
                         LEFT JOIN COMPLEMENTO comp ON cc.ID_COMPLEMENTO = comp.UUID
                         WHERE cc.ID_COMANDA_ARTICULO = ?`,
                        [art.ID]
                    );
                    return { ...art, complementos };
                })
            );

            return { comanda, articulos: articulosConComplementos };
        });
    }

    /**
     * Datos consolidados para el corte de ventas (resumen y general).
     * Solo incluye comandas ESTATUS = 1 (pagadas).
     */
    static async getDatosCorte() {
        return withDb(async (db) => {
            // Info de sucursal
            const sucursal = await db.getFirstAsync(`SELECT * FROM SUCURSAL LIMIT 1`);

            // Ventas por categoría (agrupadas por PUNTO_IMPRESION del artículo)
            const porCategoria = await db.getAllAsync(`
                SELECT
                    COALESCE(a.PUNTO_IMPRESION, '') AS PUNTO_UUID,
                    COALESCE(pi.NOMBRE, 'Sin grupo')  AS PUNTO_NOMBRE,
                    SUM(ca.TOTAL)                      AS TOTAL_VENDIDO
                FROM COMANDA c
                JOIN COMANDA_ARTICULO ca ON ca.ID_COMANDA = c.ID
                LEFT JOIN ARTICULO a ON ca.ID_ARTICULO = a.UUID
                LEFT JOIN PUNTOS_IMPRESION pi ON pi.UUID = a.PUNTO_IMPRESION
                WHERE c.ESTATUS = 1 AND c.ACTIVO = 0
                GROUP BY COALESCE(a.PUNTO_IMPRESION, ''), COALESCE(pi.NOMBRE, 'Sin grupo')
                ORDER BY PUNTO_NOMBRE ASC
            `);

            // Formas de pago
            const formasPago = await db.getAllAsync(`
                SELECT
                    COALESCE(FORMATO_PAGO, 'Sin método') AS METODO,
                    SUM(TOTAL)                            AS TOTAL
                FROM COMANDA
                WHERE ESTATUS = 1 AND ACTIVO = 0
                GROUP BY COALESCE(FORMATO_PAGO, 'Sin método')
                ORDER BY TOTAL DESC
            `);

            // Adicionales y totales generales
            const adicionales = await db.getFirstAsync(`
                SELECT
                    SUM(COALESCE(PROPINA, 0))              AS TOTAL_PROPINAS,
                    SUM(ABS(COALESCE(DESCUENTO, 0)))       AS TOTAL_DESCUENTOS,
                    SUM(COALESCE(COSTO_ENVIO, 0))          AS TOTAL_ENVIO,
                    SUM(COALESCE(TOTAL, 0))                AS TOTAL_GENERAL,
                    COUNT(*)                               AS NUM_VENTAS
                FROM COMANDA
                WHERE ESTATUS = 1 AND ACTIVO = 0
            `);

            // Total en efectivo
            const efectivoRow = await db.getFirstAsync(`
                SELECT SUM(TOTAL) AS TOTAL_EFECTIVO
                FROM COMANDA
                WHERE ESTATUS = 1 AND ACTIVO = 0
                  AND LOWER(COALESCE(FORMATO_PAGO, '')) LIKE '%efectivo%'
            `);

            // Lista individual de tickets (para ticket general)
            const ventas = await db.getAllAsync(`
                SELECT FICHA, FECHA, TOTAL, FORMATO_PAGO
                FROM COMANDA
                WHERE ESTATUS = 1 AND ACTIVO = 0
                ORDER BY FECHA ASC
            `);

            // Apertura de caja: la más reciente con ESTATUS = 1 (abierta)
            const aperturaCaja = await db.getFirstAsync(`
                SELECT MONTO, FECHA, NOMBRE_DISPOCITIVO
                FROM HISTORIAL_CAJA
                WHERE ESTATUS = 1
                ORDER BY FECHA DESC
                LIMIT 1
            `);

            return {
                sucursal,

                porCategoria,
                formasPago,
                adicionales,
                ventas,
                totalEfectivo: efectivoRow?.TOTAL_EFECTIVO ?? 0,
                aperturaCaja: aperturaCaja ?? null,
            };
        });
    }

    /**
     * Datos del dispositivo, negocio y sucursal activos (una sola fila de cada tabla).
     */
    static async getDatosDispositivo() {
        return withDb(async (db) => {
            const negocio = await db.getFirstAsync(`SELECT UUID FROM NEGOCIO LIMIT 1`);
            const sucursal = await db.getFirstAsync(`SELECT UUID FROM SUCURSAL LIMIT 1`);
            const device = await db.getFirstAsync(`SELECT UUID FROM DEVICE LIMIT 1`);
            return {
                businessId: negocio?.UUID ?? null,
                branchId: sucursal?.UUID ?? null,
                deviceId: device?.UUID ?? null,
            };
        });
    }

    /**
     * Comandas finalizadas (Pagadas = 1 o Canceladas = 3) que aún NO están sincronizadas,
     * con todos sus artículos y complementos.
     */
    static async getVentasParaSincronizar() {
        return withDb(async (db) => {
            const comandas = await db.getAllAsync(
                `SELECT
                    c.*,
                    m.UUID   AS MESA_UUID,
                    cl.UUID  AS DINER_UUID
                FROM COMANDA c
                LEFT JOIN MESA m    ON m.UUID  = c.ID_MESA
                LEFT JOIN CLIENTES cl ON cl.ID = c.ID_CLIENTE
                WHERE c.ACTIVO = 0
                  AND (c.ESTATUS = 1 OR c.ESTATUS = 3)
                  AND (c.SINCRONIZADO IS NULL OR c.SINCRONIZADO = 0)
                ORDER BY c.ID ASC`
            );

            const result = [];
            for (const comanda of comandas) {
                const articulos = await db.getAllAsync(
                    `SELECT
                        ca.ID,
                        ca.ID_ARTICULO,
                        a.UUID AS ARTICULO_UUID,
                        ca.CANTIDAD,
                        ca.PRECIO_VENTA,
                        ca.SUBTOTAL,
                        ca.TOTAL,
                        ca.NOTA
                     FROM COMANDA_ARTICULO ca
                     LEFT JOIN ARTICULO a ON a.UUID = ca.ID_ARTICULO
                     WHERE ca.ID_COMANDA = ?
                     ORDER BY ca.ID ASC`,
                    [comanda.ID]
                );

                const articulosConComplementos = await Promise.all(
                    articulos.map(async (art) => {
                        const complementos = await db.getAllAsync(
                            `SELECT
                                cc.ID_COMPLEMENTO,
                                comp.UUID AS COMPLEMENTO_UUID,
                                cc.CANTIDAD,
                                cc.PRECIO_VENTA,
                                cc.SUBTOTAL,
                                cc.TOTAL,
                                cc.NOTA
                             FROM COMANDA_COMPLEMENTO cc
                             LEFT JOIN COMPLEMENTO comp ON comp.UUID = cc.ID_COMPLEMENTO
                             WHERE cc.ID_COMANDA_ARTICULO = ?`,
                            [art.ID]
                        );
                        return { ...art, complementos };
                    })
                );

                const pagos = await db.getAllAsync(
                    `SELECT  mp.UUID AS ID_METODO_PAGO, cp.CANTIDAD
                     FROM COMANDA_PAGOS cp
                     LEFT JOIN METODO_PAGO mp ON mp.ID = cp.ID_METODO_PAGO
                     WHERE cp.ID_COMANDA = ?`,
                    [comanda.ID]
                );

                result.push({ ...comanda, articulos: articulosConComplementos, pagos });
            }

            return result;
        });
    }

    /**
     * Marca un conjunto de comandas como sincronizadas (SINCRONIZADO = 1).
     */
    static async marcarComoSincronizadas(ids) {
        if (!ids || ids.length === 0) return;
        return withDb(async (db) => {
            const placeholders = ids.map(() => '?').join(',');
            await db.runAsync(
                `UPDATE COMANDA SET SINCRONIZADO = 1 WHERE ID IN (${placeholders})`,
                ids
            );
        });
    }
}
