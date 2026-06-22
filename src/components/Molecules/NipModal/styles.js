import { StyleSheet } from "react-native";
import { normalize, wp } from "../../../utils/funcionesMaquetado/responsiveWH";
import { gb } from "../../../screens/globalStyles";

export const s = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: "white",
        borderRadius: 10,
        alignItems: "center",
        width: '100%'

    },
    titleModal: {
        fontSize: normalize(20),
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 5,
    },
    subTitleModal: {
        fontSize: 14,
        color: "gray",
        textAlign: "center",
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: gb.gray300,
        borderRadius: 5,
        fontSize: normalize(30),
        textAlignVertical: "center",
        textAlign: "center",
        outlineColor: "transparent",
        height: normalize(40),
        backgroundColor: gb.gray50,
    },
    btnConfirmarText: {
        color: "white",
        fontWeight: "bold",
    },
    subTitleModal: {
        fontSize: normalize(14),
        color: gb.gray400,
        textAlign: "center",
        marginBottom: 20,
    },
    iconContainer: {
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
        width: normalize(70),
        height: normalize(70),
        borderRadius: normalize(35),
    },
    buttonsContainer: {
        marginTop: normalize(20),
        flexDirection: "row",
        gap: normalize(20),
        justifyContent: "space-between",
        width: "100%",
    },
    btnCancelarText: {
        color: gb.purple550,
        fontWeight: "bold",
        width: "100%",
        textAlign: "center",

    },
    btnCancelar: {
        width: wp(30),
        backgroundColor: gb.gray50,
        padding: 10,
        borderRadius: 5,
        alignItems: "center",
        marginTop: 10,
        borderRadius: normalize(20),
        borderWidth: 1,
        borderColor: gb.purple550,
    },
    btnConfirmar: {
        width: wp(30),
        backgroundColor: gb.purple550,
        padding: 10,
        borderRadius: 5,
        alignItems: "center",
        marginTop: 10,
        borderRadius: normalize(20),
    },
    
})