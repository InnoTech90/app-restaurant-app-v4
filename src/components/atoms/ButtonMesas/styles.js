import { StyleSheet } from "react-native";
import { gb } from "../../../screens/globalStyles";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";

export const s = StyleSheet.create({
    buttonContainer: {
        marginLeft: 'auto',
        backgroundColor:`${gb.gray50}40`, // Agrega opacidad al color de fondo)`,
        borderWidth: 1,
        borderColor: `${gb.gray50}BF`, // Agrega opacidad al color del borde)`,
        borderRadius: normalize(20),
    },
    // poner opacidad al fondo del boton
    button: {
        flexDirection: "row",
        gap:normalize(4),
        paddingHorizontal: normalize(10),
        paddingVertical: normalize(6),
        alignItems: "center",
    },
    buttonText:{
        fontSize: normalize(14),
        color: gb.gray50,
    }
});
