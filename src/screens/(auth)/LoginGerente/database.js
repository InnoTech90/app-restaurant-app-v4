import AsyncStorage from "@react-native-async-storage/async-storage";
import { withDb } from "../../../utils/db";

export class Database {
  /**
   * Lista managers activos (+ owner) para el Select.
   * Formato: [{ label, value, nip, tipo }]
   */
  static async getManagers() {
    return withDb("LoginGerente.getManagers", async (db) => {
      const options = [];

      const managers = await db.getAllAsync(
        `SELECT UUID, NAME, NIP FROM GERENTES WHERE ACTIVO = 1 ORDER BY NAME ASC`,
      );

      for (const manager of managers) {
        options.push({
          label: manager.NAME ?? "Sin nombre",
          value: manager.UUID,
          nip: manager.NIP != null ? String(manager.NIP) : "",
          tipo: "manager",
        });
      }

      const idSucursal = await AsyncStorage.getItem("qrCode");
      if (idSucursal) {
        const config = await db.getFirstAsync(
          `SELECT NIP FROM CONFIGURACIONES WHERE ID_SUCURSAL = ? LIMIT 1`,
          [idSucursal],
        );
        const negocio = await db.getFirstAsync(
          `SELECT NOMBRE_NEGOCIO FROM NEGOCIO LIMIT 1`,
        );

        if (config?.NIP != null && String(config.NIP).trim() !== "") {
          options.unshift({
            label: negocio?.NOMBRE_NEGOCIO
              ? `Owner (${negocio.NOMBRE_NEGOCIO})`
              : "Owner",
            value: "owner",
            nip: String(config.NIP),
            tipo: "owner",
          });
        }
      }

      return options;
    });
  }

  static async getPermisosGerente(uuidGerente) {
    if (!uuidGerente || uuidGerente === "owner") return [];

    return withDb("LoginGerente.getPermisosGerente", async (db) => {
      return db.getAllAsync(
        `SELECT NOMBRE, KEYWORD FROM GERENTE_PERMISOS WHERE ID_GERENTE = ?`,
        [uuidGerente],
      );
    });
  }
}
