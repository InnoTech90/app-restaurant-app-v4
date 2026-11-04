import AsyncStorage from "@react-native-async-storage/async-storage";
import { withDb } from "../../../utils/db";
import { runDatabaseMigrations } from "../../../utils/databaseMigrations";
import { Database as CajaDatabase } from "../Caja/dataBase";

const aNumero = (valor, fallback = 0) => {
  const n = Number(valor);
  return Number.isFinite(n) ? n : fallback;
};

export default class PedidoEnLineaDatabase {
  static async getComandaPorPedidoDigital(pedidoId) {
    return withDb("PedidoEnLinea.getComandaPorPedidoDigital", async (db) => {
      await runDatabaseMigrations(db);
      return db.getFirstAsync(
        `SELECT * FROM COMANDA WHERE ID_PEDIDO_DIGITAL = ? LIMIT 1`,
        [pedidoId],
      );
    });
  }

  static async registrarVentaDesdePedido(order) {
    return withDb("PedidoEnLinea.registrarVentaDesdePedido", async (db) => {
      await runDatabaseMigrations(db);

      if (!order?.id) {
        return { ok: false, code: "PEDIDO_INVALIDO" };
      }

      const existente = await db.getFirstAsync(
        `SELECT ID, ESTATUS, ACTIVO FROM COMANDA WHERE ID_PEDIDO_DIGITAL = ? LIMIT 1`,
        [order.id],
      );

      if (existente && Number(existente.ACTIVO) === 0 && Number(existente.ESTATUS) === 1) {
        return { ok: true, idComanda: existente.ID, alreadyExists: true };
      }

      const caja = await db.getFirstAsync(
        `SELECT ID
         FROM HISTORIAL_CAJA
         WHERE ID_SUCURSAL = ? AND ESTATUS = 1
         ORDER BY FECHA DESC
         LIMIT 1`,
        [await AsyncStorage.getItem("qrCode")],
      );

      if (!caja) {
        return { ok: false, code: "CAJA_CERRADA" };
      }

      const idSucursal = await AsyncStorage.getItem("qrCode");
      const deviceKey = await AsyncStorage.getItem("deviceKey");
      const fichaRow = await db.getFirstAsync(
        `SELECT COALESCE(MAX(FICHA), 0) + 1 AS NEXT_FICHA FROM COMANDA`,
      );
      const ficha = Number(fichaRow?.NEXT_FICHA) || 1;

      let metodoPagoId = null;
      let metodoPagoNombre = order.paymentMethodName || "Pedido en línea";

      if (order.paymentMethodId) {
        const metodo = await db.getFirstAsync(
          `SELECT ID, NOMBRE, UUID
           FROM METODO_PAGO
           WHERE UUID = ? OR CAST(ID AS TEXT) = ?
           LIMIT 1`,
          [order.paymentMethodId, String(order.paymentMethodId)],
        );
        if (metodo) {
          metodoPagoId = metodo.ID;
          metodoPagoNombre = metodo.NOMBRE || metodoPagoNombre;
        }
      }

      if (metodoPagoId == null) {
        const fallback = await db.getFirstAsync(
          `SELECT ID, NOMBRE FROM METODO_PAGO WHERE ACTIVO = 1 ORDER BY ID ASC LIMIT 1`,
        );
        if (fallback) {
          metodoPagoId = fallback.ID;
          metodoPagoNombre = fallback.NOMBRE || metodoPagoNombre;
        }
      }

      const tipoEntrega =
        order.fulfillmentType === "delivery" ? "delivery" : "pickup";
      const notaPartes = [
        "Pedido en línea",
        order.customerName ? `Cliente: ${order.customerName}` : null,
        order.customerPhone ? `Tel: ${order.customerPhone}` : null,
        tipoEntrega === "delivery" ? "Delivery" : "Recoger",
        order.deliveryAddress ? `Dir: ${order.deliveryAddress}` : null,
        order.notes ? `Nota: ${order.notes}` : null,
      ].filter(Boolean);

      const subtotal = aNumero(order.subtotal, aNumero(order.total));
      const costoEnvio = aNumero(order.shippingCost);
      const total = aNumero(order.total, subtotal + costoEnvio);

      let idComanda = existente?.ID ?? null;

      if (idComanda) {
        await db.runAsync(
          `UPDATE COMANDA SET
             ESTATUS = 1,
             ACTIVO = 0,
             SINCRONIZADO = 0,
             ORIGEN = 'ONLINE',
             TIPO_ENTREGA = ?,
             NOTA = ?,
             FORMATO_PAGO = ?,
             SUBTOTAL = ?,
             DESCUENTO = 0,
             PROPINA = 0,
             COSTO_ENVIO = ?,
             IMPUESTOS = 0,
             TOTAL = ?,
             DEVICE_KEY = COALESCE(DEVICE_KEY, ?)
           WHERE ID = ?`,
          [
            tipoEntrega,
            notaPartes.join(" · "),
            metodoPagoNombre,
            subtotal,
            costoEnvio,
            total,
            deviceKey,
            idComanda,
          ],
        );

        await db.runAsync(`DELETE FROM COMANDA_PAGOS WHERE ID_COMANDA = ?`, [
          idComanda,
        ]);
        await db.runAsync(
          `DELETE FROM COMANDA_COMPLEMENTO
           WHERE ID_COMANDA_ARTICULO IN (
             SELECT ID FROM COMANDA_ARTICULO WHERE ID_COMANDA = ?
           )`,
          [idComanda],
        );
        await db.runAsync(`DELETE FROM COMANDA_ARTICULO WHERE ID_COMANDA = ?`, [
          idComanda,
        ]);
      } else {
        const insert = await db.runAsync(
          `INSERT INTO COMANDA (
             ID_SUCURSAL, ID_MESA, ID_CLIENTE, FICHA, ESTATUS, NOTA,
             SINCRONIZADO, CONT_IMPRESO, DEVICE_KEY, PROPINA, COSTO_ENVIO,
             FORMATO_PAGO, DESCUENTO, SUBTOTAL, IMPUESTOS, TOTAL, ACTIVO,
             ORIGEN, ID_PEDIDO_DIGITAL, TIPO_ENTREGA
           ) VALUES (?, NULL, NULL, ?, 1, ?, 0, 0, ?, 0, ?, ?, 0, ?, 0, ?, 0, 'ONLINE', ?, ?)`,
          [
            idSucursal,
            ficha,
            notaPartes.join(" · "),
            deviceKey,
            costoEnvio,
            metodoPagoNombre,
            subtotal,
            total,
            order.id,
            tipoEntrega,
          ],
        );
        idComanda = insert?.lastInsertRowId;
      }

      if (!idComanda) {
        return { ok: false, code: "NO_SE_PUDO_CREAR" };
      }

      for (const item of order.items || []) {
        const cantidad = aNumero(item.quantity, 1);
        const precio = aNumero(item.unitPrice);
        const lineTotal = aNumero(item.lineTotal, precio * cantidad);
        const articleInsert = await db.runAsync(
          `INSERT INTO COMANDA_ARTICULO (
             ID_COMANDA, ID_ARTICULO, CANTIDAD_CANCELADOS, CANTIDAD,
             PRECIO_VENTA, NOTA, DESCUENTO, SUBTOTAL, TOTAL, IMPRESO
           ) VALUES (?, ?, 0, ?, ?, ?, 0, ?, ?, 0)`,
          [
            idComanda,
            item.articleId,
            cantidad,
            precio,
            item.notes || null,
            lineTotal,
            lineTotal,
          ],
        );

        const idComandaArticulo = articleInsert?.lastInsertRowId;
        if (!idComandaArticulo) continue;

        for (const complement of item.complements || []) {
          const compQty = aNumero(complement.quantity, 1);
          const compPrice = aNumero(complement.unitPrice);
          const compTotal = compPrice * compQty;
          await db.runAsync(
            `INSERT INTO COMANDA_COMPLEMENTO (
               ID_COMANDA_ARTICULO, ID_COMPLEMENTO, CANTIDAD_CANCELADOS,
               CANTIDAD, PRECIO_VENTA, NOTA, SUBTOTAL, TOTAL
             ) VALUES (?, ?, 0, ?, ?, ?, ?, ?)`,
            [
              idComandaArticulo,
              complement.complementId,
              compQty,
              compPrice,
              complement.complementName || null,
              compTotal,
              compTotal,
            ],
          );
        }
      }

      if (metodoPagoId != null) {
        await db.runAsync(
          `INSERT INTO COMANDA_PAGOS (ID_COMANDA, ID_METODO_PAGO, CANTIDAD)
           VALUES (?, ?, ?)`,
          [idComanda, metodoPagoId, total],
        );
      }

      await CajaDatabase.registrarVentaEnCaja(db, {
        idComanda,
        lineas: [
          {
            metodo: metodoPagoNombre,
            monto: total,
          },
        ],
      });

      return { ok: true, idComanda };
    });
  }
}
