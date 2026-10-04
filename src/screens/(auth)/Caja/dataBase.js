import AsyncStorage from "@react-native-async-storage/async-storage";
import { withDb } from "../../../utils/db";
import { runDatabaseMigrations } from "../../../utils/databaseMigrations";

const esEfectivo = (nombre) => /efectivo/i.test(String(nombre ?? ""));

export class Database {
  static async asegurarMigraciones() {
    return withDb("Caja.asegurarMigraciones", async (db) => {
      await runDatabaseMigrations(db);
    });
  }

  static async getHistorial() {
    const qrData = await AsyncStorage.getItem("qrCode");

    return withDb("Caja.getHistorial", async (db) => {
      await runDatabaseMigrations(db);
      const sesiones = await db.getAllAsync(
        `
                SELECT *
                FROM HISTORIAL_CAJA
                WHERE ID_SUCURSAL = ?
                ORDER BY FECHA DESC
                `,
        [qrData],
      );

      if (!sesiones.length) return [];

      await Database.vincularVentasPendientes(db, qrData, sesiones);

      const ids = sesiones.map((s) => s.ID);
      const placeholders = ids.map(() => "?").join(",");
      const movimientos = await db.getAllAsync(
        `
                SELECT ID, ID_CAJA, TIPO, MONTO, CONCEPTO, FECHA
                FROM MOVIMIENTO_CAJA
                WHERE ID_CAJA IN (${placeholders})
                ORDER BY FECHA DESC, ID DESC
                `,
        ids,
      );

      const porCaja = {};
      for (const movimiento of movimientos) {
        if (!porCaja[movimiento.ID_CAJA]) porCaja[movimiento.ID_CAJA] = [];
        porCaja[movimiento.ID_CAJA].push(movimiento);
      }

      const metodos = await db.getAllAsync(
        `SELECT NOMBRE FROM METODO_PAGO WHERE ACTIVO = 1 ORDER BY ID ASC`,
      );
      const ventas = await db.getAllAsync(
        `
                SELECT ID_CAJA, METODO, ES_EFECTIVO, SUM(MONTO) AS TOTAL
                FROM CAJA_VENTA
                WHERE ID_CAJA IN (${placeholders})
                GROUP BY ID_CAJA, METODO, ES_EFECTIVO
                `,
        ids,
      );
      const ventasPorCaja = {};
      for (const venta of ventas) {
        if (!ventasPorCaja[venta.ID_CAJA]) ventasPorCaja[venta.ID_CAJA] = [];
        ventasPorCaja[venta.ID_CAJA].push(venta);
      }

      return sesiones.map((sesion) => {
        const lista = porCaja[sesion.ID] ?? [];
        const depositos = lista
          .filter((m) => m.TIPO === "deposito")
          .reduce((sum, m) => sum + Number(m.MONTO ?? 0), 0);
        const retiros = lista
          .filter((m) => m.TIPO === "retiro")
          .reduce((sum, m) => sum + Number(m.MONTO ?? 0), 0);
        const ventasSesion = ventasPorCaja[sesion.ID] ?? [];
        const efectivoVentas = ventasSesion
          .filter((v) => Number(v.ES_EFECTIVO) === 1)
          .reduce((sum, v) => sum + Number(v.TOTAL ?? 0), 0);
        const totales = new Map(metodos.map((m) => [m.NOMBRE, 0]));
        for (const venta of ventasSesion) {
          const nombre = venta.METODO || "Otro";
          totales.set(nombre, (totales.get(nombre) ?? 0) + Number(venta.TOTAL ?? 0));
        }
        const ventasPorMetodo = [...totales.entries()]
          .map(([nombre, total]) => ({
            nombre,
            total,
            esEfectivo: esEfectivo(nombre),
          }))
          .sort(
            (a, b) =>
              Number(b.esEfectivo) - Number(a.esEfectivo) ||
              a.nombre.localeCompare(b.nombre, "es"),
          );
        return {
          ...sesion,
          movimientos: lista,
          ventasPorMetodo,
          SALDO:
            Number(sesion.MONTO ?? 0) + depositos - retiros + efectivoVentas,
        };
      });
    });
  }

