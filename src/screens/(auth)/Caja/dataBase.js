import AsyncStorage from "@react-native-async-storage/async-storage";
import { withDb } from "../../../utils/db";
import { runDatabaseMigrations } from "../../../utils/databaseMigrations";

const esEfectivo = (nombre) => /efectivo/i.test(String(nombre ?? ""));

// Cortes que el usuario limpió de esta tablet. El servidor los sigue
// teniendo; aquí se recuerdan para no volver a descargarlos ni mostrarlos.
const OCULTOS_KEY = "caja_historial_ocultos";
const leerOcultos = async () => {
  try {
    const raw = await AsyncStorage.getItem(OCULTOS_KEY);
    const lista = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(lista) ? lista : []);
  } catch {
    return new Set();
  }
};
const guardarOcultos = async (set) => {
  // Solo los más recientes, para no crecer sin límite.
  const lista = [...set].slice(-1000);
  await AsyncStorage.setItem(OCULTOS_KEY, JSON.stringify(lista));
};

export class Database {
  static async getHistorial() {
    const qrData = await AsyncStorage.getItem("qrCode");
    const ocultos = await leerOcultos();

    return withDb("Caja.getHistorial", async (db) => {
      await runDatabaseMigrations(db);
      const sesiones = (
        await db.getAllAsync(
          `
                SELECT *
                FROM HISTORIAL_CAJA
                WHERE ID_SUCURSAL = ?
                ORDER BY FECHA DESC
                `,
          [qrData],
        )
      ).filter((sesion) => !sesion.UUID || !ocultos.has(sesion.UUID));

      if (!sesiones.length) return [];

      await Database.vincularVentasPendientes(db, qrData, sesiones);

      const ids = sesiones.map((s) => s.ID);
      const placeholders = ids.map(() => "?").join(",");
      const movimientos = await db.getAllAsync(
        `
                SELECT ID, ID_CAJA, TIPO, MONTO, CONCEPTO, FECHA, UUID, SINCRONIZADO
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
        const totales = new Map(metodos.map((m) => [m.NOMBRE, 0]));
        for (const venta of ventasSesion) {
          const nombre = venta.METODO || "Otro";
          totales.set(nombre, (totales.get(nombre) ?? 0) + Number(venta.TOTAL ?? 0));
        }
        // Dinero físico: apertura + ventas en efectivo + depósitos - retiros.
        const ventasEfectivo = ventasSesion
          .filter((v) => Number(v.ES_EFECTIVO) === 1 || esEfectivo(v.METODO))
          .reduce((sum, v) => sum + Number(v.TOTAL ?? 0), 0);
        const movimientosEfectivo = [
          {
            clave: "apertura",
            tipo: "apertura",
            concepto: sesion.CONCEPTO || "Apertura",
            monto: Number(sesion.MONTO ?? 0),
            fecha: sesion.FECHA,
          },
          ...(ventasEfectivo > 0
            ? [
                {
                  clave: "ventas",
                  tipo: "ventas",
                  concepto: "Pagos en efectivo",
                  monto: ventasEfectivo,
                  fecha: null,
                },
              ]
            : []),
          ...[...lista]
            .sort((a, b) => String(a.FECHA).localeCompare(String(b.FECHA)) || a.ID - b.ID)
            .map((m) => ({
              clave: `mov-${m.ID}`,
              id: m.ID,
              tipo: m.TIPO,
              concepto: m.CONCEPTO || (m.TIPO === "retiro" ? "Retiro" : "Depósito"),
              monto: Number(m.MONTO ?? 0),
              fecha: m.FECHA,
            })),
        ];
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
          movimientosEfectivo,
          VENTAS_EFECTIVO: ventasEfectivo,
          SALDO: Number(sesion.MONTO ?? 0) + ventasEfectivo + depositos - retiros,
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
    const concepto = String(params?.concepto ?? "").trim();
    if (!concepto) {
      return { ok: false, message: "Indica el concepto de apertura." };
    }

    return withDb("Caja.insertarApertura", async (db) => {
      await runDatabaseMigrations(db);
      const { idSucursal, nombreDispositivo, monto } = params;

      const result = await db.runAsync(
        `
                INSERT INTO HISTORIAL_CAJA
                (
                    ID_SUCURSAL,
                    NOMBRE_DISPOCITIVO,
                    MONTO,
                    ESTATUS,
                    CONCEPTO,
                    SINCRONIZADO,
                    CIERRE_SINCRONIZADO
                )
                VALUES (?, ?, ?, 1, ?, 0, 1)
                `,
        [idSucursal, nombreDispositivo, monto, concepto],
      );
      return { ok: true, id: result.lastInsertRowId };
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
        `SELECT ID, ESTATUS, MONTO, UUID FROM HISTORIAL_CAJA WHERE ID = ?`,
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
        const saldo =
          Number(caja.MONTO ?? 0) +
          Number(sums?.DEPOSITOS ?? 0) -
          Number(sums?.RETIROS ?? 0);
        if (cantidad > saldo + 0.001) {
          return {
            ok: false,
            message: "El retiro no puede ser mayor al monto en caja.",
            saldo,
          };
        }
      }

      const result = await db.runAsync(
        `INSERT INTO MOVIMIENTO_CAJA (ID_CAJA, TIPO, MONTO, CONCEPTO, SINCRONIZADO)
         VALUES (?, ?, ?, ?, 0)`,
        [idCaja, tipo, cantidad, motivo],
      );
      return {
        ok: true,
        id: result.lastInsertRowId,
        uuidCaja: caja.UUID ?? null,
      };
    });
  }

  static async cerrarCaja(id, fondo) {
    const montoFondo = Number(fondo);
    if (!id) {
      return { ok: false, message: "No hay una caja activa." };
    }
    if (!Number.isFinite(montoFondo) || montoFondo < 0) {
      return { ok: false, message: "Ingresa un fondo válido." };
    }

    return withDb("Caja.cerrarCaja", async (db) => {
      await runDatabaseMigrations(db);
      const caja = await db.getFirstAsync(
        `SELECT ID, ESTATUS, UUID FROM HISTORIAL_CAJA WHERE ID = ?`,
        [id],
      );
      if (!caja || Number(caja.ESTATUS) !== 1) {
        return { ok: false, message: "La caja ya está cerrada." };
      }

      await db.runAsync(
        `
                UPDATE HISTORIAL_CAJA
                SET ESTATUS = 0,
                    FECHA_CIERRE = CURRENT_TIMESTAMP,
                    FONDO = ?,
                    CIERRE_SINCRONIZADO = 0
                WHERE ID = ?
                `,
        [montoFondo, id],
      );
      return { ok: true, uuidCaja: caja.UUID ?? null };
    });
  }

  /**
   * Limpia de esta tablet los cortes ya cerrados y sincronizados. La caja
   * abierta y lo pendiente de subir no se tocan. En el servidor (panel web)
   * el historial se conserva.
   */
  static async eliminarHistorial() {
    const idSucursal = await AsyncStorage.getItem("qrCode");
    if (!idSucursal) {
      return { ok: false, message: "No se encontró la sucursal." };
    }
    const ocultos = await leerOcultos();

    const resultado = await withDb("Caja.eliminarHistorial", async (db) => {
      await runDatabaseMigrations(db);
      const sesiones = await db.getAllAsync(
        `SELECT ID, UUID FROM HISTORIAL_CAJA
          WHERE ID_SUCURSAL = ?
            AND COALESCE(ESTATUS, 0) = 0
            AND FECHA_CIERRE IS NOT NULL
            AND COALESCE(SINCRONIZADO, 0) = 1
            AND COALESCE(CIERRE_SINCRONIZADO, 1) = 1`,
        [idSucursal],
      );
      if (!sesiones.length) return { ok: true, eliminados: 0 };

      const ids = sesiones.map((s) => s.ID);
      const placeholders = ids.map(() => "?").join(",");
      await db.runAsync(`DELETE FROM CAJA_VENTA WHERE ID_CAJA IN (${placeholders})`, ids);
      await db.runAsync(`DELETE FROM MOVIMIENTO_CAJA WHERE ID_CAJA IN (${placeholders})`, ids);
      await db.runAsync(`DELETE FROM HISTORIAL_CAJA WHERE ID IN (${placeholders})`, ids);
      sesiones.forEach((s) => s.UUID && ocultos.add(s.UUID));
      return { ok: true, eliminados: ids.length };
    });

    if (resultado?.eliminados) await guardarOcultos(ocultos);
    return resultado;
  }

  /**
   * Corrige un corte en la tablet: apertura (monto/concepto), fondo de cierre
   * y monto/concepto de sus depósitos y retiros.
   */
  static async actualizarCorte(idCaja, { monto, concepto, fondo, movimientos = [] }) {
    return withDb("Caja.actualizarCorte", async (db) => {
      await runDatabaseMigrations(db);
      await db.runAsync(
        `UPDATE HISTORIAL_CAJA
            SET MONTO = COALESCE(?, MONTO),
                CONCEPTO = COALESCE(?, CONCEPTO),
                FONDO = CASE WHEN ESTATUS = 0 THEN COALESCE(?, FONDO) ELSE FONDO END
          WHERE ID = ?`,
        [monto ?? null, concepto ?? null, fondo ?? null, idCaja],
      );
      for (const mov of movimientos) {
        await db.runAsync(
          `UPDATE MOVIMIENTO_CAJA
              SET MONTO = COALESCE(?, MONTO),
                  CONCEPTO = COALESCE(?, CONCEPTO)
            WHERE ID = ? AND ID_CAJA = ?`,
          [mov.monto ?? null, mov.concepto ?? null, mov.id, idCaja],
        );
      }
      return { ok: true };
    });
  }

  static async eliminarMovimiento(id) {
    if (!id) return { ok: false };
    return withDb("Caja.eliminarMovimiento", async (db) => {
      await db.runAsync(`DELETE FROM MOVIMIENTO_CAJA WHERE ID = ?`, [id]);
      return { ok: true };
    });
  }

  static async eliminarSesion(id) {
    if (!id) return { ok: false };
    return withDb("Caja.eliminarSesion", async (db) => {
      await db.runAsync(`DELETE FROM MOVIMIENTO_CAJA WHERE ID_CAJA = ?`, [id]);
      await db.runAsync(`DELETE FROM HISTORIAL_CAJA WHERE ID = ?`, [id]);
      return { ok: true };
    });
  }

  static async marcarSesionSincronizada(id, uuid) {
    return withDb("Caja.marcarSesionSincronizada", async (db) => {
      await db.runAsync(
        `UPDATE HISTORIAL_CAJA
         SET UUID = ?, SINCRONIZADO = 1
         WHERE ID = ?`,
        [uuid, id],
      );
      return { ok: true };
    });
  }

  static async marcarCierreSincronizado(id) {
    return withDb("Caja.marcarCierreSincronizado", async (db) => {
      await db.runAsync(
        `UPDATE HISTORIAL_CAJA
         SET CIERRE_SINCRONIZADO = 1
         WHERE ID = ?`,
        [id],
      );
      return { ok: true };
    });
  }

  static async marcarMovimientoSincronizado(id, uuid) {
    return withDb("Caja.marcarMovimientoSincronizado", async (db) => {
      await db.runAsync(
        `UPDATE MOVIMIENTO_CAJA
         SET UUID = ?, SINCRONIZADO = 1
         WHERE ID = ?`,
        [uuid, id],
      );
      return { ok: true };
    });
  }

  static async getPendientesParaSincronizar() {
    const idSucursal = await AsyncStorage.getItem("qrCode");
    return withDb("Caja.getPendientesParaSincronizar", async (db) => {
      await runDatabaseMigrations(db);
      const sesiones = await db.getAllAsync(
        `
        SELECT *
        FROM HISTORIAL_CAJA
        WHERE ID_SUCURSAL = ?
          AND (
            SINCRONIZADO = 0
            OR (ESTATUS = 0 AND CIERRE_SINCRONIZADO = 0)
          )
        ORDER BY FECHA ASC
        `,
        [idSucursal],
      );

      const movimientos = await db.getAllAsync(
        `
        SELECT m.*, c.UUID AS UUID_CAJA
        FROM MOVIMIENTO_CAJA m
        INNER JOIN HISTORIAL_CAJA c ON c.ID = m.ID_CAJA
        WHERE c.ID_SUCURSAL = ?
          AND m.SINCRONIZADO = 0
        ORDER BY m.FECHA ASC, m.ID ASC
        `,
        [idSucursal],
      );

      return { sesiones, movimientos };
    });
  }

  static async upsertDesdeApi(registros, idSucursal) {
    const ocultos = await leerOcultos();
    return withDb("Caja.upsertDesdeApi", async (db) => {
      await runDatabaseMigrations(db);

      for (const registro of registros ?? []) {
        const uuid = registro.id;
        if (!uuid || ocultos.has(uuid)) continue;

        let local = await db.getFirstAsync(
          `SELECT ID FROM HISTORIAL_CAJA WHERE UUID = ?`,
          [uuid],
        );

        if (!local) {
          const localId = extraerIdLocal(registro.externalId, "caja-local-");
          if (localId) {
            local = await db.getFirstAsync(
              `SELECT ID FROM HISTORIAL_CAJA WHERE ID = ?`,
              [localId],
            );
          }
        }

        const estatus = registro.status === "open" ? 1 : 0;
        const payload = [
          idSucursal,
          registro.deviceName ?? null,
          registro.openedAt ?? null,
          registro.closedAt ?? null,
          estatus,
          Number(registro.openingAmount ?? 0),
          registro.openingConcept ?? "",
          registro.closingFund == null ? null : Number(registro.closingFund),
          uuid,
        ];

        let idCaja = local?.ID;
        if (local) {
          await db.runAsync(
            `
            UPDATE HISTORIAL_CAJA
            SET ID_SUCURSAL = ?,
                NOMBRE_DISPOCITIVO = ?,
                FECHA = ?,
                FECHA_CIERRE = ?,
                ESTATUS = ?,
                MONTO = ?,
                CONCEPTO = ?,
                FONDO = ?,
                UUID = ?,
                SINCRONIZADO = 1,
                CIERRE_SINCRONIZADO = 1
            WHERE ID = ?
            `,
            [...payload, local.ID],
          );
        } else {
          const insert = await db.runAsync(
            `
            INSERT INTO HISTORIAL_CAJA
            (
              ID_SUCURSAL,
              NOMBRE_DISPOCITIVO,
              FECHA,
              FECHA_CIERRE,
              ESTATUS,
              MONTO,
              CONCEPTO,
              FONDO,
              UUID,
              SINCRONIZADO,
              CIERRE_SINCRONIZADO
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1)
            `,
            payload,
          );
          idCaja = insert.lastInsertRowId;
        }

        for (const movimiento of registro.movements ?? []) {
          if (!movimiento?.id || !idCaja) continue;
          const tipo =
            movimiento.type === "withdrawal" ? "retiro" : "deposito";
          let localMov = await db.getFirstAsync(
            `SELECT ID FROM MOVIMIENTO_CAJA WHERE UUID = ?`,
            [movimiento.id],
          );
          if (!localMov) {
            const movLocalId = extraerIdLocal(
              movimiento.externalId,
              "mov-local-",
            );
            if (movLocalId) {
              localMov = await db.getFirstAsync(
                `SELECT ID FROM MOVIMIENTO_CAJA WHERE ID = ?`,
                [movLocalId],
              );
            }
          }

          if (localMov) {
            await db.runAsync(
              `
              UPDATE MOVIMIENTO_CAJA
              SET ID_CAJA = ?,
                  TIPO = ?,
                  MONTO = ?,
                  CONCEPTO = ?,
                  FECHA = ?,
                  UUID = ?,
                  SINCRONIZADO = 1
              WHERE ID = ?
              `,
              [
                idCaja,
                tipo,
                Number(movimiento.amount ?? 0),
                movimiento.concept ?? "",
                movimiento.movementDate ?? null,
                movimiento.id,
                localMov.ID,
              ],
            );
          } else {
            await db.runAsync(
              `
              INSERT INTO MOVIMIENTO_CAJA
              (ID_CAJA, TIPO, MONTO, CONCEPTO, FECHA, UUID, SINCRONIZADO)
              VALUES (?, ?, ?, ?, ?, ?, 1)
              `,
              [
                idCaja,
                tipo,
                Number(movimiento.amount ?? 0),
                movimiento.concept ?? "",
                movimiento.movementDate ?? null,
                movimiento.id,
              ],
            );
          }
        }
      }
    });
  }
}

const extraerIdLocal = (valor, prefijo) => {
  const raw = String(valor ?? "");
  if (!raw.startsWith(prefijo)) return null;
  const id = Number(raw.slice(prefijo.length));
  return Number.isFinite(id) ? id : null;
};
