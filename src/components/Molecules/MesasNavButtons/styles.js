import { StyleSheet } from "react-native";
import {
  contentPaddingH,
  isTablet,
  normalize,
} from "../../../utils/funcionesMaquetado/responsiveWH";
import { gb } from "../../../screens/globalStyles";

import { color as tema } from "../../../utils/theme";
export const s = StyleSheet.create({
  containerButtons: {
    flexDirection: "row",
    alignItems: "stretch",
    backgroundColor: tema.surface,
    borderTopWidth: 1,
    borderTopColor: tema.border,
    paddingVertical: normalize(6),
    paddingHorizontal: isTablet ? contentPaddingH + normalize(8) : normalize(8),
    gap: normalize(4),
  },
  botonAccionContainer: {
    flex: 1,
  },
  botonAccion: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: normalize(isTablet ? 10 : 8),
    borderRadius: normalize(12),
    gap: normalize(2),
    backgroundColor: "transparent",
  },
  botonAccionActivo: {
    backgroundColor: tema.primarySoft,
  },
  botonAccionTexto: {
    fontSize: normalize(11),
    fontWeight: "600",
    color: tema.textMuted,
  },
  botonAccionDivider: {
    width: 1,
    backgroundColor: gb.gray200,
    marginVertical: normalize(6),
  },
});
