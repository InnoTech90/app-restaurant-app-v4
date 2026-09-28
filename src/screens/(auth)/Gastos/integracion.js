import { deviceApi, getDeviceAuthHeaders } from "../../../utils/http/deviceApi";
import { Database } from "./database";

const ZONA_MEXICO = "America/Mexico_City";

const partesEnZona = (fecha, timeZone) => {
  const partes = {};
  for (const parte of new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(fecha)) {
    if (parte.type !== "literal") partes[parte.type] = parte.value;
  }
  return {
    year: Number(partes.year),
    month: Number(partes.month),
    day: Number(partes.day),
    hour: Number(partes.hour) % 24,
    minute: Number(partes.minute),
    second: Number(partes.second),
  };
};

/** Día elegido en Ciudad de México, a las 00:00:00.000Z. */
const expenseDateCiudadDeMexico = (fecha) => {
  const ahora = new Date();
  const origen = fecha ? new Date(fecha) : ahora;
  const base = Number.isNaN(origen.getTime()) ? ahora : origen;
  const dia = partesEnZona(base, ZONA_MEXICO);
  const y = String(dia.year).padStart(4, "0");
  const m = String(dia.month).padStart(2, "0");
  const d = String(dia.day).padStart(2, "0");
  return `${y}-${m}-${d}T00:00:00.000Z`;
};

const mensajeErrorApi = (error) => {
  const message = error?.response?.data?.message;
  if (Array.isArray(message)) return message.filter(Boolean).join("\n");
  if (typeof message === "string" && message.trim()) return message;
  return null;
};

export class integracionGastos {
  /**
   * Sube al servidor todos los REGISTRO_GASTO con SINCRONIZADO = 0.
   * Flujo:
   *  1. Obtiene los headers de autenticación (deviceKey / qrCode).
   *  2. Obtiene los registros pendientes con sus UUIDs de categoría y concepto.
   *  3. Mapea al formato del endpoint /devices/synchronize-expenses.
   *  4. Hace POST con el array de records.
   *  5. Marca los registros enviados como SINCRONIZADO = 1 en la BD local.
   *
   * @returns {{ sincronizados: number }}
   */
  static sincronizarGastos = async () => {
    const headers = await getDeviceAuthHeaders();

    const pendientes = await Database.getRegistrosPendientes();
    if (pendientes.length === 0) {
      return { sincronizados: 0 };
    }

    const records = pendientes.map((r) => ({
      expenseGroupId: r.GRUPO_UUID,
      expenseConceptId: r.CONCEPTO_UUID,
      // formatea el monto a 2 decimales como string, p.ej. "123.40" y tipo numérico en la API
      amount: parseFloat(parseFloat(r.MONTO).toFixed(2)),
      description: r.NOTA ?? "",
      expenseDate: expenseDateCiudadDeMexico(r.FECHA),
    }));

    try {
      await deviceApi.post(
        "/devices/synchronize-expenses",
        { records },
        { headers },
      );
    } catch (error) {
      const detalle = mensajeErrorApi(error);
      if (detalle) throw new Error(detalle);
      throw error;
    }

    const ids = pendientes.map((r) => r.ID);
    await Database.marcarRegistrosSincronizados(ids);

    return { sincronizados: ids.length };
  };

  /**
   * Descarga grupos y conceptos desde /devices/expenses-groups-concepts
   * y actualiza CATEGORIA_GASTO y CONCEPTO_GASTO con el arreglo `data`.
   */
  static actualizarCatalogo = async () => {
    const headers = await getDeviceAuthHeaders();
    const response = await deviceApi.get("/devices/expenses-groups-concepts", {
      headers,
    });

    const catalogo = response?.data?.data;
    if (!Array.isArray(catalogo)) {
      throw new Error("La respuesta no incluye el catálogo de gastos.");
    }

    return Database.guardarCatalogo(catalogo);
  };
}
