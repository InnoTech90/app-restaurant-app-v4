import { deviceApi, getDeviceAuthHeaders } from "../../../utils/http/deviceApi";
import { integracionPantallaDeCarga } from "../PantallaDeCarga/integracion";
import InventariosDatabase from "./database";

export class integracionInventarios {
  /**
   * Actualizar: descarga el inventario desde el servidor y lo sobreescribe en la BD local.
   * Equivale a llamar al mismo endpoint que usa PantallaDeCarga.
   */
  static actualizar = async () => {
    await integracionPantallaDeCarga.inventory();
  };

  /**
   * Sincronizar: sube todos los movimientos pendientes (SINCRONIZADO = 0) al servidor.
   *
   * Flujo:
   *  1. Obtiene los registros pendientes con stock actual y anterior.
   *  2. Calcula la diferencia (delta). Si delta > 0 → "IN-APP", si delta ≤ 0 → "OUT-APP".
   *  3. Busca el UUID del tipo de movimiento por CODE en la tabla TIPO_MOVIMIENTO_INVENTARIO.
   *  4. Construye el payload y hace POST /devices/synchronize-inventory.
   *  5. Marca los registros enviados como SINCRONIZADO = 1.
   *
   * @returns {{ sincronizados: number }}
   */
  static sincronizar = async () => {
    const pendientes = await InventariosDatabase.getPendientesSincronizar();

    // const data = [
    //   {
    //     rawMaterialBranchId: "de916b56-70f5-432e-985a-bf27b518f3a1",
    //     stockActual: 1,
    //     stockAnterior: 0,
    //   },
    //   {
    //     rawMaterialBranchId: "9eb8363b-ab44-4d67-a259-a5ec11f94542",
    //     stockActual: 1,
    //     stockAnterior: 0,
    //   },
    // ];

    console.log("Pendientes de sincronización:", pendientes);

    if (!pendientes?.length) return { sincronizados: 0 };

    // Obtener UUIDs de los tipos de movimiento de app
    const [tipoEntrada, tipoSalida] = await Promise.all([
      InventariosDatabase.getTipoMovimientoByCode("IN-APP"),
      InventariosDatabase.getTipoMovimientoByCode("OUT-APP"),
    ]);

    if (!tipoEntrada?.UUID || !tipoSalida?.UUID) {
      throw new Error(
        "Tipos de movimiento IN-APP / OUT-APP no encontrados. " +
          "Ve a Pantalla de Carga y sincroniza los datos generales primero.",
      );
    }

    const headers = await getDeviceAuthHeaders();

    const records = pendientes.map((p) => {
      const delta = (p.stockActual ?? 0) - (p.stockAnterior ?? 0);
      const tipoId = delta > 0 ? tipoEntrada.UUID : tipoSalida.UUID;
      return {
        rawMaterialBranchId: p.rawMaterialBranchId,
        typeInventoryMovementId: tipoId,
        quantity: String(Math.abs(delta)),
        cost: "0",
        comment: delta > 0 ? "Entrada APP" : "Salida APP",
      };
    });

    await deviceApi.post(
      "/devices/synchronize-inventory",
      { records },
      { headers },
    );

    const uuids = pendientes.map((p) => p.rawMaterialBranchId);
    await InventariosDatabase.marcarSincronizados(uuids);

    return { sincronizados: uuids.length };
  };
}
