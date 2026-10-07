import { Database as ClientesDatabase } from "../screens/(auth)/Clientes/Database";
import { Database as GastosDatabase } from "../screens/(auth)/Gastos/database";
import InventariosDatabase from "../screens/(auth)/Inventarios/database";
import VentasDatabase from "../screens/(auth)/Ventas/database";
import { withDb } from "./db";

export const obtenerPendientesSincronizacion = async () => {
  const [
    bloqueosVentas,
    gastosPendientes,
    clientesPendientes,
    inventarioPendientes,
    comandasAbiertas,
    cajaAbierta,
    ventasAnteriores,
  ] = await Promise.all([
    VentasDatabase.getBloqueosCierreSesion(),
    GastosDatabase.getRegistrosPendientes(),
    ClientesDatabase.getClientesPendientes(),
    InventariosDatabase.getCantidadPendientes(),
    withDb("Pendientes.getComandasAbiertas", async (db) => {
      const row = await db.getFirstAsync(
        `SELECT COUNT(*) AS total
         FROM COMANDA
         WHERE ACTIVO = 1 AND ESTATUS IN (0, 4)`,
      );
      return Number(row?.total ?? 0);
    }),
    withDb("Pendientes.getCajaAbierta", async (db) => {
      const row = await db.getFirstAsync(
        `SELECT ID
         FROM HISTORIAL_CAJA
         WHERE ESTATUS = 1
         ORDER BY FECHA DESC
         LIMIT 1`,
      );
      return row ? 1 : 0;
    }),
    withDb("Pendientes.getVentasAnteriores", async (db) => {
      const row = await db.getFirstAsync(
        `SELECT COUNT(*) AS total
         FROM COMANDA
         WHERE ACTIVO = 0
           AND ESTATUS > 0
           AND date(FECHA, 'localtime') < date('now', 'localtime')`,
      );
      return Number(row?.total ?? 0);
    }),
  ]);

  return {
    ventas: Number(bloqueosVentas?.sinSincronizar ?? 0),
    ventasPendientes: Number(bloqueosVentas?.pendientes ?? 0),
    gastos: gastosPendientes?.length ?? 0,
    clientes: clientesPendientes?.length ?? 0,
    inventario: Number(inventarioPendientes ?? 0),
    comandasAbiertas: Number(comandasAbiertas ?? 0),
    cajaAbierta: Number(cajaAbierta ?? 0),
    ventasAnteriores: Number(ventasAnteriores ?? 0),
  };
};

export const hayPendientesParaSincronizacionGeneral = (pendientes) =>
  Number(pendientes?.ventas ?? 0) > 0 ||
  Number(pendientes?.ventasPendientes ?? 0) > 0 ||
  Number(pendientes?.gastos ?? 0) > 0 ||
  Number(pendientes?.clientes ?? 0) > 0 ||
  Number(pendientes?.inventario ?? 0) > 0 ||
  Number(pendientes?.comandasAbiertas ?? 0) > 0;

export const hayPendientesInicioDeDia = (pendientes) =>
  hayPendientesParaSincronizacionGeneral(pendientes) ||
  Number(pendientes?.cajaAbierta ?? 0) > 0 ||
  Number(pendientes?.ventasAnteriores ?? 0) > 0;

export const construirListaPendientes = (pendientes) => {
  const partes = [];

  if (pendientes.comandasAbiertas > 0) {
    partes.push(
      `${pendientes.comandasAbiertas} comanda${pendientes.comandasAbiertas === 1 ? "" : "s"} abierta${pendientes.comandasAbiertas === 1 ? "" : "s"}`,
    );
  }
  if (pendientes.cajaAbierta > 0) {
    partes.push("caja abierta sin cerrar");
  }
  if (pendientes.ventas > 0) {
    partes.push(
      `${pendientes.ventas} venta${pendientes.ventas === 1 ? "" : "s"} sin sincronizar`,
    );
  }
  if (pendientes.ventasPendientes > 0) {
    partes.push(
      `${pendientes.ventasPendientes} venta${pendientes.ventasPendientes === 1 ? "" : "s"} pendiente${pendientes.ventasPendientes === 1 ? "" : "s"} de pago`,
    );
  }
  if (pendientes.gastos > 0) {
    partes.push(
      `${pendientes.gastos} gasto${pendientes.gastos === 1 ? "" : "s"} sin sincronizar`,
    );
  }
  if (pendientes.clientes > 0) {
    partes.push(
      `${pendientes.clientes} cliente${pendientes.clientes === 1 ? "" : "s"} sin sincronizar`,
    );
  }
  if (pendientes.inventario > 0) {
    partes.push(
      `${pendientes.inventario} movimiento${pendientes.inventario === 1 ? "" : "s"} de inventario sin sincronizar`,
    );
  }
  if (pendientes.ventasAnteriores > 0) {
    partes.push(
      `${pendientes.ventasAnteriores} venta${pendientes.ventasAnteriores === 1 ? "" : "s"} de días anteriores por limpiar`,
    );
  }

  return partes;
};

export const construirMensajePendientes = (pendientes) => {
  const partes = [];

  if (pendientes.comandasAbiertas > 0) {
    partes.push(
      `${pendientes.comandasAbiertas} comanda${pendientes.comandasAbiertas === 1 ? "" : "s"} abierta${pendientes.comandasAbiertas === 1 ? "" : "s"}`,
    );
  }
  if (pendientes.ventas > 0) {
    partes.push(
      `${pendientes.ventas} venta${pendientes.ventas === 1 ? "" : "s"} sin sincronizar`,
    );
  }
  if (pendientes.ventasPendientes > 0) {
    partes.push(
      `${pendientes.ventasPendientes} venta${pendientes.ventasPendientes === 1 ? "" : "s"} pendiente${pendientes.ventasPendientes === 1 ? "" : "s"}`,
    );
  }
  if (pendientes.gastos > 0) {
    partes.push(
      `${pendientes.gastos} gasto${pendientes.gastos === 1 ? "" : "s"}`,
    );
  }
  if (pendientes.clientes > 0) {
    partes.push(
      `${pendientes.clientes} cliente${pendientes.clientes === 1 ? "" : "s"}`,
    );
  }
  if (pendientes.inventario > 0) {
    partes.push(
      `${pendientes.inventario} movimiento${pendientes.inventario === 1 ? "" : "s"} de inventario`,
    );
  }

  return `Hay datos pendientes de sincronizar: ${partes.join(", ")}. Sincronízalos primero desde sus secciones antes de actualizar toda la data.`;
};
