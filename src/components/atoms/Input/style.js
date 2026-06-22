import { StyleSheet } from "react-native";
import { gb } from "../../../screens/globalStyles";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";

export const s = StyleSheet.create({
    inputContainer: {
        width: "100%",
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        marginBottom: normalize(10),
    },
    iconContainer: {
        position: "absolute",
        left: normalize(10),
        zIndex: 1,
        height: "100%",
        justifyContent: "center",
    },
    input: {
        flex: 1,
        height: normalize(40),
        borderColor: gb.blue100,
        backgroundColor: gb.gray50,
        borderWidth: 1,
        borderRadius: normalize(5),
        paddingHorizontal: normalize(10),
        color: gb.gray800,
    },
    inputWithIcon: {
        paddingLeft: normalize(34),
    },
})