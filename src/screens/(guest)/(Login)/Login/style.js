import { StyleSheet } from "react-native";
import {
  CONTENT_MAX_WIDTH,
  hp,
  isTablet,
  normalize,
  wp,
} from "../../../../utils/funcionesMaquetado/responsiveWH";
import { gb } from "../../../globalStyles";

const HOJA_ANCHO = isTablet ? Math.min(520, CONTENT_MAX_WIDTH) : "100%";

export const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: gb.purple50,
  },
  scroll: {
    flexGrow: 1,
    alignItems: "center",
  },
  hero: {
    width: "100%",
    height: isTablet ? hp(34) : hp(36),
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  heroContenido: {
    alignItems: "center",
    paddingBottom: normalize(28),
  },
  circulo: {
    position: "absolute",
    borderRadius: 9999,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  circuloGrande: {
    width: isTablet ? 520 : wp(110),
    height: isTablet ? 520 : wp(110),
    top: isTablet ? -260 : -wp(55),
    right: isTablet ? -140 : -wp(40),
  },
  circuloChico: {
    width: isTablet ? 260 : wp(55),
    height: isTablet ? 260 : wp(55),
    bottom: isTablet ? -120 : -wp(25),
    left: isTablet ? -80 : -wp(18),
  },
  logoImage: {
    width: isTablet ? 260 : wp(56),
    height: isTablet ? 104 : hp(9),
  },
  lema: {
    marginTop: normalize(12),
    color: "rgba(255,255,255,0.92)",
    fontSize: normalize(14),
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  hoja: {
    width: HOJA_ANCHO,
    flexGrow: isTablet ? 0 : 1,
    marginTop: -normalize(28),
    marginBottom: isTablet ? normalize(32) : 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: normalize(28),
    borderTopRightRadius: normalize(28),
    borderBottomLeftRadius: isTablet ? normalize(28) : 0,
    borderBottomRightRadius: isTablet ? normalize(28) : 0,
    paddingHorizontal: normalize(24),
    paddingTop: normalize(28),
    paddingBottom: normalize(28),
    shadowColor: gb.purple800,
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -2 },
    elevation: 6,
  },
  etiqueta: {
    fontSize: normalize(11),
    fontWeight: "700",
    letterSpacing: 1.4,
    color: gb.purple550,
  },
  title: {
    marginTop: normalize(6),
    fontSize: normalize(24),
    color: gb.purple800,
    fontWeight: "700",
  },
  subtitle: {
    marginTop: normalize(6),
    marginBottom: normalize(22),
    fontSize: normalize(14),
    lineHeight: normalize(20),
    color: gb.gray500,
  },
  escanear: {
    flexDirection: "row",
    alignItems: "center",
    gap: normalize(14),
    padding: normalize(14),
    borderRadius: normalize(16),
    backgroundColor: gb.purple50,
    borderWidth: 1,
    borderColor: gb.purple100,
  },
  escanearPresionado: {
    backgroundColor: gb.purple100,
  },
  escanearIcono: {
    width: normalize(52),
    height: normalize(52),
    borderRadius: normalize(14),
    alignItems: "center",
    justifyContent: "center",
  },
  escanearTitulo: {
    fontSize: normalize(16),
    fontWeight: "700",
    color: gb.purple800,
  },
  escanearTexto: {
    marginTop: 2,
    fontSize: normalize(13),
    color: gb.gray500,
  },
  separador: {
    flexDirection: "row",
    alignItems: "center",
    gap: normalize(10),
    marginVertical: normalize(20),
  },
  linea: {
    flex: 1,
    height: 1,
    backgroundColor: gb.purple100,
  },
  separadorTexto: {
    fontSize: normalize(12),
    color: gb.gray400,
  },
  inputQr: {
    marginBottom: 0,
  },
  inputField: {
    height: normalize(52),
    borderRadius: normalize(14),
    borderColor: gb.purple200,
    backgroundColor: "#fff",
    fontSize: normalize(16),
    letterSpacing: 0.5,
  },
  devHint: {
    marginTop: normalize(8),
    fontSize: normalize(12),
    color: gb.gray400,
  },
  btnContenedor: {
    width: "100%",
    marginTop: normalize(18),
    borderRadius: normalize(14),
    overflow: "hidden",
  },
  btn_sesion: {
    width: "100%",
    height: normalize(52),
    justifyContent: "center",
    alignItems: "center",
  },
  btn_sesionText: {
    color: "#fff",
    fontSize: normalize(16),
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: normalize(10),
  },
  ayuda: {
    flexDirection: "row",
    gap: normalize(10),
    marginTop: normalize(24),
    padding: normalize(14),
    borderRadius: normalize(14),
    backgroundColor: gb.purple50,
  },
  ayudaTexto: {
    flex: 1,
    fontSize: normalize(13),
    lineHeight: normalize(19),
    color: gb.gray600,
  },
  ayudaFuerte: {
    fontWeight: "700",
    color: gb.purple800,
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
    justifyContent: "center",
  },
  camera: {
    flex: 1,
  },
  btnAceptarPermisos: {
    width: isTablet ? 300 : wp(70),
    height: isTablet ? 52 : hp(6),
    backgroundColor: gb.blue550,
    fontSize: normalize(18),
    fontWeight: "bold",
    borderRadius: normalize(12),
  },
  btnAceptarPermisosText: {
    fontSize: normalize(18),
    fontWeight: "bold",
  },
  imgPermisoCamara: {
    width: normalize(60),
    height: normalize(60),
  },
  titlePermisoCamara: {
    fontSize: normalize(28),
    fontWeight: "600",
    color: gb.gray800,
    textAlign: "center",
    marginBottom: normalize(20),
  },
  imagenRq: {
    width: wp(50),
    height: hp(20),
    marginBottom: normalize(20),
  },
  subTitleModal: {
    marginBottom: normalize(20),
    fontSize: normalize(18),
    color: gb.gray800,
    textAlign: "center",
  },
});
