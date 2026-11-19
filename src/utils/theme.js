/**
 * Tema visual de App Restaurant (misma identidad que User / Admin).
 * Usar SIEMPRE estos valores en pantallas y componentes nuevos o
 * rediseñados, en lugar de colores escritos a mano.
 *
 * Marca: morado-azulado #7284FD + celeste #93D9F4 (degradado firma),
 * títulos azul oscuro #384684, fondos azul muy pálido, tarjetas blancas.
 */
import { isTablet, normalize } from "./funcionesMaquetado/responsiveWH";
import { esOscuro } from "./apariencia";

export { esOscuro };

const claro = {
  // Marca
  primary: "#7284FD",
  primaryDark: "#4F5FE0",
  primarySoft: "#EEF1FF",
  accent: "#93D9F4",
  title: "#384684",

  // Texto
  text: "#273568",
  textSecondary: "#5B6488",
  textMuted: "#8A93B2",
  textOnPrimary: "#FFFFFF",

  // Superficies
  background: "#F4F7FD",
  surface: "#FFFFFF",
  surfaceAlt: "#F8FAFF",
  border: "#E3E9F7",
  borderStrong: "#C9D3F5",
  overlay: "rgba(20, 27, 61, 0.45)",

  // Estados (un solo tono por estado)
  success: "#18A058",
  successSoft: "#E7F7EE",
  warning: "#E58A00",
  warningSoft: "#FFF4E0",
  danger: "#E5484D",
  dangerSoft: "#FDECEC",
  info: "#2F80ED",
  infoSoft: "#E8F1FD",
};

// Modo oscuro: mismos nombres; fondos azul noche, texto claro, la marca
// un poco más luminosa para que contraste sobre fondo oscuro.
const oscuro = {
  primary: "#8494FF",
  primaryDark: "#6B7BFF",
  primarySoft: "#262D52",
  accent: "#93D9F4",
  title: "#E6E9FF",

  text: "#D5DAF0",
  textSecondary: "#A3AAC8",
  textMuted: "#7A82A3",
  textOnPrimary: "#FFFFFF",

  background: "#0F1424",
  surface: "#181E33",
  surfaceAlt: "#1D2440",
  border: "#2A3354",
  borderStrong: "#3A4570",
  overlay: "rgba(0, 0, 0, 0.6)",

  success: "#3DD68C",
  successSoft: "#13301F",
  warning: "#F5A524",
  warningSoft: "#3A2A0D",
  danger: "#FF6B6F",
  dangerSoft: "#3A1618",
  info: "#5AA2FF",
  infoSoft: "#132A47",
};

export const color = esOscuro ? oscuro : claro;

export const gradient = {
  brand: [color.primary, color.accent],
  brandStart: { x: 0, y: 0 },
  brandEnd: { x: 1, y: 0 },
};

export const radius = {
  sm: normalize(8),
  md: normalize(12),
  lg: normalize(16),
  pill: 999,
};

export const space = {
  xs: normalize(4),
  sm: normalize(8),
  md: normalize(12),
  lg: normalize(16),
  xl: normalize(24),
};

export const font = {
  xs: normalize(isTablet ? 12 : 11),
  sm: normalize(isTablet ? 14 : 13),
  md: normalize(isTablet ? 16 : 15),
  lg: normalize(isTablet ? 19 : 17),
  xl: normalize(isTablet ? 24 : 21),
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
};

export const shadow = {
  card: {
    shadowColor: esOscuro ? "#000000" : "#2A3A8C",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  raised: {
    shadowColor: esOscuro ? "#000000" : "#2A3A8C",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 14,
    elevation: 6,
  },
};

/** Tarjeta base: fondo blanco, borde suave, radio 12 y sombra ligera. */
export const card = {
  backgroundColor: color.surface,
  borderRadius: radius.md,
  borderWidth: 1,
  borderColor: color.border,
  ...shadow.card,
};

/** Altura mínima táctil (Android recomienda 48dp). */
export const touch = normalize(isTablet ? 50 : 46);

export default { color, gradient, radius, space, font, shadow, card, touch };
