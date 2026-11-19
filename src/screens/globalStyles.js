import { StyleSheet } from "react-native";
import { esOscuro } from "../utils/apariencia";
// opacidades

// 100% FF
// 90%	E6
// 75%	BF
// 50%	80
// 25%	40
// 10%	1A
// 0%	00
const base = {
  // paleta azules
  blue50: "#f1fafe",
  blue100: "#e2f3fc",
  blue200: "#bfe7f8",
  blue300: "#93d9f4",
  blue400: "#46bfea",
  blue550: "#4F5FE0",
  blue500: "#1ea7d9",
  blue600: "#1087b9",
  blue700: "#0f6c95",
  blue800: "#105b7c",
  blue900: "#134c67",
  blue950: "#384684",
  // morados
  purple50: "#f2f5fc",
  purple100: "#e2eaf7",
  purple200: "#ccdaf1",
  purple300: "#aac3e6",
  purple350: "#93D9F4",
  purple400: "#81a4d9",
  purple500: "#6387ce",
  purple550: "#7284FD",
  purple600: "#4f6dc1",
  purple700: "#455cb0",
  purple750: "#7284FD",
  purple800: "#384684", // se usa para tipografias de titulo
  purple900: "#354273",
  purple950: "#242a47",

  gray50: "#fafafa",
  gray100: "#F4F7FD",
  gray200: "#E3E9F7",
  gray300: "#C9D3F5",
  gray400: "#8A93B2", //se usa para tipografia de placeholders
  gray500: "#5B6488",
  gray600: "#4B5578",
  gray700: "#3A4468",
  gray800: "#273568",
  gray900: "#1B2550",
  gray950: "#0b0b0b",

  red50: "#fff0f0",
  red100: "#ffdddd",
  red200: "#ffc0c0",
  red300: "#ff9494",
  red400: "#ff5757",
  red500: "#E5484D",
  red600: "#E5484D", // se usa para botones de eliminar
  red700: "#C93A3F",
  red800: "#b10303",
  red900: "#920a0a",
  red950: "#500000",

  green50: "#f0fdf1",
  green100: "#ddfbdf",
  green200: "#bcf6c1",
  green300: "#88ed93",
  green400: "#4ddb5d",
  green500: "#18A058", //verde estandar
  green600: "#148A4B",
  green700: "#117040",
  green800: "#176420",
  green900: "#15521e",
  green950: "#062d0c",

  yellow50: "#fffbea",
  yellow100: "#fff2c5",
  yellow200: "#ffe585",
  yellow300: "#ffd146",
  yellow400: "#ffbc1b",
  yellow500: "#E58A00", //verde estandar
  yellow600: "#e27100",
  yellow700: "#bb4c02",
  yellow800: "#983a08",
  yellow900: "#7c300b",
  yellow950: "#481700",

  orange500: "#E58A00",
  orange600: "#D97706",

  gradient_blue: ["#7284FD", "#93D9F4"],
};

// Modo oscuro: neutros invertidos (fondos azul noche, textos claros) y
// tonos "suaves" (50-200) como fondos oscuros del mismo color. Los tonos
// fuertes de marca y estado se conservan.
const oscuro = {
  blue50: "#16233A", blue100: "#1A2B45", blue200: "#21385A",
  blue800: "#9FD4EA", blue900: "#B9E2F2", blue950: "#E6E9FF",
  purple50: "#1B2238", purple100: "#20294A", purple200: "#2A3560",
  purple800: "#E6E9FF", purple900: "#C9CEE4", purple950: "#E6E9FF",
  gray50: "#151B2E", gray100: "#1B2238", gray200: "#2A3354", gray300: "#3A4570",
  gray400: "#7A82A3", gray500: "#A3AAC8", gray600: "#B8BED8", gray700: "#C9CEE4",
  gray800: "#D5DAF0", gray900: "#E6E9FF", gray950: "#F4F6FF",
  red50: "#2E1416", red100: "#3A1618", red200: "#4F1D20",
  green50: "#102619", green100: "#13301F", green200: "#1A4029",
  yellow50: "#2E220B", yellow100: "#3A2A0D", yellow200: "#4D3810",
};

export const gb = StyleSheet.create(esOscuro ? { ...base, ...oscuro } : base);
