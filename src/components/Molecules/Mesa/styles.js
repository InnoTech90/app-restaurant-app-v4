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
    mesaOcupada: {
        borderColor: gb.purple550,
        backgroundColor: gb.blue50,
        height: isTablet ? normalize(200) : normalize(175),
    },
    mesaImpresa: {
        borderColor: gb.orange600,
        backgroundColor: gb.yellow50,
        height: isTablet ? normalize(215) : normalize(190),
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
        fontSize: normalize(isTablet ? 16 : 15),
        fontWeight: "bold",
        color: gb.blue800,
        textAlign: "center",
        paddingHorizontal: normalize(4),
    },
    estadoOcupada: {
        fontSize: normalize(11),
        fontWeight: "700",
        color: gb.purple550,
        marginTop: normalize(2),
        textTransform: "uppercase",
        letterSpacing: 0.4,
    },
    estadoImpresa: {
        fontSize: normalize(10),
        fontWeight: "700",
        color: gb.orange600,
        marginTop: normalize(2),
        textTransform: "uppercase",
        letterSpacing: 0.3,
    },
    estadoLibre: {
        fontSize: normalize(11),
        fontWeight: "600",
        color: gb.gray400,
        marginTop: normalize(4),
    },
    ficha: {
        fontSize: normalize(11),
        color: gb.gray600,
        marginTop: normalize(2),
    },
    notaInput: {
        marginTop: normalize(6),
        width: "82%",
        height: normalize(28),
        borderWidth: 1,
        borderColor: gb.gray200,
        borderRadius: normalize(6),
        paddingHorizontal: normalize(8),
        paddingVertical: 0,
        fontSize: normalize(11),
        color: gb.gray800,
        backgroundColor: gb.gray50,
        textAlign: "center",
    },
    cambiarMesa: {
        marginTop: normalize(6),
        backgroundColor: gb.purple750,
        borderRadius: normalize(14),
        paddingHorizontal: normalize(10),
        paddingVertical: normalize(5),
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: normalize(4),
    },
    cambiarMesaTexto: {
        color: gb.gray50,
        fontSize: normalize(11),
        fontWeight: "700",
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