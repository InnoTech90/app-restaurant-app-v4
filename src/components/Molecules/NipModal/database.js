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

  /**
   * NIP del manager/owner autenticado (desde GERENTES o CONFIGURACIONES).
   */
  static getNipGerenteAutenticado = async (gerenteSesion) => {
    if (!gerenteSesion?.id) return null;

    return withDb("NipModal.getNipGerenteAutenticado", async (db) => {
      if (gerenteSesion.tipo === "owner" || gerenteSesion.id === "owner") {
        const idSucursal = await AsyncStorage.getItem("qrCode");
        if (!idSucursal) return null;
        const config = await db.getFirstAsync(
          `SELECT NIP FROM CONFIGURACIONES WHERE ID_SUCURSAL = ? LIMIT 1`,
          [idSucursal],
        );
        return config?.NIP != null ? String(config.NIP) : null;
      }

      const gerente = await db.getFirstAsync(
        `SELECT NIP FROM GERENTES WHERE UUID = ? AND ACTIVO = 1 LIMIT 1`,
        [gerenteSesion.id],
      );
      return gerente?.NIP != null ? String(gerente.NIP) : null;
    });
  };
}
