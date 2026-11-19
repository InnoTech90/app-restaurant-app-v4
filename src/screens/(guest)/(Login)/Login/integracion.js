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
            const data = error.response?.data;
            const message = String(
              data?.message ?? data?.error ?? data?.msg ?? "",
            ).trim();

            if (__DEV__) {
              console.warn("[Login/associate]", {
                baseUrl,
                status,
                message,
                data,
                deviceKey: params.deviceKey,
              });
            }

            // Nunca se muestra el texto técnico del servidor: solo mensajes
            // en español que cualquier persona entienda.
            const limite = message.match(/plan allows (\d+)/i);
            if (/device limit reached|l[ií]mite de dispositivos/i.test(message)) {
              return fallo(
                limite
                  ? `El plan de este negocio permite ${limite[1]} dispositivos y ya están todos en uso. Pide al dueño que desactive uno o mejore su plan.`
                  : "El plan de este negocio ya no tiene lugar para otro dispositivo. Pide al dueño que desactive uno o mejore su plan.",
              );
            }

            if (/device is (not active|inactive)/i.test(message)) {
              return fallo(
                "Este dispositivo fue desactivado por el dueño del negocio. Pídele que lo vuelva a activar.",
              );
            }

            if (/business or plan not found/i.test(message)) {
              return fallo(
                "Este negocio no tiene un plan activo. Pide al dueño que revise su membresía.",
              );
            }

            if (
              status === 401 ||
              status === 404 ||
              /invalid api key|branch not found|api key is required/i.test(message)
            ) {
              return fallo(
                "El código de la sucursal no es correcto. Escanea de nuevo el QR o revisa el código.",
              );
            }

            if (status >= 500) {
              return fallo(
                "El servidor no está disponible en este momento. Intenta de nuevo en unos minutos.",
              );
            }

            return fallo(
              "No se pudo conectar el dispositivo. Intenta de nuevo y, si sigue pasando, contacta a soporte.",
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
              "No se pudo conectar el dispositivo. Intenta de nuevo y, si sigue pasando, contacta a soporte.",
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
        "No se pudo conectar el dispositivo. Intenta de nuevo y, si sigue pasando, contacta a soporte.",
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
        "No se pudo conectar el dispositivo. Intenta de nuevo y, si sigue pasando, contacta a soporte.",
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
