import { StyleSheet } from "react-native";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";

export const s = StyleSheet.create({
        qrButtonContainer: {
            width: normalize(40),
            height: normalize(40),
            backgroundColor: "transparent",
            alignItems: "center",
            justifyContent: "center",
        },
        qrButton: {
            width: normalize(40),
            height: normalize(40),
            backgroundColor: "transparent",
        },
        qrIcon: {
            width: normalize(40),
            height: normalize(40),
        }
})