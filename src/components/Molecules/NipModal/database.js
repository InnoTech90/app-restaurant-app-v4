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
