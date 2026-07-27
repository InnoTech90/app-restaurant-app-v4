import Constants from "expo-constants";
import { Platform } from "react-native";

// Usa localhost como fuente y se resuelve automáticamente según plataforma.
// const RAW_API_BASE_URL = "https://api.apprestaurants.com/v1";
const RAW_API_BASE_URL = "http://192.168.100.20:3000/v1"; // ESTE ES PARA USO LOCAL (diego)
// IP LAN actual de tu Mac para pruebas en dispositivo fisico.
const MANUAL_LOCAL_HOST_IP = "192.168.100.20";

function getExpoHostIp() {
  const hostUri =
    Constants.expoConfig?.hostUri || Constants.expoGoConfig?.debuggerHost || "";

  const [host] = hostUri.split(":");
  return host || null;
}

function buildApiBaseUrlCandidates(rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    const isLocalhost = ["localhost", "127.0.0.1", "0.0.0.0"].includes(
      parsed.hostname,
    );

    if (!isLocalhost) {
      return [rawUrl];
    }

    const candidates = [];
    const addCandidate = (hostname) => {
      if (!hostname) return;
      const url = new URL(rawUrl);
      url.hostname = hostname;
      candidates.push(url.toString().replace(/\/$/, ""));
    };

    // Si usas dispositivo físico en LAN, esta IP suele ser la correcta.
    addCandidate(MANUAL_LOCAL_HOST_IP);
    addCandidate(getExpoHostIp());

    if (Platform.OS === "android") {
      // Android Emulator (AVD) y Genymotion.
      addCandidate("10.0.2.2");
      addCandidate("10.0.3.2");
    }

    if (Platform.OS === "ios") {
      // iOS Simulator usa el loopback de macOS.
      addCandidate("127.0.0.1");
    }

    // Fallback final literal.
    addCandidate("localhost");

    return [...new Set(candidates)];
  } catch {
    return [rawUrl];
  }
}

export const API_BASE_URL_CANDIDATES =
  buildApiBaseUrlCandidates(RAW_API_BASE_URL);
export const API_BASE_URL = API_BASE_URL_CANDIDATES[0];
