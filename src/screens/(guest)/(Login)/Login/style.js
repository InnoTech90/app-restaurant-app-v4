import { StyleSheet } from "react-native";
import { gb } from "../../../globalStyles";
import { hp, isTablet, normalize, wp } from "../../../../utils/funcionesMaquetado/responsiveWH";

// En tablet la anchura del formulario está centrada y acotada
const FORM_WIDTH = isTablet ? 480 : null;

export const s = StyleSheet.create({
    login: {
        height: hp(100) + normalize(100),
        justifyContent: "center",
        alignItems: "center",
    },
    loginBackground: {
        position: "absolute",
        width: "100%",
        height: "100%",
        objectFit: "cover",
    },
    header:
    {
        width: "100%",
        padding: 20,
    },
    headerTitle:
    {
        fontSize: normalize(24),
        fontWeight: "bold",
        height: normalize(50),
        color: gb.gray50,
        borderBottomWidth: 2,
        borderBottomColor: gb.gray50,
        width: "100%",
        textAlign: "center",
    },
    logoContainer: {
        justifyContent: "center",
        alignItems: "center",
    },
    logoImage: {
        width: isTablet ? 280 : wp(80),
        height: isTablet ? 120 : hp(20),
        objectFit: "contain",
    },
    loginForm: {
        width: FORM_WIDTH ?? "100%",
    },
    title: {
        fontSize: normalize(22),
        color: gb.purple800,
        marginBottom: normalize(20),
        fontWeight: "bold",
        width: "100%",
        textAlign: "center",
    },
    inputContainer: {
        backgroundColor: "red",
        flexDirection: "row",
        flex: 1,
        alignItems: "center",
        paddingHorizontal: normalize(20),
        gap: normalize(10),
        justifyContent: "center",
        marginTop: normalize(20)
    },
    inputQr: {
        width: isTablet ? 340 : wp(70)
    },
    qrButton: {
        width: normalize(40),
    },
    infoContainer: {
        width: "100%",
        alignItems: "flex-start",
        marginTop: normalize(20)
    },
    subtitle: {
        paddingLeft: isTablet ? 20 : wp(10),
        width: "100%",
        fontSize: normalize(16),
        color: gb.gray50,
    },
    asociarContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: isTablet ? 40 : hp(10)
    },
    btn_sesion: {
        width: isTablet ? 220 : wp(50),
        height: isTablet ? 52 : hp(6),
        backgroundColor: gb.purple700,
        borderRadius: normalize(20),
        justifyContent: "center",
        alignItems: "center",
    }, btn_sesionText: {
        color: gb.gray50,
        fontSize: normalize(20),
        fontWeight: "bold",
    },
    contactoText: {
        width: isTablet ? 400 : wp(80),
        textAlign: "center",
        color: gb.gray50,
        fontSize: normalize(14),
    },
    contactoContainer:
    {
        marginTop: isTablet ? 30 : hp(5),
        justifyContent: "center",
        alignItems: "center",
    },
    containerButtons: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: normalize(20),
        marginTop: isTablet ? 20 : hp(5)
    },
    btnAyuda: {
        width: isTablet ? 160 : wp(40),
        height: isTablet ? 48 : hp(6),
        fontWeight: "bold",
        backgroundColor: gb.gray50,
    },
    btnAyudaText: {
        color: gb.gray700,
        fontSize: normalize(16),
        fontWeight: "bold",
    },
    btnContacto: {
        width: isTablet ? 160 : wp(40),
        height: isTablet ? 48 : hp(6),
    },
    btnContactoText: {
        color: gb.gray700,
        fontSize: normalize(16),
        fontWeight: "bold",
    },
    containerPermisosCamara: {
        alignItems: "center",
        justifyContent: "center",
        borderRadius: normalize(20),
        padding: normalize(20),
        gap: normalize(20),
    },
    containerViewCamera: {
        flex: 1,
        justifyContent: 'center',
    },
    camera: {
        flex: 1,
    },
    containerPermisosCamara: {
        alignItems: "center",
    },
    btnAceptarPermisos: {
        width: isTablet ? 300 : wp(70),
        height: isTablet ? 52 : hp(6),
        backgroundColor: gb.purple700,
        fontSize: normalize(18),
        fontWeight: "bold",
        borderRadius: normalize(20),
    },
    btnAceptarPermisosText: {
        fontSize: normalize(18),
        fontWeight: "bold",
    },
    imgPermisoCamara: {
        width: normalize(60),
        height: normalize(60),
        objectFit: "contain",
    },
    titlePermisoCamara: {
        fontSize: normalize(32),
        fontWeight: "bold",
        color: gb.gray800,
        textAlign: "center",
        marginBottom: normalize(20),
    },
    imagenRq:{
        width: wp(50),
        height: hp(20),
        objectFit: "contain",
        marginBottom: normalize(20),
    },
    subTitleModal:{
        marginBottom: normalize(20),
        fontSize: normalize(20),
        color: gb.gray800,
        textAlign: "center",
    }



});
