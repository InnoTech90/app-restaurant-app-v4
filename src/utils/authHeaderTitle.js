import AsyncStorage from "@react-native-async-storage/async-storage";
import { DeviceEventEmitter } from "react-native";

export const AUTH_HEADER_TITLE_KEY = "AuthHeaderTitulo";
export const AUTH_HEADER_REFRESH_EVENT = "auth-header-refresh";

export async function setAuthHeaderTitulo(titulo) {
  const valor = String(titulo ?? "").trim();
  if (valor) {
    await AsyncStorage.setItem(AUTH_HEADER_TITLE_KEY, valor);
  } else {
    await AsyncStorage.removeItem(AUTH_HEADER_TITLE_KEY);
  }
  DeviceEventEmitter.emit(AUTH_HEADER_REFRESH_EVENT);
}

export async function clearAuthHeaderTitulo() {
  await AsyncStorage.removeItem(AUTH_HEADER_TITLE_KEY);
  DeviceEventEmitter.emit(AUTH_HEADER_REFRESH_EVENT);
}
