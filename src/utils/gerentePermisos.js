/**
 * Permisos de gerente por KEYWORD (GERENTE_PERMISOS).
 * Owner ve todas las opciones; managers solo las que coincidan.
 */

const normalizarKeyword = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

/** Keywords del manager autenticado. */
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
 * ¿Puede ver esta opción del drawer?
 * - Owner: siempre sí
 * - siempreVisible: sí (ej. Mesas)
 * - keywords: sí si tiene al menos uno
 * - sin keywords: no (salvo owner)
 */
export function puedeVerOpcionDrawer(gerenteSesion, screen) {
  if (!gerenteSesion) return false;
  if (gerenteSesion.tipo === "owner" || gerenteSesion.id === "owner") {
    return true;
  }
  if (screen?.siempreVisible) return true;

  const requeridos = Array.isArray(screen?.keywords)
    ? screen.keywords.map(normalizarKeyword).filter(Boolean)
    : [];

  if (requeridos.length === 0) return false;

  const otorgados = obtenerKeywordsGerente(gerenteSesion);
  return requeridos.some((k) => otorgados.has(k));
}
