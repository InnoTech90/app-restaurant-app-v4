import Constants from "expo-constants";
import * as FileSystem from "expo-file-system/legacy";
import { Alert, Platform, Share } from "react-native";
import { getDb } from "./db";

const DB_NAME = "APP_RESTAURANT_DB.db";

/** Solo Expo Go + __DEV__. Nunca en APK (standalone/bare). */
export function isExportDbDisponible() {
  return __DEV__ && Constants.appOwnership === "expo";
}

export function assertExportDbDisponible() {
  if (!isExportDbDisponible()) {
    throw new Error("Exportar BD solo está disponible en desarrollo con Expo.");
  }
}

const uint8ToBase64 = (bytes) => {
  if (!bytes?.length) return "";
  const chunkSize = 0x8000;
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
};

const obtenerDirectorioCache = () =>
  FileSystem.cacheDirectory ?? FileSystem.documentDirectory;

const nombreExportacion = () => {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  return `${DB_NAME.replace(".db", "")}_${stamp}.db`;
};

/**
 * Exporta APP_RESTAURANT_DB.db usando serializeAsync (evita rutas de archivo incorrectas).
 * Android: guardar en carpeta elegida o compartir vía content://
 */
export async function exportarDatabaseSQLite() {
  assertExportDbDisponible();

  if (Platform.OS === "web") {
    throw new Error("La exportación de BD no está disponible en web.");
  }

  const cacheDir = obtenerDirectorioCache();
  if (!cacheDir) {
    throw new Error("No hay directorio de almacenamiento disponible.");
  }

  const db = await getDb();
  const bytes = await db.serializeAsync("main");
  if (!bytes?.length) {
    throw new Error("La base de datos está vacía o no se pudo leer.");
  }

  const base64 = uint8ToBase64(bytes);
  const destUri = `${cacheDir}${nombreExportacion()}`;
  await FileSystem.writeAsStringAsync(destUri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  if (Platform.OS === "android") {
    return exportarEnAndroid(destUri, base64);
  }

  return exportarEnIos(destUri);
}

const exportarEnAndroid = async (destUri, base64) => {
  const { StorageAccessFramework } = FileSystem;

  try {
    const permisos =
      await StorageAccessFramework.requestDirectoryPermissionsAsync();
    if (!permisos.granted) {
      throw new Error("Se canceló la selección de carpeta.");
    }

    const nombreBase =
      destUri.split("/").pop()?.replace(/\.db$/i, "") ?? "APP_RESTAURANT_DB";
    const destinoSaf = await StorageAccessFramework.createFileAsync(
      permisos.directoryUri,
      nombreBase,
      "application/octet-stream",
    );

    await FileSystem.writeAsStringAsync(destinoSaf, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    Alert.alert(
      "Exportación lista",
      "La base de datos se guardó en la carpeta seleccionada.",
    );
    return destinoSaf;
  } catch (error) {
    console.warn("[exportDatabase] SAF falló, usando compartir:", error?.message);
    const contentUri = await FileSystem.getContentUriAsync(destUri);
    await Share.share({
      url: contentUri,
      title: "Exportar base de datos",
      message: "Base de datos SQLite",
    });
    return destUri;
  }
};

const exportarEnIos = async (destUri) => {
  const result = await Share.share({
    url: destUri,
    title: "Exportar base de datos",
  });

  if (result.action === Share.dismissedAction) {
    Alert.alert(
      "Exportación",
      "Archivo listo en caché de la app. Puedes intentar compartir de nuevo.",
    );
  }

  return destUri;
};
