import { deviceApi, getDeviceAuthHeaders } from "../../../utils/http/deviceApi";
import VentasDatabase from "./database";

/**
 * Mapea el ESTATUS numérico de la BD al string que espera la API.
 *  1 = Pagado   → "paid"
 *  2 = Cancelado → "cancelled"
 */
const mapEstatus = (estatus) => {
  if (Number(estatus) === 2) return "cancelled";
  return "paid";
};

const aNumero = (valor, fallback = 0) => {
  const n = Number(valor);
  return Number.isFinite(n) ? n : fallback;
};

const formatearSaleDate = (fecha) => {
  if (!fecha) return null;
  const raw = String(fecha).trim();
  const normalizada = raw.includes("T") ? raw : raw.replace(" ", "T");
  const sinZona = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(normalizada);
  const date = new Date(sinZona ? `${normalizada}Z` : normalizada);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
};

const mensajeErrorApi = (error) => {
  const data = error?.response?.data;
  const message = data?.message ?? data?.error ?? data?.detalle;
  if (Array.isArray(message)) return message.filter(Boolean).join("\n");
  if (typeof message === "string" && message.trim()) return message;
  if (typeof data === "string" && data.trim()) return data;
  return null;
};

export class integracionVentas {
  /**
   * Sube al servidor las comandas finalizadas pendientes de sincronizar.
   * El endpoint espera un array de ventas (no un objeto wrapper).
   *
   * @returns {{ sincronizadas: number, ventas: Array }}
   */
  static sincronizarVentas = async (idsSeleccionados = []) => {
    const headers = await getDeviceAuthHeaders();

    const { businessId, branchId, deviceId } =
      await VentasDatabase.getDatosDispositivo();

    if (!businessId || !branchId || !deviceId) {
      throw new Error(
        "Faltan datos del negocio, sucursal o dispositivo para sincronizar.",
      );
    }

    const ventasDB = await VentasDatabase.getVentasParaSincronizar();
    const idsSet = new Set(
      (idsSeleccionados ?? []).map((id) => Number(id)).filter(Number.isFinite),
    );
    const ventasSeleccionadas =
      idsSet.size > 0
        ? ventasDB.filter((v) => idsSet.has(Number(v.ID)))
        : [];

    if (ventasSeleccionadas.length === 0) {
      const ventas = await VentasDatabase.getVentas();
      return { sincronizadas: 0, ventas };
    }

    const sales = ventasSeleccionadas.map((v) => ({
      businessId,
      branchId,
      tableId: v.MESA_UUID ?? null,
      deviceId,
      dinerId: v.DINER_UUID ?? null,
      status: mapEstatus(v.ESTATUS),
      saleDate: formatearSaleDate(v.FECHA),
      deliveryCost: aNumero(v.COSTO_ENVIO),
      tip: aNumero(v.PROPINA),
      discount: aNumero(v.DESCUENTO),
      subtotal: aNumero(v.SUBTOTAL),
      tax: aNumero(v.IMPUESTOS ?? v.TAX ?? v.IMPUESTO),
      total: aNumero(v.TOTAL),
      notes: v.NOTA == null ? "" : String(v.NOTA),
      voucher: v.FICHA != null ? String(v.FICHA) : null,
      articles: (v.articulos ?? []).map((a) => ({
        articleId: a.ARTICULO_UUID ?? a.ID_ARTICULO ?? null,
        soldQuantity: aNumero(a.CANTIDAD),
        sellingPrice: aNumero(a.PRECIO_VENTA),
        subtotal: aNumero(a.SUBTOTAL),
        total: aNumero(a.TOTAL),
        notes: a.NOTA == null ? "" : String(a.NOTA),
        ...((a.complementos ?? []).length > 0
          ? {
              complements: (a.complementos ?? []).map((c) => ({
                complementId: c.COMPLEMENTO_UUID ?? c.ID_COMPLEMENTO ?? null,
                soldQuantity: aNumero(c.CANTIDAD),
                sellingPrice: aNumero(c.PRECIO_VENTA),
                subtotal: aNumero(c.SUBTOTAL),
                total: aNumero(c.TOTAL),
                notes: c.NOTA == null ? "" : String(c.NOTA),
              })),
            }
          : {}),
      })),
      payments: (v.pagos ?? []).map((p) => ({
        paymentMethodId: p.ID_METODO_PAGO ?? null,
        amount: aNumero(p.CANTIDAD),
      })),
    }));

    console.log("Sincronizando ventas payload:", JSON.stringify(sales, null, 2));

    try {
      const response = await deviceApi.post(
        "/devices/synchronize-sale",
        sales,
        { headers },
      );

      if (response.status < 200 || response.status >= 300) {
        throw new Error(
          `Error del servidor al sincronizar ventas (${response.status})`,
        );
      }
    } catch (error) {
      console.error(
        "Error sincronizando ventas (detalle):",
        error?.response?.data ?? error?.message,
      );
      const detalle = mensajeErrorApi(error);
      if (detalle) throw new Error(detalle);
      throw error;
    }

    const ids = ventasSeleccionadas.map((v) => v.ID);
    await VentasDatabase.marcarComoSincronizadas(ids);

    const ventasActualizadas = await VentasDatabase.getVentas();
    return { sincronizadas: ids.length, ventas: ventasActualizadas };
  };
}
