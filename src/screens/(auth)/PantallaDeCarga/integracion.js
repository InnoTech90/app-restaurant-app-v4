import { deviceApi, getDeviceAuthHeaders } from "../../../utils/http/deviceApi";
import { Database } from "./database";

export class integracionPantallaDeCarga {
  static general = async () => {
    try {
      const headers = await getDeviceAuthHeaders();
      const response = await deviceApi.get("/devices/general", { headers });
      console.log("response general", JSON.stringify(response.data, null, 2));

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
    try {
      const headers = await getDeviceAuthHeaders();
      const response = await deviceApi.get("/devices/expensess", { headers });

      console.log("response gastos", JSON.stringify(response.data, null, 2));

      return 0;

      const gastos = await Database.gastosModel(response.data);
      return gastos;
    } catch (error) {
      if (error.response?.status === 404) {
        return [];
      }

      console.log("status", error.response?.status);
      console.log("data", error.response?.data);
      console.log("headers", error.response?.headers);

      console.error("Error fetching gastos data:", error);

      throw error;
    }
  };
  // creaciones de db sin consulta a la api
  static configuraciones = async () => {
    try {
      await Database.configuracionesModel();
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
  // static paymentMethod = async () => {
  //     try {
  //         const headers = await getDeviceAuthHeaders();
  //         const response = await deviceApi.get('/payment-methods/select-options', { headers });
  //         console.log("response",response.data);

  //     } catch (error) {
  //         console.error("Error fetching payment method data:", error);

  //         throw error;
  // }
  // }
}
