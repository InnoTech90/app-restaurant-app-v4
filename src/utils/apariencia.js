/**
 * Modo claro / oscuro de la app.
 *
 * Los estilos de la app se crean al cargar cada archivo (StyleSheet.create),
 * así que el modo se decide UNA vez, al arrancar, antes de pintar nada:
 *   - La preferencia se guarda en una base SQLite pequeña y aparte
 *     ("preferencias.db") que se lee de forma síncrona, sin tocar la cola
 *     de la base principal.
 *   - "sistema" (por defecto) sigue el modo del teléfono/tablet.
 * Al cambiar la preferencia se reinicia la interfaz para aplicarla.
 */
import * as SQLite from "expo-sqlite";
import { Appearance, DevSettings, NativeModules } from "react-native";

export const PREFERENCIAS_APARIENCIA = ["sistema", "claro", "oscuro"];

let db = null;
const abrir = () => {
  if (db) return db;
  db = SQLite.openDatabaseSync("preferencias.db");
  db.execSync(
    "CREATE TABLE IF NOT EXISTS PREFERENCIAS (CLAVE TEXT PRIMARY KEY NOT NULL, VALOR TEXT)",
  );
  return db;
};

const leerPreferencia = () => {
  try {
    const fila = abrir().getFirstSync(
      "SELECT VALOR FROM PREFERENCIAS WHERE CLAVE = 'apariencia'",
    );
    return PREFERENCIAS_APARIENCIA.includes(fila?.VALOR) ? fila.VALOR : "sistema";
  } catch (e) {
    console.warn("No se pudo leer la apariencia:", e?.message);
    return "sistema";
  }
};

export const preferenciaApariencia = leerPreferencia();

export const esOscuro =
  preferenciaApariencia === "oscuro" ||
  (preferenciaApariencia === "sistema" && Appearance.getColorScheme() === "dark");

/** Guarda la preferencia y reinicia la interfaz para aplicarla. */
export const cambiarApariencia = (valor) => {
  if (!PREFERENCIAS_APARIENCIA.includes(valor)) return;
  abrir().runSync(
    "INSERT OR REPLACE INTO PREFERENCIAS (CLAVE, VALOR) VALUES ('apariencia', ?)",
    [valor],
  );
  // En el APK de producción DevSettings.reload no hace nada: se usa el
  // módulo nativo ReiniciarApp (android/app/.../ReiniciarAppModule.kt).
  setTimeout(() => {
    const nativo = NativeModules.ReiniciarApp;
    if (!__DEV__ && nativo?.reiniciar) nativo.reiniciar();
    else DevSettings.reload();
  }, 150);
};
