import NetInfo from "@react-native-community/netinfo";

export const MENSAJE_SIN_INTERNET =
  "No se detectó conexión de red. Revisa Wi‑Fi o datos e inténtalo de nuevo.";

export const MENSAJE_NO_SE_PUDO_CONECTAR =
  "No se pudo conectar con el servidor. Inténtalo más tarde.";

export const MENSAJE_SERVIDOR_NO_RESPONDE =
  "El servidor no responde. Inténtalo más tarde.";

export class SinConexionError extends Error {
  constructor(message = MENSAJE_SIN_INTERNET) {
    super(message);
    this.name = "SinConexionError";
    this.code = "SIN_INTERNET";
  }
}

export const verificarConexionInternet = async () => {
  const state = await NetInfo.fetch();
  return state.isConnected === true;
};

export const asegurarConexionInternet = async () => {
  if (!(await verificarConexionInternet())) {
    throw new SinConexionError();
  }
};

export const esTimeoutServidor = (error) => {
  const mensaje = String(error?.message ?? "").toLowerCase();
  return (
    error?.code === "ECONNABORTED" ||
    error?.code === "ETIMEDOUT" ||
    mensaje.includes("timeout")
  );
};

export const esErrorDeRedApi = (error) => {
  const mensaje = String(error?.message ?? "").toLowerCase();
  return (
    error?.code === "ERR_NETWORK" ||
    mensaje.includes("network error") ||
    mensaje.includes("failed to fetch")
  );
};

export const esErrorDeConexion = (error) => {
  if (error?.code === "SIN_INTERNET" || error?.name === "SinConexionError") {
    return true;
  }
  if (esTimeoutServidor(error)) return true;
  if (esErrorDeRedApi(error)) return true;
  const mensaje = String(error?.message ?? "").toLowerCase();
  return (
    mensaje.includes(MENSAJE_NO_SE_PUDO_CONECTAR.toLowerCase()) ||
    mensaje.includes(MENSAJE_SERVIDOR_NO_RESPONDE.toLowerCase()) ||
    mensaje.includes(MENSAJE_SIN_INTERNET.toLowerCase())
  );
};

export const obtenerMensajeErrorRed = (
  error,
  fallback = "No se pudo completar la operación. Inténtalo más tarde.",
) => {
  if (error?.code === "SIN_INTERNET" || error?.name === "SinConexionError") {
    return MENSAJE_SIN_INTERNET;
  }
  if (esTimeoutServidor(error)) return MENSAJE_SERVIDOR_NO_RESPONDE;
  if (esErrorDeRedApi(error)) return MENSAJE_NO_SE_PUDO_CONECTAR;

  const mensaje = String(error?.message ?? "").trim();
  if (!mensaje) return fallback;

  const mensajeLower = mensaje.toLowerCase();
  if (
    mensajeLower.includes("network error") ||
    mensajeLower.includes("sin internet") ||
    mensajeLower.includes("no hay internet")
  ) {
    return MENSAJE_NO_SE_PUDO_CONECTAR;
  }

  return mensaje;
};
