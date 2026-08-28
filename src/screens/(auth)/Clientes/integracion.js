import { deviceApi, getDeviceAuthHeaders } from "../../../utils/http/deviceApi";
import { integracionPantallaDeCarga } from "../PantallaDeCarga/integracion";
import { Database } from "./Database";

export class integracionClientes {
  /**
   * Actualizar: descarga los clientes desde el servidor y los guarda en BD local.
   */
  static actualizar = async () => {
    await integracionPantallaDeCarga.clientes();
  };

  /**
   * Sincronizar: sube todos los clientes con SINCRONIZADO = 0.
   *
   * Flujo:
   *  1. Obtiene clientes pendientes.
   *  2. Construye payload: dinerId solo para los que ya tienen UUID (editados),
   *     omitido para los nuevos (creados localmente sin UUID).
   *  3. POST /devices/synchronize-diners.
   *  4. Marca como SINCRONIZADO = 1 los que tenían UUID.
   *  5. Elimina localmente los recién creados (sin UUID) — el servidor los
   *     devuelve con UUID asignado en el siguiente paso.
   *  6. Llama actualizar() para traer los datos frescos del servidor.
   *
   * @returns {{ sincronizados: number }}
   */
  static sincronizar = async () => {
    const pendientes = await Database.getClientesPendientes();
    if (!pendientes?.length) return { sincronizados: 0 };

    const [businessId, sucursalId] = await Promise.all([
      Database.getBusinessId(),
      Database.getSucursalId(),
    ]);

    if (!sucursalId) {
      throw new Error(
        "No se encontró la sucursal actual. Actualiza los datos de la aplicación e inténtalo de nuevo.",
      );
    }

    const headers = await getDeviceAuthHeaders();

    const records = pendientes.map((c) => {
      const record = {
        fullName: c.NOMBRE,
        address: c.DIRECCION ?? "",
        city: c.CIUDAD ?? "",
        state: c.ESTADO ?? "",
        whatsapp: c.TELEFONO ?? "",
        email: c.CORREO ?? "",
        description: c.DESCRIPCION ?? "",
        // branchesIds: [sucursalId],
      };
      // dinerId solo para clientes que ya existen en el servidor
      if (c.UUID) record.dinerId = c.UUID;
      return record;
    });
    const params = {
      businessId,
      records,
    };

    console.log("Sincronizando clientes con payload:", params);

    try {
      await deviceApi.post(
        "/devices/synchronize-diners",
        JSON.stringify(params, null, 2),
        { headers },
      );

      // Marcar editados como sincronizados
      const uuidsExistentes = pendientes
        .filter((c) => c.UUID)
        .map((c) => c.UUID);
      await Database.marcarSincronizadosPorUUID(uuidsExistentes);

      // Eliminar los creados localmente (sin UUID); el servidor los devolverá con UUID
      await Database.eliminarClientesSinUUID();

      // Traer datos frescos del servidor
      await integracionClientes.actualizar();

      return { sincronizados: pendientes.length };
    } catch (error) {
      console.error("Error sincronizando clientes:", error);
      throw error;
    }
  };
}
