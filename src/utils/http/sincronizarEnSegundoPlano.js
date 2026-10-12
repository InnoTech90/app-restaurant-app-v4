import { mostrarAviso } from "../avisoModal";
import {
  esErrorDeConexion,
  MENSAJE_NO_SE_PUDO_CONECTAR,
  obtenerMensajeErrorRed,
} from "../ConeccionAInternet/ConeccionAInternet";

export const sincronizarEnSegundoPlano = (
  tarea,
  {
    titulo = "Sincronización",
    mensajeFallo = MENSAJE_NO_SE_PUDO_CONECTAR,
  } = {},
) => {
  Promise.resolve()
    .then(() => tarea())
    .catch((error) => {
      if (!esErrorDeConexion(error)) {
        console.warn(
          "Sincronización en segundo plano falló:",
          error?.message ?? error,
        );
      }
      mostrarAviso({
        type: "warning",
        title: titulo,
        message: obtenerMensajeErrorRed(error, mensajeFallo),
      });
    });
};
