import { enCola } from "../../../utils/http/sincronizarEnSegundoPlano";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  esErrorDeConexion,
  obtenerMensajeErrorRed,
  verificarConexionInternet,
} from "../../../utils/ConeccionAInternet/ConeccionAInternet";
import { deviceApi, getDeviceAuthHeaders } from "../../../utils/http/deviceApi";
import { Database } from "./dataBase";

const mapearMensajeApi = (texto) => {
  const raw = String(texto ?? "");
  const limpio = raw.includes(" :: ")
    ? raw.split(" :: ").slice(1).join(" :: ").trim()
    : raw.trim();
  const lower = limpio.toLowerCase();

  if (lower.includes("already an open cash register")) {
    return "Ya hay una caja abierta en esta sucursal.";
  }
  if (lower.includes("opening concept is required")) {
    return "Indica el concepto de apertura de caja.";
  }
  if (lower.includes("already closed")) {
    return "La caja ya está cerrada.";
  }
  if (lower.includes("insufficient cash")) {
    const disponible = limpio.match(/available:\s*([0-9.]+)/i)?.[1];
    return disponible
      ? `En caja hay $${Number(disponible).toFixed(2)}. El retiro no puede ser mayor al monto en caja.`
      : "El retiro no puede ser mayor al monto en caja.";
  }
  if (lower.includes("withdrawals can only")) {
    return "El retiro solo se puede hacer con la caja abierta.";
  }
  if (lower.includes("open the cash register to register a deposit")) {
    return "Abre la caja para registrar un depósito.";
  }
  if (lower.includes("cash register not found")) {
    return "No hay una caja activa.";
  }
  if (lower.includes("closing fund")) {
    return "Ingresa el fondo que deja en caja.";
  }
  return limpio || null;
};

const mensajeErrorApi = (error) => {
  const data = error?.response?.data;
  const message = data?.message ?? data?.error ?? data?.detalle;
  if (Array.isArray(message)) {
    return mapearMensajeApi(message.filter(Boolean).join("\n"));
  }
  if (typeof message === "string" && message.trim()) {
    return mapearMensajeApi(message);
  }
  if (typeof data === "string" && data.trim()) {
    return mapearMensajeApi(data);
  }
  return null;
};

const toIso = (fecha) => {
  if (!fecha) return new Date().toISOString();
  const raw = String(fecha).trim();
  const normalizada = raw.includes("T") ? raw : raw.replace(" ", "T");
  const sinZona = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(normalizada);
  const date = new Date(sinZona ? `${normalizada}Z` : normalizada);
  if (Number.isNaN(date.getTime())) return new Date().toISOString();
  return date.toISOString();
};

const tipoApi = (tipo) =>
  tipo === "retiro" ? "withdrawal" : "deposit";

export class integracionCaja {
  static getHistorial = async () => {
    const hayInternet = await verificarConexionInternet();
    if (hayInternet) {
      try {
        await integracionCaja.sincronizarPendientes();
      } catch (error) {
        if (!esErrorDeConexion(error)) {
          console.warn("Caja sync pendientes:", error?.message ?? error);
        }
      }
      try {
        await integracionCaja.descargarHistorial();
      } catch (error) {
        if (!esErrorDeConexion(error)) {
          console.warn("Caja descargar historial:", error?.message ?? error);
        }
      }
    }
    return Database.getHistorial();
  };

  static descargarHistorial = async () => {
    const headers = await getDeviceAuthHeaders();
    const idSucursal = await AsyncStorage.getItem("qrCode");
    const response = await deviceApi.get("/devices/cash", {
      headers,
      params: { scope: "branch" },
    });
    const registros = Array.isArray(response?.data) ? response.data : [];
    await Database.upsertDesdeApi(registros, idSucursal);
    return registros;
  };

  static abrirCaja = async ({ idSucursal, nombreDispositivo, monto, concepto }) => {
    const local = await Database.insertarApertura({
      idSucursal,
      nombreDispositivo,
      monto,
      concepto,
    });
    if (local && local.ok === false) return local;

    // Sin internet: queda en local sin esperar el tiempo límite de la API.
    if (!(await verificarConexionInternet())) {
      return { ok: true, id: local.id, offline: true };
    }

    try {
      const headers = await getDeviceAuthHeaders();
      const response = await deviceApi.post(
        "/devices/cash/open",
        {
          openingAmount: Number(monto),
          openingConcept: String(concepto).trim(),
          externalId: `caja-local-${local.id}`,
        },
        { headers },
      );
      const uuid = response?.data?.id;
      if (uuid) {
        await Database.marcarSesionSincronizada(local.id, uuid);
      }
      return { ok: true, id: local.id, uuid };
    } catch (error) {
      if (esErrorDeConexion(error)) {
        return { ok: true, id: local.id, offline: true };
      }
      const conflicto = String(
        error?.response?.data?.message ?? error?.message ?? "",
      ).toLowerCase();
      if (conflicto.includes("already an open cash register")) {
        try {
          await integracionCaja.descargarHistorial();
          await Database.eliminarSesion(local.id);
          return {
            ok: false,
            message: mapearMensajeApi(error?.response?.data?.message),
          };
        } catch {
          await Database.eliminarSesion(local.id);
        }
      } else {
        await Database.eliminarSesion(local.id);
      }
      return {
        ok: false,
        message:
          mensajeErrorApi(error) ||
          obtenerMensajeErrorRed(error, "No se pudo abrir la caja."),
      };
    }
  };