  static async getNombreDispocitivo() {
    return withDb("Caja.getNombreDispositivo", async (db) => {
      const config = await db.getFirstAsync(
        `SELECT NOMBRE_DISPOCITIVO FROM CONFIGURACIONES LIMIT 1`,
      );
      const nombreConfig = String(config?.NOMBRE_DISPOCITIVO ?? "").trim();
      if (nombreConfig && nombreConfig !== "Dispositivo") {
        return nombreConfig;
      }

      const device = await db.getFirstAsync(
        `SELECT NOMBRE FROM DEVICE
         WHERE ACTIVO = 1 AND NOMBRE IS NOT NULL AND TRIM(NOMBRE) != ''
         LIMIT 1`,
      );
      const nombreDevice = String(device?.NOMBRE ?? "").trim();
      return nombreDevice || nombreConfig || null;
    });
  }

  /**
   * Toma ventas ya cobradas que no quedaron ligadas a la caja abierta
   * y las suma. Debe llamarse con la conexión que ya está dentro de withDb.
   */
  static async vincularVentasPendientes(db, idSucursal, sesiones) {
    const caja = sesiones.find((s) => Number(s.ESTATUS) === 1);
    if (!caja) return;

    const comandas = await db.getAllAsync(
      `
            SELECT c.ID, c.TOTAL, c.FORMATO_PAGO
            FROM COMANDA c
            WHERE c.ESTATUS = 1
              AND (c.ID_SUCURSAL = ? OR c.ID_SUCURSAL IS NULL OR c.ID_SUCURSAL = '')
              AND date(c.FECHA) >= date(?)
              AND NOT EXISTS (
                SELECT 1 FROM CAJA_VENTA v WHERE v.ID_COMANDA = c.ID
              )
            `,
      [idSucursal, caja.FECHA],
    );

    for (const comanda of comandas) {
      const pagos = await db.getAllAsync(
        `
                SELECT cp.CANTIDAD, m.NOMBRE
                FROM COMANDA_PAGOS cp
                LEFT JOIN METODO_PAGO m ON m.ID = cp.ID_METODO_PAGO
                WHERE cp.ID_COMANDA = ?
                `,
        [comanda.ID],
      );
      const lineas =
        pagos.length > 1
          ? pagos.map((pago) => ({
              metodo: pago.NOMBRE || comanda.FORMATO_PAGO || "Otro",
              monto: Number(pago.CANTIDAD) || 0,
            }))
          : [
              {
                metodo:
                  pagos[0]?.NOMBRE || comanda.FORMATO_PAGO || "Otro",
                monto: Number(comanda.TOTAL) || Number(pagos[0]?.CANTIDAD) || 0,
              },
            ];
      await Database.registrarVentaEnCaja(db, {
        idComanda: comanda.ID,
        lineas,
      });
    }
  }

  /**
   * Guarda los pagos de una venta ya cobrada en la caja abierta.
   * Debe llamarse con la conexión que ya está dentro de withDb.
   */
  static async registrarVentaEnCaja(db, { idComanda, lineas }) {
    const idSucursal = await AsyncStorage.getItem("qrCode");
    const caja = await db.getFirstAsync(
      `SELECT ID
       FROM HISTORIAL_CAJA
       WHERE ID_SUCURSAL = ? AND ESTATUS = 1
       ORDER BY FECHA DESC
       LIMIT 1`,
      [idSucursal],
    );
    if (!caja || !idComanda) return;

    await db.runAsync(`DELETE FROM CAJA_VENTA WHERE ID_COMANDA = ?`, [
      idComanda,
    ]);

    for (const linea of lineas ?? []) {
      const monto = Number(linea.monto);
      if (!Number.isFinite(monto) || monto <= 0) continue;
      const metodo = String(linea.metodo ?? "Otro").trim() || "Otro";
      await db.runAsync(
        `INSERT INTO CAJA_VENTA (ID_CAJA, ID_COMANDA, METODO, MONTO, ES_EFECTIVO)
         VALUES (?, ?, ?, ?, ?)`,
        [caja.ID, idComanda, metodo, monto, esEfectivo(metodo) ? 1 : 0],
      );
    }
  }

  static async insertarApertura(params) {
    return withDb("Caja.insertarApertura", async (db) => {
      const { idSucursal, nombreDispositivo, monto } = params;

      return await db.runAsync(
        `
                INSERT INTO HISTORIAL_CAJA
                (
                    ID_SUCURSAL,
                    NOMBRE_DISPOCITIVO,
                    MONTO,
                    ESTATUS
                )
                VALUES (?, ?, ?, 1)
                `,
        [idSucursal, nombreDispositivo, monto],
      );
    });
  }

