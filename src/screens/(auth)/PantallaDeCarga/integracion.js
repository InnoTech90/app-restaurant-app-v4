import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Database } from "./database";

const API_URL = 'https://api.apprestaurants.com/v1';
export class integracionPantallaDeCarga {



    static general = async () => {
        try {
            const deviceKey = await AsyncStorage.getItem('deviceKey');
            const qrCode = await AsyncStorage.getItem('qrCode');
            console.log("deviceKey",deviceKey);
            console.log("qrCode",qrCode)
            const response = await axios.get(`${API_URL}/devices/general`, {
                headers: {
                    'device-key': deviceKey,
                    'x-api-key': qrCode,
                    'Content-Type': 'application/json'
                }
            });
            console.log("response general",JSON.stringify(response.data, null, 2));
            await Database.generalModel(response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching general data:", error);

            throw error;
        }
    }
    static table = async () => {
        try {
            const deviceKey = await AsyncStorage.getItem('deviceKey');
            const qrCode = await AsyncStorage.getItem('qrCode');
            const response = await axios.get(`${API_URL}/devices/table`, {
                headers: {
                    'device-key': deviceKey,
                    'x-api-key': qrCode,
                    'Content-Type': 'application/json'
                }
            });
            await Database.mesasModel(response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching table data:", error);

            throw error;
        }
    }
    static clientes = async () => {
        try {
            const deviceKey = await AsyncStorage.getItem('deviceKey');
            const qrCode = await AsyncStorage.getItem('qrCode');
            const response = await axios.get(`${API_URL}/devices/diner`, {
                headers: {
                    'device-key': deviceKey,
                    'x-api-key': qrCode,
                    'Content-Type': 'application/json'
                }
            });

            await Database.clientesModel(response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching clientes data:", error);

            throw error;
        }
    }
    static inventory = async () => {
        try {
            const deviceKey = await AsyncStorage.getItem('deviceKey');
            const qrCode = await AsyncStorage.getItem('qrCode');
            const response = await axios.get(`${API_URL}/devices/inventory`, {
                headers: {
                    'device-key': deviceKey,
                    'x-api-key': qrCode,
                    'Content-Type': 'application/json'
                }
            });

            await Database.inventoryModel(response.data);

            return response.data;

        } catch (error) {
            console.error("Error fetching inventory data:", error);

            throw error;
        }
    }
    static menu = async () => {
        try {
            const deviceKey = await AsyncStorage.getItem('deviceKey');
            const qrCode = await AsyncStorage.getItem('qrCode');
            const response = await axios.get(`${API_URL}/devices/menu`, {
                headers: {
                    'device-key': deviceKey,
                    'x-api-key': qrCode,
                    'Content-Type': 'application/json'
                }
            });

            await Database.menuModel(response.data);
            return response.data;

        } catch (error) {
            console.error("Error fetching menu data:", error);

            throw error;
        }
    }
    static gastos = async () => {
        try {
            const deviceKey = await AsyncStorage.getItem('deviceKey');
            const qrCode = await AsyncStorage.getItem('qrCode');
            const response = await axios.get(`${API_URL}/devices/expensess`, {
                headers: {
                    'device-key': deviceKey,
                    'x-api-key': qrCode,
                    'Content-Type': 'application/json'
                }
            });

            await Database.gastosModel(response.data);
            return response.data;

        } catch (error) {
            console.error("Error fetching gastos data:", error);

            throw error;
        }
    }
    // creaciones de db sin consulta a la api
    static configuraciones = async () => {
        try {
            await Database.configuracionesModel();
        } catch (error) {
            console.error("Error fetching configuraciones data:", error);

            throw error;
        }
    }
    static historialCaja = async () => {
        try {
            await Database.historialCajaModel();
        } catch (error) {
            console.error("Error fetching historialCaja data:", error);

            throw error;
        }
    }
    static comandaTable = async () => {
        try {
            await Database.comandaTableModel();
        } catch (error) {
            console.error("Error fetching comanda data:", error);

            throw error;
        }
    }
    // static paymentMethod = async () => {
    //     try {
    //         const deviceKey = await AsyncStorage.getItem('deviceKey');
    //         const qrCode = await AsyncStorage.getItem('qrCode');
    //         const response = await axios.get(`${API_URL}/payment-methods/select-options`, {
    //             headers: {
    //                 'device-key': deviceKey,
    //                 'x-api-key': qrCode,
    //                 'Content-Type': 'application/json'
    //             }
    //         });
    //         console.log("response",response.data);
            
            
    //     } catch (error) {
    //         console.error("Error fetching payment method data:", error);

    //         throw error;
        // }
    // }
}

