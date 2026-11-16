import { StyleSheet } from "react-native";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";

export const s = StyleSheet.create({
  qrButtonContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  qrButton: {
    width: "100%",
    height: "100%",
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  qrIcon: {
    width: normalize(28),
    height: normalize(28),
  },
});