  static registrarMovimiento = async ({ idCaja, tipo, monto, concepto }) => {
    const local = await Database.insertarMovimiento({
      idCaja,
      tipo,
      monto,
      concepto,
    });
    if (local && local.ok === false) return local;

    if (!local.uuidCaja || !(await verificarConexionInternet())) {
      return { ok: true, id: local.id, offline: true };
    }

    try {
      const headers = await getDeviceAuthHeaders();
      const response = await deviceApi.post(
        `/devices/cash/${local.uuidCaja}/movements`,
        {
          type: tipoApi(tipo),
          amount: Number(monto),
          concept: String(concepto).trim(),
          externalId: `mov-local-${local.id}`,
        },
        { headers },
      );
      const uuid = response?.data?.movement?.id;
      if (uuid) {
        await Database.marcarMovimientoSincronizado(local.id, uuid);
      }
      return { ok: true, id: local.id, uuid };
    } catch (error) {
      if (esErrorDeConexion(error)) {
        return { ok: true, id: local.id, offline: true };
      }
      await Database.eliminarMovimiento(local.id);
      return {
        ok: false,
        message:
          mensajeErrorApi(error) ||
          obtenerMensajeErrorRed(error, "No se pudo guardar el movimiento."),
        saldo: extraerSaldo(error),
      };
    }
  };

  /**
   * Edita un corte del historial. Si ya está en el servidor se corrige allá
   * primero (requiere internet); si aún no se sube, basta con la tablet y la
   * sincronización enviará los valores corregidos.
   * cambios: { monto?, concepto?, fondo?, movimientos?: [{ id, uuid?, monto?, concepto? }] }
   */
  static editarCorte = async (sesion, cambios) => {
    const enServidor = !!sesion?.UUID && Number(sesion?.SINCRONIZADO) === 1;
    if (enServidor) {
      if (!(await verificarConexionInternet())) {
        return {
          ok: false,
          message:
            "Este corte ya está en el servidor. Conéctate a internet para editarlo.",
        };
      }
      const payload = {};
      if (cambios.monto !== undefined) payload.openingAmount = Number(cambios.monto);
      if (cambios.concepto !== undefined) payload.openingConcept = String(cambios.concepto).trim();
      if (
        cambios.fondo !== undefined &&
        Number(sesion.ESTATUS) === 0 &&
        Number(sesion.CIERRE_SINCRONIZADO ?? 1) === 1
      ) {
        payload.closingFund = Number(cambios.fondo);
      }
      const movimientosServidor = (cambios.movimientos ?? [])
        .filter((m) => m.uuid)
        .map((m) => ({
          id: m.uuid,
          ...(m.monto !== undefined ? { amount: Number(m.monto) } : {}),
          ...(m.concepto !== undefined ? { concept: String(m.concepto).trim() } : {}),
        }));
      if (movimientosServidor.length) payload.movements = movimientosServidor;

      if (Object.keys(payload).length) {
        try {
          const headers = await getDeviceAuthHeaders();
          await deviceApi.patch(`/devices/cash/${sesion.UUID}`, payload, { headers });
        } catch (error) {
          const status = error?.response?.status;
          return {
            ok: false,
            message:
              status === 404 && !error?.response?.data?.message
                ? "El servidor aún no tiene la edición de caja. Actualiza el backend."
                : mensajeErrorApi(error) ||
                  obtenerMensajeErrorRed(error, "No se pudo editar el corte."),
          };
        }
      }
    }
    return Database.actualizarCorte(sesion.ID, cambios);
  };

