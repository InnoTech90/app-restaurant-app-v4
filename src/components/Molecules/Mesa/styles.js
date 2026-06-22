import { StyleSheet } from "react-native";
import { gb } from "../../../screens/globalStyles";
import { isTablet, normalize } from "../../../utils/funcionesMaquetado/responsiveWH";

// Tamaño de la mesa según tipo de dispositivo
const MESA_SIZE = isTablet ? normalize(180) : normalize(150);
const SILLA_LARGO = isTablet ? normalize(108) : normalize(90);
const SILLA_GRUESO = isTablet ? normalize(7) : normalize(6);
const SILLA_OFFSET = isTablet ? normalize(8) : normalize(7);

export const s = StyleSheet.create({
    mesaContainer: {
        justifyContent: "center",
    },
    mesa: {
        width: MESA_SIZE,
        height: MESA_SIZE,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: gb.gray300,
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        margin: normalize(isTablet ? 8 : 6),
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 3,
        shadowOpacity: 0.1,
        backgroundColor: 'white',
    },
    sillaLeft: {
        position: "absolute",
        left: -SILLA_OFFSET,
        backgroundColor: gb.gray300,
        width: SILLA_GRUESO,
        height: SILLA_LARGO,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 0,
    },
    sillaRight:
    {
        position: "absolute",
        right: -SILLA_OFFSET,
        backgroundColor: gb.gray300,
        width: SILLA_GRUESO,
        height: SILLA_LARGO,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 5,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 5,
    },
    sillaTop:
    {
        position: "absolute",
        top: -SILLA_OFFSET,
        backgroundColor: gb.gray300,
        width: SILLA_LARGO,
        height: SILLA_GRUESO,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 0,
    },
    sillaBottom:
    {
        position: "absolute",
        bottom: -SILLA_OFFSET,
        backgroundColor: gb.gray300,
        width: SILLA_LARGO,
        height: SILLA_GRUESO,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 5,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 5,
    },
    // contenido
    contenido: {
        justifyContent: "center",
        alignItems: "center",
        width: '100%'
    },
    nombre: {
        fontSize: normalize(18),
        fontWeight: "bold",
        color: gb.blue800,
    },
    ficha: {
        fontSize: normalize(14),
        color: gb.gray600,
    },
    cambiarMesa: {
        backgroundColor: gb.purple750,
        width: "100%",
        borderRadius: normalize(20),
        height: normalize(35),
    },
    instrucciones: {
        fontSize: normalize(14),
        color: gb.gray400,
        marginBottom: normalize(10),
        textAlign: "center",
    },
    contenedorFichaActual: {
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        marginTop: normalize(10),
        height: normalize(40),
        backgroundColor: gb.purple350 + "40",
        borderRadius: normalize(8),
        justifyContent: "center",
        flexDirection: "row"
    },
    mesaActualFolioContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    mesaActualFolio: {
        color: gb.purple750,
        fontSize: normalize(14),
        fontWeight: "bold",

    },
    iconoInformacion: {
        marginRight: normalize(5),
    },
    listaMesas: {
        width: "100%",
        marginTop: normalize(15),
    },
    mesaItem: {
        padding: normalize(12),
        backgroundColor: gb.gray50,
        borderRadius: normalize(8),
        marginBottom: normalize(8),
        borderWidth: 1,
        borderColor: gb.gray200,
    },
    textoMesa: {
        fontSize: normalize(16),
        color: gb.gray400,
        fontWeight: "500",
    },
    noDataContainer: {
        justifyContent: "center",
        alignItems: "center",
        
    },
    textoMesaDescripcion: {
        fontSize: normalize(14),
        color: gb.gray300,
        marginBottom: normalize(20),

    },
    cerrarButton: {
        backgroundColor: gb.gray100,
        
        borderWidth: 1,
        borderColor: gb.gray300, 
        borderRadius: normalize(20), 
        paddingHorizontal: normalize(20),
        width:normalize(200),
        marginBottom:normalize(20),
    }


});