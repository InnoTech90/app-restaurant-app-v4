import { StyleSheet } from "react-native";
import { CONTENT_MAX_WIDTH, contentPaddingH, isTablet, normalize } from "../../../utils/funcionesMaquetado/responsiveWH";
import { gb } from "../../globalStyles";

export const s = StyleSheet.create({
    header: {
        width: "100%",
        height: normalize(50),
        paddingHorizontal: normalize(10),
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    cajaContainer:{
        flex: 1,
        alignItems: "center",
        padding: normalize(20),
        backgroundColor: gb.gray50,
        ...(isTablet && { alignSelf: "center", width: CONTENT_MAX_WIDTH }),
    },
    caja:{
        width: "100%",
        borderRadius: normalize(15),
        padding: normalize(20),
        alignItems: "center",
        justifyContent: "center",
    },
    cajaTitle:{
        flexDirection: "row",
        gap: normalize(10),
        width: "100%",
        justifyContent: "flex-start",
        alignItems: "center",
    },
    cajaText:{
        color: gb.gray50,
        fontSize: normalize(22),
        fontWeight: "bold",

    },
    containerCristal:{
        height:'fit-content',
        backgroundColor: gb.gray50+'40',
        padding: normalize(10),
        borderRadius: normalize(10),
        width: "100%",
        marginTop: normalize(20),
        justifyContent: "center",
    },
    row:{
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
    text:{
        color: gb.gray50,
        fontSize: normalize(12),
        fontWeight: "bold",
    },
    containerButtons:{
        flexDirection: "row",
        justifyContent: "center",
        gap: normalize(10),
        marginTop: normalize(10),
        width: "100%",
    },
    button:{
        backgroundColor: gb.blue50 + '40',
        flexDirection: "row",
        gap: normalize(5),
        width: normalize(100),
        padding: normalize(10),
        borderRadius: normalize(5),
        alignItems: "center",
        justifyContent: "center",
    },
    contenidoModal:{
        width: "100%",
        padding: normalize(20),
    },
    modalDescripcion:{
        color: gb.gray600,
        fontSize: normalize(12),
        marginBottom: normalize(10),
        textAlign:"center"
    },
    inputContainer:{
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
    },
    input:{
        flex: 1,
        color: gb.gray400,
        fontSize: normalize(22),
        padding: normalize(10),
        borderWidth: 1,
        borderColor: gb.gray300,
        fontWeight: "bold",
        borderRadius: normalize(5),
        
    },
    montosRapidosContainer:{
            flexDirection: "row",
            gap: normalize(10),
            marginTop: normalize(20),
            marginBottom: normalize(20),
            justifyContent: "center",
    },
    montoRapido:{
        backgroundColor: gb.blue200 + '40',
        padding: normalize(10),
        borderRadius: normalize(5),
        borderRadius: normalize(5),
        borderWidth: 1,
        borderColor: gb.purple550,
       
    },
    buttonModalCancelContainer:{
        flex: 1,
    },
    buttonModalCancel:{
        backgroundColor: gb.gray100,
        paddingVertical: normalize(10),
        borderRadius: normalize(5),
        alignItems: "center",
        justifyContent: "center",
    },
    buttonModalAcceptContainer:{
        flex: 1,
    },
    buttonModalAccept:{
        backgroundColor: gb.green500,
        paddingVertical: normalize(10),
        borderRadius: normalize(5),
        alignItems: "center",
        justifyContent: "center",
    },
    scroll: {
        padding: normalize(20),
        gap: normalize(16),
    },
    cajaWrapper: {
        width: "100%",
        backgroundColor: gb.gray50,
        padding: normalize(20),
    },
    historialContainer: {
        width: "100%",
        marginTop: normalize(16),
    },
    historialTitle: {
        fontSize: normalize(14),
        fontWeight: "bold",
        color: gb.gray700,
        marginBottom: normalize(8),
    },
    historialItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: normalize(10),
        backgroundColor: gb.gray50,
        borderRadius: normalize(10),
        padding: normalize(12),
        marginBottom: normalize(8),
        shadowColor: "#000",
        shadowOpacity: 0.07,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    historialIndicador: {
        width: normalize(6),
        height: normalize(40),
        borderRadius: normalize(3),
    },
    historialFecha: {
        fontSize: normalize(12),
        color: gb.gray600,
    },
    historialDevice: {
        fontSize: normalize(11),
        color: gb.gray400,
        marginTop: normalize(2),
    },
    historialMonto: {
        fontSize: normalize(14),
        fontWeight: "bold",
        color: gb.gray800,
    },
    historialEstatusText: {
        fontSize: normalize(11),
        fontWeight: "bold",
        marginTop: normalize(2),
    },


})
  