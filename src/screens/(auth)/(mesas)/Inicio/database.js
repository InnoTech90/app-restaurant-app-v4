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
                    C.ID AS ID_COMANDA_ACTIVA,
                    C.FICHA AS FICHA_COMANDA,
                    CASE WHEN C.ID IS NOT NULL THEN 1 ELSE 0 END AS TIENE_COMANDA_ACTIVA
                FROM MESA M
                LEFT JOIN COMANDA C
                    ON C.ID_MESA = M.UUID
                    AND C.ESTATUS IN (0, 4)
                    AND COALESCE(C.ACTIVO, 1) = 1
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

      await PantallaDeCargaDatabase.mesasModel(response.data);
      console.log("✅ Mesas actualizadas desde API");

      return await this.getMesas();
    } catch (error) {
      console.error("⚠️ Error actualizando mesas desde API:", error);
      return await this.getMesas();
    }
  }

  static async actualizarNotaMesa(uuidMesa, nota) {
    return withDb("Inicio.actualizarNotaMesa", async (db) => {
      await db.runAsync(`UPDATE MESA SET NOTA = ? WHERE UUID = ?`, [
        nota ?? "",
        uuidMesa,
      ]);
    });
  }

  /**
   * Mueve la comanda abierta de una mesa a otra libre.
   */
  static async cambiarMesa(uuidMesaOrigen, uuidMesaDestino) {
    return withDb("Inicio.cambiarMesa", async (db) => {
      if (!uuidMesaOrigen || !uuidMesaDestino) {
        throw new Error("Mesas origen y destino son requeridas");
      }
      if (uuidMesaOrigen === uuidMesaDestino) {
        throw new Error("La mesa destino debe ser distinta");
      }

      const destinoOcupada = await db.getFirstAsync(
        `SELECT ID FROM COMANDA
         WHERE ID_MESA = ? AND ESTATUS IN (0, 4) AND COALESCE(ACTIVO, 1) = 1
         LIMIT 1`,
        [uuidMesaDestino],
      );
      if (destinoOcupada) {
        const err = new Error("La mesa destino está ocupada");
        err.code = "MESA_OCUPADA";
        throw err;
      }

      const comanda = await db.getFirstAsync(
        `SELECT ID FROM COMANDA
         WHERE ID_MESA = ? AND ESTATUS IN (0, 4) AND COALESCE(ACTIVO, 1) = 1
         LIMIT 1`,
        [uuidMesaOrigen],
      );
      if (!comanda) {
        const err = new Error("No hay comanda activa en la mesa origen");
        err.code = "SIN_COMANDA";
        throw err;
      }

      await db.runAsync(`UPDATE COMANDA SET ID_MESA = ? WHERE ID = ?`, [
        uuidMesaDestino,
        comanda.ID,
      ]);

      await db.runAsync(
        `UPDATE MESA SET ESTATUS = 0, ID_COMANDA = NULL WHERE UUID = ?`,
        [uuidMesaOrigen],
      );
      await db.runAsync(
        `UPDATE MESA SET ESTATUS = 1, ID_COMANDA = ? WHERE UUID = ?`,
        [comanda.ID, uuidMesaDestino],
      );

      return { idComanda: comanda.ID, uuidMesaDestino };
    });
  }
}
