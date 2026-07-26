import { deviceApi, getDeviceAuthHeaders } from "../../../utils/http/deviceApi";
import VentasDatabase from "./database";

/**
 * Mapea el ESTATUS numérico de la BD al string que espera la API.
 *  1 = Pagado   → "paid"
 *  3 = Cancelado → "cancelled"
 */
const mapEstatus = (estatus) => {
  if (estatus === 3) return "cancelled";
  return "paid";
};

export class integracionVentas {
  /**
   * Sube al servidor todas las comandas finalizadas (pagadas o canceladas)
   * que todavía no han sido sincronizadas.
   *
   * Flujo:
   *  1. Obtiene los headers de autenticación (deviceKey / qrCode).
   *  2. Recupera la info del dispositivo, negocio y sucursal desde la BD local.
   *  3. Recupera las comandas pendientes de sync con sus artículos y complementos.
   *  4. Las mapea al formato que espera el endpoint.
   *  5. Hace PUT /sales con el array de ventas.
   *  6. Marca las comandas enviadas como SINCRONIZADO = 1 en la BD local.
   *  7. Retorna la lista actualizada de ventas para refrescar la UI.
   *
   * @returns {{ sincronizadas: number, ventas: Array }} Ventas actualizadas.
   */
  static sincronizarVentas = async (idsSeleccionados = []) => {
    const headers = await getDeviceAuthHeaders();

    // Info de negocio / sucursal / dispositivo
    const { businessId, branchId, deviceId } =
      await VentasDatabase.getDatosDispositivo();

    // Comandas pendientes de sincronizar
    const ventasDB = await VentasDatabase.getVentasParaSincronizar();
    const idsSet = new Set(idsSeleccionados);
    const ventasSeleccionadas =
      idsSet.size > 0 ? ventasDB.filter((v) => idsSet.has(v.ID)) : [];

    if (ventasSeleccionadas.length === 0) {
      // Nada que sincronizar; devuelve la lista actual tal cual
      const ventas = await VentasDatabase.getVentas();
      return { sincronizadas: 0, ventas };
    }

    // Mapear al formato del endpoint
    const sales = ventasSeleccionadas.map((v) => {
      const sale = {
        businessId,
        branchId,
        tableId: v.MESA_UUID ?? null,
        deviceId,
        dinerId: v.DINER_UUID ?? null,
        status: mapEstatus(v.ESTATUS),
        saleDate: v.FECHA
          ? new Date(v.FECHA.replace(" ", "T")).toISOString()
          : null,
        deliveryCost: v.COSTO_ENVIO ?? 0,
        tip: v.PROPINA ?? 0,
        discount: v.DESCUENTO ?? 0,
        subtotal: v.SUBTOTAL ?? 0,
        tax: Number(v.IMPUESTOS ?? v.TAX ?? v.IMPUESTO ?? 0),
        total: v.TOTAL ?? 0,
        notes: v.NOTA ?? null,
        voucher: v.FICHA != null ? String(v.FICHA) : null,
        articles: (v.articulos ?? []).map((a) => {
          const article = {
            articleId: a.ARTICULO_UUID ?? null,
            soldQuantity: a.CANTIDAD,
            sellingPrice: a.PRECIO_VENTA,
            subtotal: a.SUBTOTAL,
            total: a.TOTAL,
            notes: a.NOTA ?? null,
          };
          const comps = (a.complementos ?? []).map((c) => {
            const comp = {
              complementId: c.COMPLEMENTO_UUID ?? null,
              soldQuantity: c.CANTIDAD,
              sellingPrice: c.PRECIO_VENTA,
              subtotal: c.SUBTOTAL,
              total: c.TOTAL,
              notes: c.NOTA ?? null,
            };
            return comp;
          });
          if (comps.length > 0) article.complements = comps;
          return article;
        }),
        payments: (v.pagos ?? []).map((p) => ({
          paymentMethodId: p.ID_METODO_PAGO,
          amount: p.CANTIDAD,
        })),
      };
      return sale;
    });
    console.log("Ventas a sincronizar:", JSON.stringify(sales, null, 2));
    // Llamada al endpoint
    await deviceApi.post(
      "/devices/synchronize-sale",
      JSON.stringify(sales, null, 2),
      { headers },
    );

    // Marcar como sincronizadas en la BD local
    const ids = ventasSeleccionadas.map((v) => v.ID);
    await VentasDatabase.marcarComoSincronizadas(ids);

    // Recargar lista actualizada (ya incluirá SINCRONIZADO = 1)
    const ventasActualizadas = await VentasDatabase.getVentas();
    return { sincronizadas: ids.length, ventas: ventasActualizadas };
  };
}
