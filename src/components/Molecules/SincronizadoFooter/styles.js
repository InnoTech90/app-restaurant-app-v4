import { StyleSheet } from "react-native";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";
import { gb } from "../../../screens/globalStyles";

export const s = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        padding: normalize(10),
        

    },
    button: {
        paddingHorizontal: normalize(20),
        paddingVertical: normalize(10),
        borderRadius: normalize(5),
        flexDirection: "row",
        alignItems: "center",
        gap: normalize(10),
        backgroundColor: gb.gray50+"40",
        borderRadius: normalize(20),
    },
    buttonText: {
        color: gb.gray50,
        fontSize: normalize(14),
        fontWeight: "bold",
        
    },
});
