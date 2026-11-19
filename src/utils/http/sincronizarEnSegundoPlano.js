import { DeviceEventEmitter } from "react-native";
import { mostrarAviso } from "../avisoModal";
import {
  esErrorDeConexion,
  MENSAJE_NO_SE_PUDO_CONECTAR,
  obtenerMensajeErrorRed,
  verificarConexionInternet,
} from "../ConeccionAInternet/ConeccionAInternet";

/** Evento que avisa a las pantallas que terminó una subida automática. */
export const SINCRONIZACION_AUTOMATICA_EVENT = "sincronizacion:automatica";

/**
 * Regla de sincronización de la app:
 *  - Todo se guarda primero en la base local.
 *  - Si HAY internet al guardar, se sube al servidor en segundo plano.
 *  - Si NO hay internet (o el envío falla), queda pendiente en local y NO se
 *    reintenta solo: el encargado lo sube con el botón "Sincronizar".
 */
export const sincronizarEnSegundoPlano = (
  tarea,
  {
    titulo = "Sincronización",
    mensajeFallo = MENSAJE_NO_SE_PUDO_CONECTAR,
    modulo = null,
  } = {},
) => {
  Promise.resolve()
    .then(() => tarea())
    .then((resultado) => {
      if (modulo) {
        DeviceEventEmitter.emit(SINCRONIZACION_AUTOMATICA_EVENT, { modulo, resultado });
      }
    })
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

/**
 * Sube en segundo plano solo si hay conexión. Sin conexión no hace nada (el
 * registro ya quedó guardado en local como pendiente). Devuelve si se intentó.
 */
export const sincronizarSiHayInternet = async (tarea, opciones) => {
  let hayInternet = false;
  try {
    hayInternet = await verificarConexionInternet();
  } catch {
    hayInternet = false;
  }
  if (!hayInternet) return false;
  sincronizarEnSegundoPlano(tarea, opciones);
  return true;
};

const colas = new Map();

/**
 * Envuelve una función de sincronización para que nunca corran dos a la vez
 * en el mismo módulo (botón manual + subida automática). Cada llamada espera
 * a que termine la anterior y vuelve a leer sus pendientes, así no se envía
 * dos veces lo mismo (gastos e inventario no llevan identificador único).
 */
export const enCola = (clave, fn) => (...args) => {
  const anterior = colas.get(clave) ?? Promise.resolve();
  const actual = anterior.catch(() => {}).then(() => fn(...args));
  colas.set(clave, actual);
  return actual;
};
