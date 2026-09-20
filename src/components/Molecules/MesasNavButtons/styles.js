import { StyleSheet } from "react-native";
import {
  contentPaddingH,
  isTablet,
  normalize,
} from "../../../utils/funcionesMaquetado/responsiveWH";
import { gb } from "../../../screens/globalStyles";

export const s = StyleSheet.create({
  containerButtons: {
    flexDirection: "row",
    alignItems: "stretch",
    backgroundColor: gb.gray50,
    borderTopWidth: 1,
    borderTopColor: gb.gray200,
    paddingVertical: normalize(10),
    paddingHorizontal: isTablet ? contentPaddingH + normalize(8) : normalize(8),
    gap: normalize(4),
  },
  botonAccionContainer: {
    flex: 1,
  },
  botonAccion: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: normalize(isTablet ? 12 : 10),
    borderRadius: normalize(10),
    gap: normalize(4),
    backgroundColor: "transparent",
  },
  botonAccionActivo: {
    backgroundColor: gb.purple550,
  },
  botonAccionTexto: {
    fontSize: normalize(12),
    fontWeight: "600",
    color: gb.blue550,
  },
  botonAccionDivider: {
    width: 1,
    backgroundColor: gb.gray200,
    marginVertical: normalize(6),
  },
});
