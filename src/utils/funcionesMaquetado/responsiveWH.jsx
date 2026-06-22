import { Dimensions, PixelRatio } from "react-native";

const { width, height } = Dimensions.get("window");
const BASE_WIDTH = 390; // iPhone 14 como base

// Dispositivo tablet cuando el ancho es >= 600 dp
export const isTablet = width >= 600;

// En tablet limitamos el factor de escala para evitar que todo se vea gigante
const MAX_NORMALIZE_SCALE = isTablet ? 1.35 : 2.5;

export const wp = (percentage) => (width * percentage) / 100;
export const hp = (percentage) => (height * percentage) / 100;
export const normalize = (size) => {
    const scale = Math.min(width / BASE_WIDTH, MAX_NORMALIZE_SCALE);
    return Math.round(PixelRatio.roundToNearestPixel(size * scale));
};

// Ancho máximo del área de contenido en tablet (centrado)
export const CONTENT_MAX_WIDTH = isTablet ? Math.min(width * 0.92, 960) : width;

// Padding horizontal para centrar el contenido en tablet
export const contentPaddingH = isTablet ? (width - CONTENT_MAX_WIDTH) / 2 : 0;

// Número de columnas para listas tipo grid en tablet
export const listColumns = isTablet ? 2 : 1;