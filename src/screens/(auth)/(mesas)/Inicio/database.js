import { withDb } from "../../../../utils/db";
import {
  deviceApi,
  getDeviceAuthHeaders,
} from "../../../../utils/http/deviceApi";
import { Database as PantallaDeCargaDatabase } from "../../PantallaDeCarga/database";

export class Database {
  // estatus
  // 0: abierta
  // 1: pagada
  // 2: cancelada
  // 3: pendiente de pago
  // 4: comanda impresa (cuenta impresa, pendiente de confirmar pago)
  /** Devuelve todas las mesas con el campo TIENE_COMANDA_ACTIVA (1/0) */
  static async getMesas() {
    return withDb("Inicio.getMesas", async (db) => {
      const mesas = await db.getAllAsync(`
                SELECT
                    M.*,
                    CASE WHEN C.ID IS NOT NULL THEN 1 ELSE 0 END AS TIENE_COMANDA_ACTIVA
                FROM MESA M
                LEFT JOIN COMANDA C
                    ON C.ID_MESA = M.UUID
                    AND C.ESTATUS IN (0, 4)
                    AND C.ACTIVO = 1
                ORDER BY M.ID
            `);
      return mesas;
    });
  }

  static async getComandaAbierta(idMesa) {
    return withDb("Inicio.getComandaAbierta", async (db) => {
      const comanda = await db.getFirstAsync(
        `SELECT * FROM COMANDA WHERE ID_MESA = ? AND ESTATUS IN (0, 4) AND ACTIVO = 1 LIMIT 1`,
        [idMesa],
      );
      return comanda;
    });
  }

  /**
   * Obtiene mesas desde la API y las guarda en la BD.
   * Luego retorna todas las mesas actualizadas desde la BD local.
   */
  static async actualizarMesasDesdeAPI() {
    try {
      console.log("🔄 Obteniendo mesas desde API...");
      const headers = await getDeviceAuthHeaders();
      const response = await deviceApi.get("/devices/table", { headers });

      // Guardar las nuevas mesas en la BD
      await PantallaDeCargaDatabase.mesasModel(response.data);
      console.log("✅ Mesas actualizadas desde API");

      // Retornar todas las mesas desde la BD local
      return await this.getMesas();
    } catch (error) {
      console.error("⚠️ Error actualizando mesas desde API:", error);
      // Si hay error en la API, retornar mesas del cache local
      return await this.getMesas();
    }
  }
}
