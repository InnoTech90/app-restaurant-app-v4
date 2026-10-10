import NetInfo from "@react-native-community/netinfo";

export const MENSAJE_SIN_INTERNET =
  "No hay internet disponible. Conéctate a una red e intenta de nuevo.";

export class SinConexionError extends Error {
  constructor(message = MENSAJE_SIN_INTERNET) {
    super(message);
    this.name = "SinConexionError";
    this.code = "SIN_INTERNET";
  }
}

export const verificarConexionInternet = async () => {
  const state = await NetInfo.fetch();
  return state.isConnected === true && state.isInternetReachable !== false;
};

export const asegurarConexionInternet = async () => {
  if (!(await verificarConexionInternet())) {
    throw new SinConexionError();
  }
};

export const esErrorDeConexion = (error) => {
  if (error?.code === "SIN_INTERNET" || error?.name === "SinConexionError") {
    return true;
  }
  const mensaje = String(error?.message ?? "").toLowerCase();
  return (
    mensaje.includes("network error") ||
    error?.code === "ERR_NETWORK" ||
    error?.code === "ECONNABORTED"
  );
};

export const obtenerMensajeErrorRed = (
  error,
  fallback = "No se pudo completar la operación.",
) => {
  if (esErrorDeConexion(error)) return MENSAJE_SIN_INTERNET;
  return error?.message ?? fallback;
};
