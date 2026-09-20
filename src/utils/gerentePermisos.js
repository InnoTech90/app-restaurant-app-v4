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
  if (!screen || screen.siempreVisible) return false;
  const requeridos = Array.isArray(screen.keywords)
    ? screen.keywords.map(normalizarKeyword).filter(Boolean)
    : [];
  return requeridos.length > 0 || !!screen.requiereNip;
}

/** @deprecated Usar requiereNipAcceso */
export function requiereNipDueño(gerenteSesion, screen) {
  return requiereNipAcceso(screen);
}
