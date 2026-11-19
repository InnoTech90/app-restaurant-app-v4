import { DeviceEventEmitter } from "react-native";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import { deviceApi, getDeviceAuthHeaders } from "./deviceApi";

/**
 * Cierre de sesión forzado cuando el dueño desactiva el dispositivo en
 * User → /dispositivos-asociados (o lo elimina). El backend responde 401
 * "Device is not active" / "Invalid API Key or Device Key" en cualquier ruta
 * api-key; aquí se detecta y se avisa a la capa de sesión.
 */
export const DISPOSITIVO_DESACTIVADO_EVENT = "DISPOSITIVO_DESACTIVADO";

const PATRON_DESACTIVADO = /device is not active|invalid api key or device key/i;

export function esDispositivoDesactivado(error) {
  const response = error?.response;
  if (!response || response.status !== 401) return false;
  const data = response.data ?? {};
  const textos = [
    data.message,
    data.error,
    ...(Array.isArray(data.errors) ? data.errors : []),
  ]
    .filter(Boolean)
    .map(String)
    .join(" ");
  return PATRON_DESACTIVADO.test(textos);
}

let avisado = false;

// Cualquier sincronización/descarga que reciba el 401 también cierra sesión.
deviceApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (esDispositivoDesactivado(error)) notificarDispositivoDesactivado();
    return Promise.reject(error);
  },
);

export function notificarDispositivoDesactivado() {
  if (avisado) return;
  avisado = true;
  DeviceEventEmitter.emit(DISPOSITIVO_DESACTIVADO_EVENT);
}

/** Se llama al iniciar sesión de nuevo para volver a permitir el aviso. */
export function reiniciarAvisoDispositivo() {
  avisado = false;
}

/**
 * Consulta ligera `GET /devices/session`. Sin internet o con error de red no
 * hace nada (la app sigue offline); solo un 401 de dispositivo desactivado
 * dispara el cierre de sesión.
 */
export async function verificarSesionDispositivo() {
  try {
    const headers = await getDeviceAuthHeaders();
    if (!headers["device-key"] || !headers["x-api-key"]) return true;
    await axios.get(`${API_BASE_URL}/devices/session`, {
      headers,
      timeout: 8000,
    });
    return true;
  } catch (error) {
    if (esDispositivoDesactivado(error)) {
      notificarDispositivoDesactivado();
      return false;
    }
    return true;
  }
}
