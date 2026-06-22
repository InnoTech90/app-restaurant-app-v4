import { StyleSheet } from "react-native";
import { normalize, wp } from "../../../utils/funcionesMaquetado/responsiveWH";

export const s = StyleSheet.create({
    button: {
        backgroundColor: "#007BFF",
        padding: 10,
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
    },
    buttonGRADIENT: {
        padding: 10,
        borderRadius: 5,
        alignItems: "center",
    }
});
