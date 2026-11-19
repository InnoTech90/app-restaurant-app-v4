import { enCola } from "../../../utils/http/sincronizarEnSegundoPlano";
import {
  esErrorDeConexion,
  MENSAJE_NO_SE_PUDO_CONECTAR,
  obtenerMensajeErrorRed,
} from "../../../utils/ConeccionAInternet/ConeccionAInternet";
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

const LOTE_SINCRONIZACION = 50;
const TIMEOUT_LOTE_MS = 30000;

export class integracionVentas {
  /**
   * Sube al servidor las comandas finalizadas pendientes de sincronizar.
   * El endpoint espera un array de ventas (no un objeto wrapper).
   *
   * @returns {{ sincronizadas: number, ventas: Array }}
   */
  /**
   * @param {Array} idsSeleccionados
   * @param {{ devolverVentas?: boolean }} opciones  devolverVentas=false evita
   *   releer TODO el historial al final (Pago no lo usa y, como la BD usa una
   *   sola cola, esa lectura bloqueaba la app varios segundos tras cada cobro).
   */
  static sincronizarVentas = async (
    idsSeleccionados = [],
    { devolverVentas = true } = {},
  ) => {
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
      const ventas = devolverVentas ? await VentasDatabase.getVentas() : null;
      return { sincronizadas: 0, ventas };
    }

    const aVenta = (v) => ({
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
      origin:
        String(v.ORIGEN || "").toUpperCase() === "ONLINE" ? "ONLINE" : "POS",
      digitalOrderId: v.ID_PEDIDO_DIGITAL || null,
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
    });

    // Carga pesada: después de un día sin internet puede haber cientos de
    // ventas pendientes. En un solo POST se pasaba del timeout (12 s) y nunca
    // subían. Se mandan en lotes y cada lote se marca al confirmarse, así un
    // corte de red a la mitad no obliga a reenviar lo que ya llegó.
    const sincronizadasIds = [];
    for (let i = 0; i < ventasSeleccionadas.length; i += LOTE_SINCRONIZACION) {
      const lote = ventasSeleccionadas.slice(i, i + LOTE_SINCRONIZACION);
      try {
        const response = await deviceApi.post(
          "/devices/synchronize-sale",
          lote.map(aVenta),
          { headers, timeout: TIMEOUT_LOTE_MS },
        );

        if (response.status < 200 || response.status >= 300) {
          throw new Error(
            `Error del servidor al sincronizar ventas (${response.status})`,
          );
        }
      } catch (error) {
        // Los lotes anteriores ya quedaron marcados como sincronizados.
        if (esErrorDeConexion(error)) {
          throw new Error(obtenerMensajeErrorRed(error, MENSAJE_NO_SE_PUDO_CONECTAR));
        }
        const detalle = mensajeErrorApi(error);
        if (detalle) throw new Error(detalle);
        throw new Error(error?.message || MENSAJE_NO_SE_PUDO_CONECTAR);
      }
      const idsLote = lote.map((v) => v.ID);
      await VentasDatabase.marcarComoSincronizadas(idsLote);
      sincronizadasIds.push(...idsLote);
    }

    const ventasActualizadas = devolverVentas
      ? await VentasDatabase.getVentas()
      : null;
    return { sincronizadas: sincronizadasIds.length, ventas: ventasActualizadas };
  };
}

// Una sincronización a la vez por módulo (botón manual + subida automática).
integracionVentas.sincronizarVentas = enCola("ventas", integracionVentas.sincronizarVentas);
