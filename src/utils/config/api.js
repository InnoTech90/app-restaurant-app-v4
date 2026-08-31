import Constants from "expo-constants";
import { Platform } from "react-native";

const PRODUCTION_API_URL = "https://api.apprestaurants.com/v1";

const normalizeUrl = (url) => String(url || "").replace(/\/$/, "");

const resolveApiBaseUrl = () => {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) {
    return normalizeUrl(fromEnv);
  }

  const fromExtra = Constants.expoConfig?.extra?.apiBaseUrl;
  if (fromExtra) {
    return normalizeUrl(fromExtra);
  }

  return PRODUCTION_API_URL;
};

const RAW_API_BASE_URL = resolveApiBaseUrl();

// Solo para desarrollo local: IP LAN opcional cuando la API apunta a localhost.
const MANUAL_LOCAL_HOST_IP =
  process.env.EXPO_PUBLIC_LOCAL_API_HOST || "192.168.100.20";

function getExpoHostIp() {
  const hostUri =
    Constants.expoConfig?.hostUri || Constants.expoGoConfig?.debuggerHost || "";

  const [host] = hostUri.split(":");
  return host || null;
}

function isLocalApiUrl(url) {
  try {
    const { hostname, protocol } = new URL(url);
    if (protocol !== "http:") return false;
    return ["localhost", "127.0.0.1", "0.0.0.0", "10.0.2.2", "10.0.3.2"].includes(
      hostname,
    );
  } catch {
    return false;
  }
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

    addCandidate(MANUAL_LOCAL_HOST_IP);
    addCandidate(getExpoHostIp());

    if (Platform.OS === "android") {
      addCandidate("10.0.2.2");
      addCandidate("10.0.3.2");
    }

    if (Platform.OS === "ios") {
      addCandidate("127.0.0.1");
    }

    addCandidate("localhost");

    return [...new Set(candidates)];
  } catch {
    return [rawUrl];
  }
}

export const API_BASE_URL = RAW_API_BASE_URL;
export const API_BASE_URL_CANDIDATES = isLocalApiUrl(RAW_API_BASE_URL)
  ? buildApiBaseUrlCandidates(RAW_API_BASE_URL)
  : [RAW_API_BASE_URL];
