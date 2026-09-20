import { initializeSchema } from "../../../utils/db";
import { deviceApi, getDeviceAuthHeaders } from "../../../utils/http/deviceApi";
import { Database } from "./database";

export class integracionPantallaDeCarga {
  /**
   * Inicializa el esquema de base de datos antes de cargar datos.
   * Debe llamarse antes que cualquier otro método.
   */
  static initializeDatabase = async () => {
    try {
      console.log("📱 Inicializando esquema de base de datos...");
      const result = await initializeSchema();
      console.log("✅ Esquema de base de datos inicializado", result);
      return result;
    } catch (error) {
      console.error("❌ Error inicializando esquema:", error);
      throw error;
    }
  };

  static general = async () => {
    try {
      const headers = await getDeviceAuthHeaders();
      const response = await deviceApi.get("/devices/general", { headers });

      await Database.generalModel(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching general data: dexd", error);

      throw error;
    }
  };
  static table = async () => {
    try {
      const headers = await getDeviceAuthHeaders();
      const response = await deviceApi.get("/devices/table", { headers });
      await Database.mesasModel(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching table data:", error);

      throw error;
    }
  };
  static clientes = async () => {
    try {
      const headers = await getDeviceAuthHeaders();
      const response = await deviceApi.get("/devices/diner", { headers });

      await Database.clientesModel(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching clientes data:", error);

      throw error;
    }
  };
  static inventory = async () => {
    try {
      const headers = await getDeviceAuthHeaders();
      const response = await deviceApi.get("/devices/inventory", { headers });

      await Database.inventoryModel(response.data);

      return response.data;
    } catch (error) {
      console.error("Error fetching inventory data:", error);

      throw error;
    }
  };
  static menu = async () => {
    try {
      const headers = await getDeviceAuthHeaders();
      const response = await deviceApi.get("/devices/menu", { headers });

      await Database.menuModel(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching menu data:", error);

      throw error;
    }
  };
  static gastos = async () => {
    // expenseGroups se sincronizan desde /devices/general (generalModel → gastosModel).
    // Se mantiene el método por compatibilidad con el flujo de carga.
    return [];
  };
  // creaciones de db sin consulta a la api
  static configuraciones = async (generalData = null) => {
    try {
      const ctx = generalData
        ? Database.getConfigContextFromGeneral(generalData)
        : {};
      await Database.configuracionesModel(ctx);
    } catch (error) {
      console.error("Error fetching configuraciones data:", error);

      throw error;
    }
  };
  static historialCaja = async () => {
    try {
      await Database.historialCajaModel();
    } catch (error) {
      console.error("Error fetching historialCaja data:", error);

      throw error;
    }
  };
  static comandaTable = async () => {
    try {
      await Database.comandaTableModel();
    } catch (error) {
      console.error("Error fetching comanda data:", error);

      throw error;
    }
  };
}
