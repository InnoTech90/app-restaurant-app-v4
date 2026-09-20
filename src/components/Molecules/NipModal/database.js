import AsyncStorage from "@react-native-async-storage/async-storage";
import { withDb } from "../../../utils/db";

export class dataBase {
  static getConfiguracionesModel = async () => {
    return withDb("NipModal.getConfiguracionesModel", async (db) => {
      const idSucursal = await AsyncStorage.getItem("qrCode");

      if (idSucursal) {
        const porSucursal = await db.getAllAsync(
          `SELECT * FROM CONFIGURACIONES WHERE ID_SUCURSAL = ? LIMIT 1`,
          [idSucursal],
        );
        if (porSucursal.length > 0) return porSucursal;
      }

      return db.getAllAsync(
        `SELECT * FROM CONFIGURACIONES ORDER BY ROWID DESC LIMIT 1`,
      );
    });
  };

  /** NIP del dueño / negocio (CONFIGURACIONES). */
  static getNipDueño = async () => {
    return withDb("NipModal.getNipDueño", async (db) => {
      const idSucursal = await AsyncStorage.getItem("qrCode");
      let config = null;

      if (idSucursal) {
        config = await db.getFirstAsync(
          `SELECT NIP FROM CONFIGURACIONES WHERE ID_SUCURSAL = ? LIMIT 1`,
          [idSucursal],
        );
      }

      if (!config) {
        config = await db.getFirstAsync(
          `SELECT NIP FROM CONFIGURACIONES ORDER BY ROWID DESC LIMIT 1`,
        );
      }

      return config?.NIP != null ? String(config.NIP) : null;
    });
  };

  /**
   * Valida NIP contra gerentes activos (GERENTES).
   * @returns {{ ok: boolean, gerente?: object, reason?: string }}
   */
  static validarNipGerente = async (nipIngresado) => {
    return withDb("NipModal.validarNipGerente", async (db) => {
      const nip = String(nipIngresado ?? "").trim();
      if (!nip) return { ok: false, reason: "empty" };

      const gerentes = await db.getAllAsync(
        `SELECT UUID, NAME, NIP FROM GERENTES
         WHERE ACTIVO = 1 AND NIP IS NOT NULL AND TRIM(NIP) != ''`,
      );

      if (!gerentes || gerentes.length === 0) {
        return { ok: false, reason: "no_gerentes" };
      }

      const match = gerentes.find(
        (g) => String(g.NIP).trim() === nip,
      );
      if (!match) return { ok: false, reason: "invalid" };

      return { ok: true, gerente: match };
    });
  };

  /**
   * Acceso por NIP:
   * - Dueño (CONFIGURACIONES.NIP) → siempre ok
   * - Gerente → ok solo si tiene al menos un keyword requerido
   *   (si keywordsRequired vacío → cualquier gerente activo)
   *
   * @returns {{ ok: boolean, tipo?: 'owner'|'gerente', gerente?: object, reason?: string }}
   */
  static validarNipAcceso = async (nipIngresado, keywordsRequired = []) => {
    return withDb("NipModal.validarNipAcceso", async (db) => {
      const nip = String(nipIngresado ?? "").trim();
      if (!nip) return { ok: false, reason: "empty" };

      const normalizar = (v) =>
        String(v ?? "")
          .trim()
          .toLowerCase();

      const requeridos = (Array.isArray(keywordsRequired) ? keywordsRequired : [])
        .map(normalizar)
        .filter(Boolean);

      // 1) NIP del dueño → acceso total
      let config = null;
      const idSucursal = await AsyncStorage.getItem("qrCode");
      if (idSucursal) {
        config = await db.getFirstAsync(
          `SELECT NIP FROM CONFIGURACIONES WHERE ID_SUCURSAL = ? LIMIT 1`,
          [idSucursal],
        );
      }
      if (!config) {
        config = await db.getFirstAsync(
          `SELECT NIP FROM CONFIGURACIONES ORDER BY ROWID DESC LIMIT 1`,
        );
      }
      const nipDueño =
        config?.NIP != null ? String(config.NIP).trim() : null;

      if (nipDueño && nip === nipDueño) {
        return { ok: true, tipo: "owner" };
      }

      // 2) NIP de gerente → verificar permisos
      const gerentes = await db.getAllAsync(
        `SELECT UUID, NAME, NIP FROM GERENTES
         WHERE ACTIVO = 1 AND NIP IS NOT NULL AND TRIM(NIP) != ''`,
      );

      const match = (gerentes ?? []).find(
        (g) => String(g.NIP).trim() === nip,
      );
      if (!match) return { ok: false, reason: "invalid" };

      // Sin keywords requeridos → cualquier gerente con NIP válido
      if (requeridos.length === 0) {
        return { ok: true, tipo: "gerente", gerente: match };
      }

      const permisos = await db.getAllAsync(
        `SELECT KEYWORD FROM GERENTE_PERMISOS WHERE ID_GERENTE = ?`,
        [match.UUID],
      );
      const otorgados = new Set(
        (permisos ?? [])
          .map((p) => normalizar(p.KEYWORD))
          .filter(Boolean),
      );

      const tienePermiso = requeridos.some((k) => otorgados.has(k));
      if (!tienePermiso) {
        return {
          ok: false,
          reason: "sin_permiso",
          gerente: match,
        };
      }

      return {
        ok: true,
        tipo: "gerente",
        gerente: { ...match, permisos: permisos ?? [] },
      };
    });
  };

  /** Nombre de la sucursal activa. */
  static getNombreSucursal = async () => {
    return withDb("NipModal.getNombreSucursal", async (db) => {
      const qrCode = await AsyncStorage.getItem("qrCode");
      let sucursal = null;

      if (qrCode) {
        sucursal = await db.getFirstAsync(
          `SELECT NOMBRE FROM SUCURSAL WHERE CODIGO_QR = ? LIMIT 1`,
          [qrCode],
        );
      }

      if (!sucursal) {
        sucursal = await db.getFirstAsync(
          `SELECT NOMBRE FROM SUCURSAL ORDER BY ROWID DESC LIMIT 1`,
        );
      }

      return sucursal?.NOMBRE ? String(sucursal.NOMBRE) : null;
    });
  };
}
