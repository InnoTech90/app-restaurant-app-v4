import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import {
  SinConexionError,
  verificarConexionInternet,
} from "../ConeccionAInternet/ConeccionAInternet";
import { API_BASE_URL } from "../config/api";

export const deviceApi = axios.create({
  baseURL: API_BASE_URL,
});

deviceApi.interceptors.request.use(async (config) => {
  const hayInternet = await verificarConexionInternet();
  if (!hayInternet) {
    return Promise.reject(new SinConexionError());
  }
  return config;
});

export async function getDeviceAuthHeaders() {
  const [deviceKey, qrCode] = await Promise.all([
    AsyncStorage.getItem("deviceKey"),
    AsyncStorage.getItem("qrCode"),
  ]);

  return {
    "device-key": deviceKey,
    "x-api-key": qrCode,
    "Content-Type": "application/json",
  };
}
