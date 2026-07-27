import axios from "axios";
// import * as Application from "expo-application";
import * as Device from "expo-device";
import { Platform } from "react-native";
import {
  API_BASE_URL,
  API_BASE_URL_CANDIDATES,
} from "../../../../utils/config/api";

const REQUEST_TIMEOUT_MS = 8000;

export class ApiLogin {
  static async login(codigoSucursal) {
    try {
      const codigoNormalizado = String(codigoSucursal || "").trim();

      let id;
      if (Platform.OS === "android") {
        const uniqueString = [
          Device.brand || "",
          Device.modelName || "",
          Device.osBuildFingerprint || "",
          Device.totalMemory || "",
          Device.designName || "",
          Device.productName || "",
        ].join("|");
        // Generar hash único basado en las características del dispositivo
        const hash = this.generateDeviceHash(uniqueString);
        // Formato: MARCA-MODELO-HASH
        id = `${(Device.brand || "UNK").toUpperCase()}-${(Device.modelName || "UNK").replace(/[^a-zA-Z0-9]/g, "")}-${hash}`;
      } else {
        id = await Application.getIosIdForVendorAsync();
      }

      const params = {
        deviceKey: id,
        name: Device.deviceName,
        description: Device.modelName,
      };

      const headers = {
        "x-api-key": codigoNormalizado,
        "Content-Type": "application/json",
      };

      const baseUrls =
        API_BASE_URL_CANDIDATES?.length > 0
          ? API_BASE_URL_CANDIDATES
          : [API_BASE_URL];

      let lastNetworkError = null;

      for (const baseUrl of baseUrls) {
        try {
          // console.log("Intentando asociar con:", baseUrl);
          const response = await axios.post(
            `${baseUrl}/devices/associate`,
            params,
            {
              headers,
              timeout: REQUEST_TIMEOUT_MS,
            },
          );

          return response.data;
        } catch (error) {
          if (error?.response) {
            const status = error.response?.status;
            const message = error.response.data?.message;

            if (status === 403) {
              if (message?.includes("Device limit reached")) {
                throw new Error(
                  "Se alcanzó el límite de dispositivos permitidos para este plan. Desvincula un dispositivo existente o contacta a soporte.",
                );
              }

              throw new Error(
                "No tienes permisos para asociar este dispositivo.",
              );
            }

            // console.error("Error HTTP en asociación:", {
            //   baseUrl,
            //   status: error.response.status,
            //   data: error.response.data,
            // });
            throw error;
          }

          const isNetworkError =
            !error?.response &&
            (error?.code === "ERR_NETWORK" ||
              error?.code === "ECONNABORTED" ||
              String(error?.message || "")
                .toLowerCase()
                .includes("network"));

          if (!isNetworkError) {
            throw error;
          }

          lastNetworkError = error;
          console.warn("No se pudo conectar con:", baseUrl, error?.message);
        }
      }

      throw (
        lastNetworkError || new Error("No se pudo conectar al backend local")
      );
    } catch (error) {
      console.error("Error during login:", error);
      throw error;
    }
  }
  static generateDeviceHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36).toUpperCase();
  };
}
