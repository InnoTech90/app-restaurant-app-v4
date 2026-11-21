import { StyleSheet } from "react-native";
import { color, font, radius, space } from "../../../utils/theme";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";

export const s = StyleSheet.create({
    buttonContainer: {
        marginLeft: "auto",
        backgroundColor: color.primarySoft,
        borderRadius: radius.pill,
    },
    buttonContainerSobreColor: {
        backgroundColor: "rgba(255,255,255,0.22)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.45)",
    },
    buttonTextSobreColor: {
        color: "#FFFFFF",
    },
    button: {
        flexDirection: "row",
        gap: space.xs + 2,
        paddingHorizontal: space.md,
        minHeight: normalize(36),
        alignItems: "center",
    },
    buttonText: {
        fontSize: font.sm,
        fontWeight: font.semibold,
        color: color.primaryDark,
    },
});
