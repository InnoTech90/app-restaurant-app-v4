import { deviceApi, getDeviceAuthHeaders } from "../../../utils/http/deviceApi";
import { Database } from "./database";

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
      expenseDate: r.FECHA ?? new Date().toISOString(),
    }));
    console.log(
      "JSON.stringify(records)",
      JSON.stringify({ records }, null, 2),
    );
    console.log(typeof records);

    await deviceApi.post(
      "/devices/synchronize-expenses",
      JSON.stringify({ records }, null, 2),
      { headers },
    );

    const ids = pendientes.map((r) => r.ID);
    await Database.marcarRegistrosSincronizados(ids);

    return { sincronizados: ids.length };
  };
}
