import { withDb } from "../../../../utils/db";

export default class Database {
  // estatus
  // 0: abierta
  // 1: pagada
  // 2: cancelada
  // 3: pendiente de pago
  // 4: comanda impresa (cuenta impresa, pendiente de confirmar pago)
  static async getArticulosComanda(idComanda) {
    return withDb("Pago.getArticulosComanda", async (db) => {
      const renglones = await db.getAllAsync(
        `SELECT ca.* FROM COMANDA_ARTICULO ca WHERE ca.ID_COMANDA = ? ORDER BY ca.ID ASC`,
        [idComanda],
      );
      return Promise.all(
        renglones.map(async (renglon) => {
          const articulo = await db.getFirstAsync(
            `SELECT * FROM ARTICULO WHERE UUID = ?`,
            [renglon.ID_ARTICULO],
          );
          const compRows = await db.getAllAsync(
            `SELECT cc.*, c.NOMBRE as COMP_NOMBRE, c.PRECIO as COMP_PRECIO
                         FROM COMANDA_COMPLEMENTO cc
                         LEFT JOIN COMPLEMENTO c ON cc.ID_COMPLEMENTO = c.UUID
                         WHERE cc.ID_COMANDA_ARTICULO = ?`,
            [renglon.ID],
          );
          return {
            ...renglon,
            articulo: articulo ?? null,
            complementos: compRows,
          };
        }),
      );
    });
  }

  static async getMesa(uuid) {
    return withDb("Pago.getMesa", async (db) => {
      return await db.getFirstAsync(`SELECT * FROM MESA WHERE UUID = ?`, [
        uuid,
      ]);
    });
  }

  static async getComandaActivaPorMesa(idMesa) {
    return withDb("Pago.getComandaActivaPorMesa", async (db) => {
      return await db.getFirstAsync(
        `SELECT * FROM COMANDA WHERE ID_MESA = ? AND ESTATUS IN (0, 4) AND ACTIVO = 1 LIMIT 1`,
        [idMesa],
      );
    });
  }

  /** Marca la comanda como "cuenta impresa" (estatus 4). */
  static async setComandaImpresa(idComanda) {
    return withDb("Pago.setComandaImpresa", async (db) => {
      await db.runAsync(`UPDATE COMANDA SET ESTATUS = 4 WHERE ID = ?`, [
        idComanda,
      ]);
    });
  }

  /** Desbloquea la comanda volviendo al estatus abierta (0). */
  static async setComandaAbierta(idComanda) {
    return withDb("Pago.setComandaAbierta", async (db) => {
      await db.runAsync(`UPDATE COMANDA SET ESTATUS = 0 WHERE ID = ?`, [
        idComanda,
      ]);
    });
  }

  static async getCliente(id) {
    return withDb("Pago.getCliente", async (db) => {
      return await db.getFirstAsync(`SELECT * FROM CLIENTES WHERE ID = ?`, [
        id,
      ]);
    });
  }

  static async getComanda(id) {
    return withDb("Pago.getComanda", async (db) => {
      return await db.getFirstAsync(`SELECT * FROM COMANDA WHERE ID = ?`, [id]);
    });
  }

  static async getClientes() {
    return withDb("Pago.getClientes", async (db) => {
      return await db.getAllAsync(`SELECT * FROM CLIENTES ORDER BY NOMBRE ASC`);
    });
  }

  static async getFormatosPago() {
    return withDb("Pago.getFormatosPago", async (db) => {
      return await db.getAllAsync(
        `SELECT * FROM METODO_PAGO WHERE ACTIVO = 1 ORDER BY ID ASC`,
      );
    });
  }

  static async getConfiguraciones() {
    return withDb("Pago.getConfiguraciones", async (db) => {
      return await db.getFirstAsync(`SELECT * FROM CONFIGURACIONES LIMIT 1`);
    });
  }

  static async actualizarCantidadArticulo(idRenglon, cantidad, precioVenta) {
    const total = cantidad * precioVenta;
    return withDb("Pago.actualizarCantidadArticulo", async (db) => {
      return await db.runAsync(
        `UPDATE COMANDA_ARTICULO SET CANTIDAD = ?, SUBTOTAL = ?, TOTAL = ? WHERE ID = ?`,
        [cantidad, total, total, idRenglon],
      );
    });
  }

  static async eliminarArticulo(idRenglon) {
    return withDb("Pago.eliminarArticulo", async (db) => {
      await db.runAsync(
        `DELETE FROM COMANDA_COMPLEMENTO WHERE ID_COMANDA_ARTICULO = ?`,
        [idRenglon],
      );
      await db.runAsync(`DELETE FROM COMANDA_ARTICULO WHERE ID = ?`, [
        idRenglon,
      ]);
    });
  }

  static async setClienteEnComanda(idComanda, idCliente) {
    return withDb("Pago.setClienteEnComanda", async (db) => {
      return await db.runAsync(
        `UPDATE COMANDA SET ID_CLIENTE = ? WHERE ID = ?`,
        [idCliente, idComanda],
      );
    });
  }

  static async quitarClienteDeComanda(idComanda) {
    return withDb("Pago.quitarClienteDeComanda", async (db) => {
      return await db.runAsync(
        `UPDATE COMANDA SET ID_CLIENTE = NULL WHERE ID = ?`,
        [idComanda],
      );
    });
  }

  static async actualizarNota(idComanda, nota) {
    return withDb("Pago.actualizarNota", async (db) => {
      return await db.runAsync(`UPDATE COMANDA SET NOTA = ? WHERE ID = ?`, [
        nota,
        idComanda,
      ]);
    });
  }

