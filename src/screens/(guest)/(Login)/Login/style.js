import { StyleSheet } from "react-native";
import {
  CONTENT_MAX_WIDTH,
  hp,
  isTablet,
  normalize,
  wp,
} from "../../../../utils/funcionesMaquetado/responsiveWH";
import { gb } from "../../../globalStyles";

const FORM_WIDTH = isTablet ? Math.min(420, CONTENT_MAX_WIDTH) : wp(88);

export const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: gb.blue950,
  },
  loginBackground: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(13, 48, 68, 0.55)",
  },
  login: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: normalize(24),
    paddingVertical: normalize(32),
  },
  content: {
    width: FORM_WIDTH,
    maxWidth: CONTENT_MAX_WIDTH,
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: normalize(36),
  },
  logoImage: {
    width: isTablet ? 220 : wp(58),
    height: isTablet ? 88 : hp(10),
  },
  panel: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.96)",
    borderRadius: normalize(16),
    paddingHorizontal: normalize(20),
    paddingTop: normalize(28),
    paddingBottom: normalize(24),
  },
  title: {
    fontSize: normalize(20),
    color: gb.blue950,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 0.2,
  },
  subtitle: {
    marginTop: normalize(8),
    marginBottom: normalize(22),
    fontSize: normalize(14),
    lineHeight: normalize(20),
    color: gb.gray500,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: normalize(10),
    width: "100%",
  },
  inputQr: {
    flex: 1,
    marginBottom: 0,
  },
  inputField: {
    height: normalize(48),
    borderRadius: normalize(10),
    borderColor: gb.blue200,
    backgroundColor: gb.gray50,
    fontSize: normalize(15),
  },
  qrButton: {
    width: "100%",
    height: "100%",
  },
  qrButtonWrap: {
    width: normalize(48),
    height: normalize(48),
    borderRadius: normalize(10),
    backgroundColor: gb.blue50,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: gb.blue200,
  },
  devHint: {
    marginTop: normalize(12),
    fontSize: normalize(12),
    color: gb.gray400,
    textAlign: "center",
  },
  asociarContainer: {
    width: "100%",
    marginTop: normalize(20),
  },
  btn_sesion: {
    width: "100%",
    height: normalize(50),
    backgroundColor: gb.blue550,
    borderRadius: normalize(12),
    justifyContent: "center",
    alignItems: "center",
  },
  btn_sesionText: {
    color: gb.gray50,
    fontSize: normalize(16),
    fontWeight: "600",
    letterSpacing: 0.4,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: normalize(10),
  },
  footer: {
    marginTop: normalize(28),
    alignItems: "center",
  },
  contactoText: {
    width: "100%",
    textAlign: "center",
    color: "rgba(255,255,255,0.78)",
    fontSize: normalize(13),
    lineHeight: normalize(18),
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
