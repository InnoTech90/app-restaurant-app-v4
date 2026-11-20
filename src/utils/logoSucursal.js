import * as FileSystem from "expo-file-system/legacy";

/**
 * El servidor manda el logo de la sucursal como enlace firmado de S3 que
 * caduca (1 h). Si se guarda el enlace, al volver a abrir la app la imagen ya
 * no carga. Aquí se descarga la imagen al almacenamiento de la app y se usa la
 * copia local (también funciona sin internet).
 */
const CARPETA = `${FileSystem.documentDirectory}logo_sucursal/`;

const esLocal = (uri) => typeof uri === "string" && uri.startsWith("file:");

/**
 * Descarga el logo y regresa la ruta local. Si no hay logo regresa null.
 * Si la descarga falla (sin internet, enlace inválido) conserva `anterior`
 * cuando era una copia local que todavía existe.
 */
export const guardarLogoLocal = async (urlRemota, anterior = null) => {
  const url = typeof urlRemota === "string" ? urlRemota.trim() : "";
  if (!url) return null;
  if (esLocal(url)) return url;

  const conservarAnterior = async () => {
    if (!esLocal(anterior)) return null;
    try {
      const info = await FileSystem.getInfoAsync(anterior);
      return info.exists ? anterior : null;
    } catch {
      return null;
    }
  };

  try {
    await FileSystem.makeDirectoryAsync(CARPETA, { intermediates: true }).catch(() => {});
    const ext = (url.split("?")[0].match(/\.(png|jpe?g|webp|gif)$/i)?.[1] ?? "png").toLowerCase();
    // Nombre nuevo en cada descarga para que la imagen no quede en caché vieja.
    const destino = `${CARPETA}logo_${Date.now()}.${ext}`;
    const res = await FileSystem.downloadAsync(url, destino);
    if (res?.status !== 200) {
      await FileSystem.deleteAsync(destino, { idempotent: true }).catch(() => {});
      return conservarAnterior();
    }
    // Borrar copias anteriores.
    const archivos = await FileSystem.readDirectoryAsync(CARPETA).catch(() => []);
    await Promise.all(
      archivos
        .map((n) => `${CARPETA}${n}`)
        .filter((ruta) => ruta !== destino)
        .map((ruta) => FileSystem.deleteAsync(ruta, { idempotent: true }).catch(() => {})),
    );
    return destino;
  } catch {
    return conservarAnterior();
  }
};

/** El enlace remoto guardado antes de este arreglo ya caducó: no usarlo. */
export const logoUsable = (uri) => {
  const valor = typeof uri === "string" ? uri.trim() : "";
  return esLocal(valor) ? valor : "";
};
