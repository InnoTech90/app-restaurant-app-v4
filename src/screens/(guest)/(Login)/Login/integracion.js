import axios from "axios";
import * as Device from 'expo-device';
import { Platform } from "react-native";
const API_URL = 'https://api.apprestaurants.com/v1';
export class ApiLogin {
    static async login(codigoSucursal) {
        try {

            let id;
            if (Platform.OS === 'android') {
                const uniqueString = [
                    Device.brand || '',
                    Device.modelName || '',
                    Device.osBuildFingerprint || '',
                    Device.totalMemory || '',
                    Device.designName || '',
                    Device.productName || ''
                ].join('|');
                // Generar hash único basado en las características del dispositivo
                const hash = this.generateDeviceHash(uniqueString);
                // Formato: MARCA-MODELO-HASH
                id = `${(Device.brand || 'UNK').toUpperCase()}-${(Device.modelName || 'UNK').replace(/[^a-zA-Z0-9]/g, '')}-${hash}`;
            } else {
                id = await Application.getIosIdForVendorAsync();
            }

            const params = {
                deviceKey: id,
                name: Device.deviceName,
                description: Device.modelName
            }
            const response = await axios.post(`${API_URL}/devices/associate`, params,
                {
                    headers: {
                        'x-api-key': codigoSucursal, // En los headers
                        'Content-Type': 'application/json'
                    }
                });
            return response.data;
        }
        catch (error) {
            console.error("Error during login:", error);
            throw error;
        }
    }
    static generateDeviceHash = (str) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36).toUpperCase();
    };
}