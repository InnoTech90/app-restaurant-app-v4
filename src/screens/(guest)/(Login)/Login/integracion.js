import axios from "axios";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { asegurarConexionInternet } from "../../../../utils/ConeccionAInternet/ConeccionAInternet";
import {
  API_BASE_URL,
  API_BASE_URL_CANDIDATES,
} from "../../../../utils/config/api";

const REQUEST_TIMEOUT_MS = 8000;

const fallo = (message) => ({ ok: false, message });

export class ApiLogin {
  static async login(codigoSucursal) {
    try {
      await asegurarConexionInternet();
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
        const hash = this.generateDeviceHash(uniqueString);
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

      let huboErrorRed = false;

      for (const baseUrl of baseUrls) {
        try {
          const response = await axios.post(
            `${baseUrl}/devices/associate`,
            params,
            {
              headers,
              timeout: REQUEST_TIMEOUT_MS,
            },
          );

          return { ok: true, data: response.data };
        } catch (error) {
          if (error?.response) {
            const status = error.response?.status;
            const message = String(error.response.data?.message ?? "");

            if (status === 403) {
              if (
                /device limit reached|l[ií]mite de dispositivos/i.test(message)
              ) {
                return fallo(
                  "Se alcanzó el límite de dispositivos permitidos para este plan. Desvincula un dispositivo existente o contacta a soporte.",
                );
              }

              return fallo(
                "No tienes permisos para asociar este dispositivo.",
              );
            }

            if (status === 401 || status === 404) {
              return fallo(
                "El código de sucursal no es válido o no está disponible.",
              );
            }

            return fallo(
              "No se pudo asociar el dispositivo. Intenta de nuevo o contacta a soporte.",
            );
          }

          const isNetworkError =
            !error?.response &&
            (error?.code === "ERR_NETWORK" ||
              error?.code === "ECONNABORTED" ||
              String(error?.message || "")
                .toLowerCase()
                .includes("network"));

          if (!isNetworkError) {
            return fallo(
              "No se pudo asociar el dispositivo. Intenta de nuevo o contacta a soporte.",
            );
          }

          huboErrorRed = true;
        }
      }

      if (huboErrorRed) {
        return fallo(
          "No se pudo conectar al servidor. Verifica tu conexión e intenta de nuevo.",
        );
      }

      return fallo(
        "No se pudo asociar el dispositivo. Intenta de nuevo o contacta a soporte.",
      );
    } catch (error) {
      const msg = String(error?.message ?? "").toLowerCase();
      if (
        msg.includes("internet") ||
        msg.includes("conexi") ||
        msg.includes("network") ||
        error?.code === "ERR_NETWORK" ||
        error?.code === "ECONNABORTED"
      ) {
        return fallo(
          "No hay conexión a internet. Verifica tu red e intenta de nuevo.",
        );
      }

      return fallo(
        "No se pudo asociar el dispositivo. Intenta de nuevo o contacta a soporte.",
      );
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