  static async pagarComanda(idComanda, pagos) {
    return withDb("Pago.pagarComanda", async (db) => {
      await db.runAsync(
        `UPDATE COMANDA SET
                    ESTATUS         = 1,
                    ACTIVO          = 0,
                    FORMATO_PAGO    = ?,
                    SUBTOTAL        = ?,
                    DESCUENTO       = ?,
                    PROPINA         = ?,
                    COSTO_ENVIO     = ?,
                    TOTAL           = ?
                 WHERE ID = ?`,
        [
          pagos.formatoPago,
          pagos.subtotal,
          pagos.descuento,
          pagos.propina,
          pagos.costoEnvio,
          pagos.total,
          idComanda,
        ],
      );
      await db.runAsync(
        `INSERT INTO COMANDA_PAGOS (ID_COMANDA, ID_METODO_PAGO, CANTIDAD) VALUES (?, ?, ?)`,
        [idComanda, pagos.idMetodoPago, pagos.montoRecibido],
      );
      await db.runAsync(
        `UPDATE MESA SET ESTATUS = 0, ID_COMANDA = NULL WHERE ID_COMANDA = ?`,
        [idComanda],
      );
    });
  }

  static async registrarMovimiento(idComanda, idArticulo, tipoNombre) {
    return withDb("Pago.registrarMovimiento", async (db) => {
      const tipo = await db.getFirstAsync(
        `SELECT ID FROM COMANDA_MOVIMIENTO_TIPO WHERE TIPO = ? AND ACTIVO = 1`,
        [tipoNombre],
      );
      if (!tipo) return;
      await db.runAsync(
        `INSERT INTO COMANDA_MOVIMIENTOS (ID_COMANDA, ID_ARTICULO, ID_TIPO) VALUES (?, ?, ?)`,
        [idComanda, idArticulo ?? null, tipo.ID],
      );
    });
  }

  static getMovimientosComanda(idComanda) {
    return withDb("Pago.getMovimientosComanda", async (db) => {
      return await db.getAllAsync(
        `SELECT cm.*, c.TIPO AS TIPO_NOMBRE, a.NOMBRE AS ARTICULO_NOMBRE
                 FROM COMANDA_MOVIMIENTOS cm
                    LEFT JOIN COMANDA_MOVIMIENTO_TIPO c ON cm.ID_TIPO = c.ID
                    LEFT JOIN ARTICULO a ON cm.ID_ARTICULO = a.UUID
                    WHERE cm.ID_COMANDA = ? ORDER BY cm.ID ASC`,
        [idComanda],
      );
    });
  }
  static async getPuntosImpresion() {
    return withDb("Pago.getPuntosImpresion", async (db) => {
      return await db.getAllAsync(`SELECT * FROM PUNTOS_IMPRESION`);
    });
  }

  // ── Dividir cuenta ──────────────────────────────────────────────────────

  /** Devuelve los pagos divididos guardados para una comanda (si ya se pagó así) */
  static async getPagoCuentaDividida(idComanda) {
    return withDb("Pago.getPagoCuentaDividida", async (db) => {
      return await db.getAllAsync(
        `SELECT * FROM COMANDA_PAGO_CUENTA_DIVIDIDA WHERE ID_COMANDA = ? ORDER BY ID ASC`,
        [idComanda],
      );
    });
  }

  /** Persiste cada fila de pago dividido (borra las anteriores de la misma comanda primero) */
  static async guardarPagoCuentaDividida(idComanda, filas) {
    return withDb("Pago.guardarPagoCuentaDividida", async (db) => {
      await db.runAsync(
        `DELETE FROM COMANDA_PAGO_CUENTA_DIVIDIDA WHERE ID_COMANDA = ?`,
        [idComanda],
      );
      for (const fila of filas) {
        await db.runAsync(
          `INSERT INTO COMANDA_PAGO_CUENTA_DIVIDIDA (ID_COMANDA, CANTIDAD, TOTAL, FORMA_PAGO) VALUES (?, ?, ?, ?)`,
          [idComanda, fila.cantidad, fila.total, fila.formaPago],
        );
      }
    });
  }

  /**
   * Finaliza la comanda (pago o pendiente), libera la mesa.
   * ESTATUS = 1 → Pagado  (formatoPago != null)
   * ESTATUS = 2 → Pendiente (sin método de pago)
   */
  static async finalizarComanda(idComanda, datos) {
    const esPendiente =
      !datos.formatoPago || datos.formatoPago.toLowerCase() === "pendiente";
    const estatus = esPendiente ? 3 : 1;
    return withDb("Pago.finalizarComanda", async (db) => {
      await db.runAsync(
        `UPDATE COMANDA SET
                    ESTATUS      = ?,
                    ACTIVO       = 0,
                    FORMATO_PAGO = ?,
                    SUBTOTAL     = ?,
                    DESCUENTO    = ?,
                    PROPINA      = ?,
                    COSTO_ENVIO  = ?,
                    TOTAL        = ?
                 WHERE ID = ?`,
        [
          estatus,
          datos.formatoPago ?? null,
          datos.subtotal,
          datos.descuento,
          datos.propina,
          datos.costoEnvio,
          datos.total,
          idComanda,
        ],
      );
      if (datos.idMetodoPago && datos.montoRecibido) {
        await db.runAsync(
          `INSERT INTO COMANDA_PAGOS (ID_COMANDA, ID_METODO_PAGO, CANTIDAD) VALUES (?, ?, ?)`,
          [idComanda, datos.idMetodoPago, datos.montoRecibido],
        );
      }
      await db.runAsync(
        `UPDATE MESA SET ESTATUS = 0, ID_COMANDA = NULL WHERE ID_COMANDA = ?`,
        [idComanda],
      );
    });
  }
}
