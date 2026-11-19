import { StyleSheet } from "react-native";
import { color, radius, space } from "../../../utils/theme";

export const s = StyleSheet.create({
    buttonContainer: {
        borderRadius: radius.md,
        overflow: "hidden",
    },
    button: {
        backgroundColor: color.primary,
        padding: 10,
        borderRadius: radius.md,
        alignItems: "center",
        justifyContent: "center",
    },
    buttonGRADIENT: {
        padding: 10,
        borderRadius: radius.md,
        alignItems: "center",
        justifyContent: "center",
    },
    pressed: {
        opacity: 0.85,
    },
    disabled: {
        opacity: 0.5,
    },
    iconContainer: {
        marginRight: space.sm,
    },
});
