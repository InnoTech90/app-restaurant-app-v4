import { StyleSheet } from "react-native";
import {
  contentPaddingH,
  isTablet,
  normalize,
} from "../../../../utils/funcionesMaquetado/responsiveWH";
import { gb } from "../../../globalStyles";

export const s = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: gb.gray50,
  },
  centrado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    width: "100%",
    height: normalize(60),
    paddingHorizontal: normalize(10),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerMesa: {
    fontSize: normalize(16),
    fontWeight: "800",
    color: gb.gray50,
  },
  headerSub: {
    fontSize: normalize(11),
    color: gb.blue100,
    marginTop: normalize(2),
  },
  headerSpacer: {
    width: normalize(40),
    height: normalize(40),
  },
  clienteStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: normalize(6),
    backgroundColor: gb.green50,
    borderBottomWidth: 1,
    borderBottomColor: gb.green200,
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(8),
  },
  clienteNombre: {
    fontSize: normalize(13),
    fontWeight: "600",
    color: gb.green700,
    flex: 1,
  },
  clienteTelefono: {
    fontSize: normalize(12),
    color: gb.green600,
  },
  buscadorWrapper: {
    paddingHorizontal: isTablet
      ? contentPaddingH + normalize(16)
      : normalize(16),
    paddingTop: normalize(14),
    paddingBottom: normalize(8),
    backgroundColor: gb.gray50,
  },
  filtroContainer: {
    paddingHorizontal: isTablet
      ? contentPaddingH + normalize(16)
      : normalize(16),
    paddingVertical: normalize(10),
    backgroundColor: gb.gray50,
  },
  listaContainer: {
    flexGrow: 1,
    paddingHorizontal: isTablet
      ? contentPaddingH + normalize(16)
      : normalize(16),
    paddingVertical: normalize(10),
    gap: normalize(16),
    paddingBottom: normalize(30),
    width: "100%",
    backgroundColor: gb.gray50,
  },
  listaScroll: {
    flex: 1,
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
  // ── Modal de clientes ───────────────────────────────────────────────────
  modalBuscador: {
    paddingVertical: normalize(10),
    gap: normalize(8),
  },
  modalNuevoClienteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: normalize(6),
    paddingVertical: normalize(8),
    borderRadius: normalize(8),
    backgroundColor: gb.blue50,
    borderWidth: 1,
    borderColor: gb.blue200,
  },
  modalNuevoClienteText: {
    color: gb.blue550,
    fontWeight: "700",
    fontSize: normalize(13),
  },
  modalClienteItem: {
    borderBottomWidth: 1,
    borderBottomColor: gb.gray100,
    flexDirection: "row",
    alignItems: "center",
  },
  modalClienteBoton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: normalize(12),
    gap: normalize(12),
    backgroundColor: "transparent",
    borderRadius: 0,
    flex: 1,
  },
  modalClienteEditBtn: {
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(12),
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
  modalFormScroll: {
    paddingVertical: normalize(8),
    gap: normalize(8),
    paddingBottom: normalize(24),
  },
  modalFormActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: normalize(10),
    marginTop: normalize(12),
  },
  modalFormBtnSecundario: {
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(10),
  },
  modalFormBtnSecundarioText: {
    color: gb.gray500,
    fontWeight: "600",
    fontSize: normalize(13),
  },
  modalFormBtnPrimario: {
    borderRadius: normalize(10),
    overflow: "hidden",
  },
  modalFormBtnPrimarioInner: {
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(10),
  },
  modalFormBtnPrimarioText: {
    color: "white",
    fontWeight: "700",
    fontSize: normalize(13),
  },
});
