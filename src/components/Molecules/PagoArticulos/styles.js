import { StyleSheet } from "react-native";
import { gb } from "../../../screens/globalStyles";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";

export const s = StyleSheet.create({
  wrapper: {
    borderRadius: normalize(12),
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  body: {
    backgroundColor: gb.gray50,
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(12),
    gap: normalize(8),
  },
  listaHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: normalize(6),
    borderBottomWidth: 1,
    borderBottomColor: gb.gray200,
    gap: normalize(8),
  },
  listaHeaderTexto: {
    fontSize: normalize(11),
    fontWeight: "700",
    color: gb.gray400,
    textTransform: "uppercase",
  },
  articuloCard: {
    backgroundColor: gb.gray50,
  },
  articuloCardBorder: {
    borderTopWidth: 1,
    borderTopColor: gb.gray100,
  },
  articuloRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: normalize(8),
    gap: normalize(8),
  },
  articuloInfo: {
    flex: 1,
  },
  articuloNombre: {
    fontSize: normalize(13),
    fontWeight: "600",
    color: gb.gray800,
  },
  articuloMeta: {
    flexDirection: "row",
    gap: normalize(4),
    marginTop: normalize(2),
  },
  articuloPrecio: {
    fontSize: normalize(11),
    color: gb.gray400,
  },
  articuloComps: {
    fontSize: normalize(11),
    color: gb.purple550,
  },
  inputCantidad: {
    width: normalize(100),
  },
  articuloTotal: {
    fontSize: normalize(13),
    fontWeight: "700",
    color: gb.blue550,
    minWidth: normalize(52),
    textAlign: "right",
  },
  btnEliminarContainer: {
    borderRadius: normalize(18),
    overflow: "hidden",
  },
  btnEliminar: {
    width: normalize(34),
    height: normalize(34),
    backgroundColor: gb.red50,
    alignItems: "center",
    justifyContent: "center",
  },
  ajustesLista: {
    borderTopWidth: 1,
    borderTopColor: gb.gray100,
    paddingBottom: normalize(8),
    paddingTop: normalize(6),
    gap: normalize(6),
    backgroundColor: gb.gray100,
    marginHorizontal: normalize(-14),
    paddingHorizontal: normalize(14),
  },
  ajusteBloque: {
    gap: normalize(2),
  },
  ajustesTitulo: {
    fontSize: normalize(11),
    fontWeight: "700",
    color: gb.gray500,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: normalize(2),
  },
  ajusteRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: normalize(6),
    paddingVertical: normalize(2),
    paddingLeft: normalize(4),
  },
  ajusteBullet: {
    fontSize: normalize(11),
    color: gb.gray400,
  },
  ajusteNombre: {
    flex: 1,
    fontSize: normalize(12),
    color: gb.gray600,
  },
  ajustePrecioPos: {
    fontSize: normalize(11),
    fontWeight: "600",
    color: gb.green600,
  },
  ajustePrecioNeg: {
    fontSize: normalize(11),
    fontWeight: "600",
    color: gb.red600,
  },
  notaPedido: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: normalize(6),
    paddingTop: normalize(6),
    marginTop: normalize(2),
    borderTopWidth: 1,
    borderTopColor: gb.blue100,
  },
  notaPedidoTexto: {
    flex: 1,
    fontSize: normalize(12),
    color: gb.blue550,
    fontWeight: "500",
  },
  notasInput: {
    backgroundColor: gb.gray100,
    borderRadius: normalize(8),
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(8),
    fontSize: normalize(13),
    color: gb.gray800,
    minHeight: normalize(60),
    maxHeight: normalize(100),
    borderWidth: 1,
    borderColor: gb.gray200,
    textAlignVertical: "top",
  },
  vacio: {
    textAlign: "center",
    paddingVertical: normalize(20),
    fontSize: normalize(13),
    color: gb.gray400,
  },
});
