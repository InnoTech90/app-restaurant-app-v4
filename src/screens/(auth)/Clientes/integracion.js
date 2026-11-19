import { enCola } from "../../../utils/http/sincronizarEnSegundoPlano";
import {
  esErrorDeConexion,
  MENSAJE_NO_SE_PUDO_CONECTAR,
  obtenerMensajeErrorRed,
} from "../../../utils/ConeccionAInternet/ConeccionAInternet";
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
   *  5. Llama actualizar() para traer los datos frescos del servidor.
   *  6. Reenlaza las comandas de los clientes nuevos al cliente descargado
   *     y borra el registro local (ver Database.reenlazarClientesNuevos).
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
      const activo = Number(c.ACTIVO ?? 1) === 1;
      const record = {
        fullName: c.NOMBRE,
        address: c.DIRECCION ?? "",
        city: c.CIUDAD ?? "",
        state: c.ESTADO ?? "",
        whatsapp: c.TELEFONO ?? "",
        email: c.CORREO ?? "",
        description: c.DESCRIPCION ?? "",
        status: activo ? "activo" : "inactivo",
        branchesIds: [sucursalId],
      };
      if (c.UUID) record.dinerId = c.UUID;
      return record;
    });
    const params = {
      businessId,
      records,
    };

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

      // Traer datos frescos del servidor (los nuevos llegan con UUID) y
      // después pasar las comandas del cliente local al descargado. Antes se
      // borraban los locales primero y la comanda quedaba sin cliente.
      const nuevosLocales = pendientes.filter((c) => !c.UUID);
      await integracionClientes.actualizar();
      await Database.reenlazarClientesNuevos(nuevosLocales);

      return { sincronizados: pendientes.length };
    } catch (error) {
      if (esErrorDeConexion(error)) {
        throw new Error(obtenerMensajeErrorRed(error, MENSAJE_NO_SE_PUDO_CONECTAR));
      }
      throw new Error(error?.message || MENSAJE_NO_SE_PUDO_CONECTAR);
    }
  };
}

// Una sincronización a la vez por módulo (botón manual + subida automática).
integracionClientes.sincronizar = enCola("clientes", integracionClientes.sincronizar);
