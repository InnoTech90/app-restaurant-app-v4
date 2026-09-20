/**
 * Opciones del drawer que requieren NIP del dueño (CONFIGURACIONES.NIP)
 * cuando no hay permiso de gerente para esa keyword.
 *
 * Sin sesión de gerente: toda opción con keywords pide NIP del dueño.
 * Mesas (siempreVisible) no pide NIP.
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
 * Sin sesión de gerente → false (se pedirá NIP del dueño).
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
 * ¿Hay que pedir NIP del dueño para entrar a esta opción?
 */
export function requiereNipDueño(gerenteSesion, screen) {
  if (!screen || screen.siempreVisible) return false;
  return !tienePermisoKeyword(gerenteSesion, screen);
}
