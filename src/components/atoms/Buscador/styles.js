import { StyleSheet } from "react-native";
import { gb } from "../../../screens/globalStyles";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";
import { color, font, radius, shadow, touch } from "../../../utils/theme";

export const s = StyleSheet.create({
    buscadorContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: color.surface,
        borderWidth: 1,
        borderColor: color.borderStrong,
        borderRadius: radius.md,
        paddingHorizontal: normalize(12),
        minHeight: touch,
    },
    icon: {
        marginRight: normalize(8),
    },
    input: {
        flex: 1,
        fontSize: font.md,
        color: color.text,
        paddingVertical: normalize(4),
    },
});