  static cerrarCaja = async (id, fondo) => {
    const local = await Database.cerrarCaja(id, fondo);
    if (local && local.ok === false) return local;

    if (!local.uuidCaja || !(await verificarConexionInternet())) {
      return { ok: true, offline: true };
    }

    try {
      const headers = await getDeviceAuthHeaders();
      await deviceApi.post(
        `/devices/cash/${local.uuidCaja}/close`,
        { closingFund: Number(fondo) },
        { headers },
      );
      await Database.marcarCierreSincronizado(id);
      return { ok: true };
    } catch (error) {
      if (esErrorDeConexion(error)) {
        return { ok: true, offline: true };
      }
      const raw = String(error?.response?.data?.message ?? "").toLowerCase();
      if (raw.includes("already closed")) {
        await Database.marcarCierreSincronizado(id);
        return { ok: true };
      }
      return { ok: true, offline: true };
    }
  };

  static sincronizarPendientes = async () => {
    const hayInternet = await verificarConexionInternet();
    if (!hayInternet) return { sincronizados: 0 };

    const { sesiones, movimientos } = await Database.getPendientesParaSincronizar();
    const headers = await getDeviceAuthHeaders();
    let sincronizados = 0;

    const records = (sesiones ?? [])
      .filter((sesion) => Number(sesion.SINCRONIZADO) === 0)
      .map((sesion) => ({
        openingAmount: Number(sesion.MONTO ?? 0),
        openingConcept: String(sesion.CONCEPTO ?? "").trim() || "Apertura de caja",
        openedAt: toIso(sesion.FECHA),
        status: Number(sesion.ESTATUS) === 1 ? "open" : "closed",
        closingFund:
          Number(sesion.ESTATUS) === 1
            ? undefined
            : Number(sesion.FONDO ?? 0),
        closedAt:
          Number(sesion.ESTATUS) === 1 ? undefined : toIso(sesion.FECHA_CIERRE),
        deviceName: sesion.NOMBRE_DISPOCITIVO ?? undefined,
        externalId: `caja-local-${sesion.ID}`,
        movements: (movimientos ?? [])
          .filter((mov) => Number(mov.ID_CAJA) === Number(sesion.ID))
          .map((mov) => ({
            type: tipoApi(mov.TIPO),
            amount: Number(mov.MONTO ?? 0),
            concept: String(mov.CONCEPTO ?? "").trim() || "Movimiento",
            movementDate: toIso(mov.FECHA),
            externalId: `mov-local-${mov.ID}`,
          })),
      }));

    if (records.length) {
      await deviceApi.post(
        "/devices/cash/synchronize",
        { records },
        { headers },
      );
      await integracionCaja.descargarHistorial();
      sincronizados += records.length;
    }

    const movimientosSueltos = (movimientos ?? []).filter(
      (mov) => mov.UUID_CAJA && Number(mov.SINCRONIZADO) === 0,
    );
    for (const movimiento of movimientosSueltos) {
      try {
        const response = await deviceApi.post(
          `/devices/cash/${movimiento.UUID_CAJA}/movements`,
          {
            type: tipoApi(movimiento.TIPO),
            amount: Number(movimiento.MONTO ?? 0),
            concept: String(movimiento.CONCEPTO ?? "").trim() || "Movimiento",
            movementDate: toIso(movimiento.FECHA),
            externalId: `mov-local-${movimiento.ID}`,
          },
          { headers },
        );
        const uuid = response?.data?.movement?.id;
        if (uuid) {
          await Database.marcarMovimientoSincronizado(movimiento.ID, uuid);
          sincronizados += 1;
        }
      } catch (error) {
        if (!esErrorDeConexion(error)) {
          console.warn("Caja sync movimiento:", error?.message ?? error);
        }
      }
    }

    const cierres = (sesiones ?? []).filter(
      (sesion) =>
        Number(sesion.ESTATUS) === 0 &&
        sesion.UUID &&
        Number(sesion.CIERRE_SINCRONIZADO) === 0,
    );
    for (const sesion of cierres) {
      try {
        await deviceApi.post(
          `/devices/cash/${sesion.UUID}/close`,
          { closingFund: Number(sesion.FONDO ?? 0) },
          { headers },
        );
        await Database.marcarCierreSincronizado(sesion.ID);
        sincronizados += 1;
      } catch (error) {
        if (!esErrorDeConexion(error)) {
          console.warn("Caja sync cierre:", error?.message ?? error);
        }
      }
    }

    return { sincronizados };
  };
}

const extraerSaldo = (error) => {
  const raw = String(error?.response?.data?.message ?? "");
  const match = raw.match(/available:\s*([0-9.]+)/i);
  if (!match) return null;
  const saldo = Number(match[1]);
  return Number.isFinite(saldo) ? saldo : null;
};

// Una sincronización a la vez por módulo (botón manual + subida automática).
integracionCaja.sincronizarPendientes = enCola("caja", integracionCaja.sincronizarPendientes);
