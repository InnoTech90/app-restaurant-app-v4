import { StyleSheet } from "react-native";
import { CONTENT_MAX_WIDTH, contentPaddingH, isTablet, normalize } from "../../../../utils/funcionesMaquetado/responsiveWH";
import { gb } from "../../../globalStyles";

export const s = StyleSheet.create({
    centrado: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    header: {
        width: "100%",
        height: normalize(50),
        paddingHorizontal: normalize(10),
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    buscadorWrapper: {
        paddingHorizontal: isTablet ? contentPaddingH + normalize(16) : normalize(16),
        paddingTop: normalize(14),
        paddingBottom: normalize(8),
        backgroundColor: gb.gray50,
    },
    filtroContainer: {
        paddingHorizontal: isTablet ? contentPaddingH + normalize(16) : normalize(16),
        paddingVertical: normalize(10),
        backgroundColor: gb.gray50,
    },
    listaContainer: {
        paddingHorizontal: isTablet ? contentPaddingH + normalize(16) : normalize(16),
        paddingVertical: normalize(10),
        gap: normalize(16),
        paddingBottom: normalize(30),
        width: "100%",
        backgroundColor: gb.gray50,
    },
    grupoWrapper: {
        width: "100%",
    },
    textoVacio: {
        textAlign: "center",
        marginTop: normalize(40),
        fontSize: normalize(14),
        color: gb.gray400,
    },
    // ── Barra de comanda activa ─────────────────────────────────────────────
    comandaBar: {
        marginHorizontal: isTablet ? contentPaddingH + normalize(16) : normalize(16),
        marginTop: normalize(6),
        borderRadius: normalize(12),
        overflow: "hidden",
        backgroundColor: gb.gray50,
    },
    comandaBarInner: {
        paddingHorizontal: normalize(16),
        paddingVertical: normalize(12),
        flexDirection: "row",
        alignItems: "flex-start",
        gap: normalize(10),
    },
    comandaBarIcono: {
        marginTop: normalize(2),
    },
    comandaBarTextos: {
        flex: 1,
    },
    comandaBarTitulo: {
        fontSize: normalize(13),
        fontWeight: "700",
        color: gb.gray50,
        marginBottom: normalize(4),
    },
    comandaBarArticulo: {
        fontSize: normalize(12),
        color: gb.blue100,
        lineHeight: normalize(18),
    },
    comandaBarTotal: {
        fontSize: normalize(15),
        fontWeight: "800",
        color: gb.gray50,
        alignSelf: "center",
    },
    containerButtons: {
        flexDirection: "row",
        alignItems: "stretch",
        backgroundColor: gb.gray50,
        borderTopWidth: 1,
        borderTopColor: gb.gray200,
        paddingVertical: normalize(10),
        paddingHorizontal: isTablet ? contentPaddingH + normalize(8) : normalize(8),
        gap: normalize(4),
    },
    botonAccionContainer: {
        flex: 1,
    },
    botonAccion: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: normalize(isTablet ? 12 : 10),
        borderRadius: normalize(10),
        gap: normalize(4),
        backgroundColor: "transparent",
    },
    botonPagar: {
        backgroundColor: gb.green500,
    },
    botonAccionTexto: {
        fontSize: normalize(12),
        fontWeight: "600",
        color: gb.blue550,
    },
    botonAccionDivider: {
        width: 1,
        backgroundColor: gb.gray200,
        marginVertical: normalize(6),
    },
    // ── Modal de clientes ───────────────────────────────────────────────────
    modalBuscador: {
        paddingVertical: normalize(10),
    },
    modalClienteItem: {
        borderBottomWidth: 1,
        borderBottomColor: gb.gray100,
    },
    modalClienteBoton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: normalize(12),
        gap: normalize(12),
        backgroundColor: "transparent",
        borderRadius: 0,
    },
    modalClienteAvatar: {
        width: normalize(38),
        height: normalize(38),
        borderRadius: normalize(19),
        backgroundColor: gb.blue200,
        alignItems: "center",
        justifyContent: "center",
    },
    modalClienteAvatarText: {
        fontSize: normalize(14),
        fontWeight: "700",
        color: gb.blue550,
    },
    modalClienteNombre: {
        fontSize: normalize(14),
        fontWeight: "600",
        color: gb.gray800,
    },
    modalClienteTelefono: {
        fontSize: normalize(12),
        color: gb.gray400,
        marginTop: normalize(2),
    },
    modalVacio: {
        textAlign: "center",
        marginTop: normalize(40),
        fontSize: normalize(14),
        color: gb.gray400,
    },
})