  static async insertarMovimiento({ idCaja, tipo, monto, concepto }) {
    const cantidad = Number(monto);
    const motivo = String(concepto ?? "").trim();
    if (!idCaja) return { ok: false, message: "No hay una caja activa." };
    if (tipo !== "deposito" && tipo !== "retiro") {
      return { ok: false, message: "Movimiento no válido." };
    }
    if (!Number.isFinite(cantidad) || cantidad <= 0) {
      return { ok: false, message: "Ingresa un monto mayor a cero." };
    }
    if (!motivo) {
      return { ok: false, message: "Indica el concepto del movimiento." };
    }

    return withDb("Caja.insertarMovimiento", async (db) => {
      await runDatabaseMigrations(db);
      const caja = await db.getFirstAsync(
        `SELECT ID, ESTATUS, MONTO FROM HISTORIAL_CAJA WHERE ID = ?`,
        [idCaja],
      );

      if (!caja || Number(caja.ESTATUS) !== 1) {
        return {
          ok: false,
          message:
            tipo === "retiro"
              ? "El retiro solo se puede hacer con la caja abierta."
              : "Abre la caja para registrar un depósito.",
        };
      }

      if (tipo === "retiro") {
        const sums = await db.getFirstAsync(
          `
                    SELECT
                        COALESCE(SUM(CASE WHEN TIPO = 'deposito' THEN MONTO ELSE 0 END), 0) AS DEPOSITOS,
                        COALESCE(SUM(CASE WHEN TIPO = 'retiro' THEN MONTO ELSE 0 END), 0) AS RETIROS
                    FROM MOVIMIENTO_CAJA
                    WHERE ID_CAJA = ?
                    `,
          [idCaja],
        );
        const efectivoVentas = await db.getFirstAsync(
          `
                    SELECT COALESCE(SUM(MONTO), 0) AS TOTAL
                    FROM CAJA_VENTA
                    WHERE ID_CAJA = ? AND ES_EFECTIVO = 1
                    `,
          [idCaja],
        );
        const saldo =
          Number(caja.MONTO ?? 0) +
          Number(sums?.DEPOSITOS ?? 0) -
          Number(sums?.RETIROS ?? 0) +
          Number(efectivoVentas?.TOTAL ?? 0);
        if (cantidad > saldo + 0.001) {
          return {
            ok: false,
            message: "El retiro no puede ser mayor al monto en caja.",
            saldo,
          };
        }
      }

      await db.runAsync(
        `INSERT INTO MOVIMIENTO_CAJA (ID_CAJA, TIPO, MONTO, CONCEPTO) VALUES (?, ?, ?, ?)`,
        [idCaja, tipo, cantidad, motivo],
      );
      return { ok: true };
    });
  }

  static async cerrarCaja(id) {
    return withDb("Caja.cerrarCaja", async (db) => {
      await runDatabaseMigrations(db);
      await db.runAsync(
        `
                UPDATE HISTORIAL_CAJA
                SET ESTATUS = 0,
                    FECHA_CIERRE = CURRENT_TIMESTAMP
                WHERE ID = ?
                `,
        [id],
      );
    });
  }

  static async eliminarHistorial() {
    const idSucursal = await AsyncStorage.getItem("qrCode");
    if (!idSucursal) {
      return { ok: false, message: "No se encontró la sucursal." };
    }

    return withDb("Caja.eliminarHistorial", async (db) => {
      await runDatabaseMigrations(db);
      const sesiones = await db.getAllAsync(
        `SELECT ID FROM HISTORIAL_CAJA WHERE ID_SUCURSAL = ?`,
        [idSucursal],
      );
      if (!sesiones.length) {
        return { ok: true };
      }

      const ids = sesiones.map((s) => s.ID);
      const placeholders = ids.map(() => "?").join(",");

      await db.runAsync(
        `DELETE FROM CAJA_VENTA WHERE ID_CAJA IN (${placeholders})`,
        ids,
      );
      await db.runAsync(
        `DELETE FROM MOVIMIENTO_CAJA WHERE ID_CAJA IN (${placeholders})`,
        ids,
      );
      await db.runAsync(
        `DELETE FROM HISTORIAL_CAJA WHERE ID_SUCURSAL = ?`,
        [idSucursal],
      );

      return { ok: true };
    });
  }
}
