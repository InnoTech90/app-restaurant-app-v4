import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Permisos de gerente por KEYWORD (GERENTE_PERMISOS).
 *
 * Acceso a opciones protegidas:
 * - NIP del dueño (CONFIGURACIONES) → siempre
 * - NIP de gerente → solo si tiene el keyword de la opción
 */

const normalizarKeyword = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

export function obtenerKeywordsGerente(gerenteSesion) {
  if (!gerenteSesion) return new Set();
  const permisos = Array.isArray(gerenteSesion.permisos)
    ? gerenteSesion.permisos
    : [];

  return new Set(
    permisos
      .map((p) => normalizarKeyword(p.KEYWORD ?? p.keyword ?? p.keyWord))
      .filter(Boolean),
  );
}

/**
 * ¿El usuario tiene keyword de permiso para esta opción?
 * - Owner / siempreVisible → true
 * - Sin keywords en pantalla → true
 * - Gerente → true si coincide al menos un keyword
 */
export function tienePermisoKeyword(gerenteSesion, screen) {
  if (!screen) return true;
  if (screen.siempreVisible) return true;
  if (gerenteSesion?.tipo === "owner" || gerenteSesion?.id === "owner") {
    return true;
  }

  const requeridos = Array.isArray(screen.keywords)
    ? screen.keywords.map(normalizarKeyword).filter(Boolean)
    : [];

  if (requeridos.length === 0) return true;

  if (!gerenteSesion) return false;

  const otorgados = obtenerKeywordsGerente(gerenteSesion);
  return requeridos.some((k) => otorgados.has(k));
}

/**
 * ¿Hay que pedir NIP para entrar a esta opción del drawer?
 * Mesas (siempreVisible) no pide NIP.
 * Cualquier pantalla con keywords pide NIP (dueño o gerente autorizado).
 */
export function requiereNipAcceso(screen) {
  if (!screen || screen.siempreVisible || screen.accesoLibre) return false;
  const requeridos = Array.isArray(screen.keywords)
    ? screen.keywords.map(normalizarKeyword).filter(Boolean)
    : [];
  return requeridos.length > 0 || !!screen.requiereNip;
}

/** @deprecated Usar requiereNipAcceso */
export function requiereNipDueño(gerenteSesion, screen) {
  return requiereNipAcceso(screen);
}

const SESION_GERENTE = "gerenteSesion";

export async function guardarSesionAcceso(result) {
  if (result?.tipo === "owner") {
    await AsyncStorage.setItem(
      SESION_GERENTE,
      JSON.stringify({ tipo: "owner", id: "owner" }),
    );
    return;
  }

  if (result?.tipo === "gerente") {
    await AsyncStorage.setItem(
      SESION_GERENTE,
      JSON.stringify({
        tipo: "gerente",
        id: result.gerente?.UUID ?? null,
        permisos: result.gerente?.permisos ?? [],
      }),
    );
  }
}

/**
 * Sin NIP: el dueño (o un dispositivo sin sesión de gerente) entra.
 * Un gerente identificado sin el keyword de la pantalla no entra.
 */
export async function sesionPuedeEntrar(screen) {
  const raw = await AsyncStorage.getItem(SESION_GERENTE);
  if (!raw) return true;

  try {
    return tienePermisoKeyword(JSON.parse(raw), screen);
  } catch {
    return true;
  }
}
