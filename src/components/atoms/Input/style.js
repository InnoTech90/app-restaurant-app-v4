import { StyleSheet } from "react-native";
import { color, font, radius, space, touch } from "../../../utils/theme";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";

export const s = StyleSheet.create({
    inputContainer: {
        width: "100%",
        marginBottom: space.md,
    },
    label: {
        fontSize: font.sm,
        fontWeight: font.semibold,
        color: color.title,
        marginBottom: space.xs,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        marginBottom: 0,
    },
    iconContainer: {
        position: "absolute",
        left: space.md,
        zIndex: 1,
        height: "100%",
        justifyContent: "center",
    },
    input: {
        flex: 1,
        minHeight: touch,
        borderColor: color.borderStrong,
        backgroundColor: color.surface,
        borderWidth: 1,
        borderRadius: radius.md,
        paddingHorizontal: space.md,
        fontSize: font.md,
        color: color.text,
    },
    inputWithIcon: {
        paddingLeft: normalize(38),
    },
});
