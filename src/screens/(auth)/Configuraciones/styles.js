import { StyleSheet } from "react-native";
import {
  CONTENT_MAX_WIDTH,
  contentPaddingH,
  isTablet,
  normalize,
} from "../../../utils/funcionesMaquetado/responsiveWH";
import { gb } from "../../globalStyles";

export const s = StyleSheet.create({
  // ── Raíz ─────────────────────────────────────────────────────────────────
  root: {
    flex: 1,
    backgroundColor: gb.gray100,
  },
  // ── Header ───────────────────────────────────────────────────────────────
  header: {
    width: "100%",
    height: normalize(60),
    paddingHorizontal: normalize(16),
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitulo: {
    fontSize: normalize(18),
    fontWeight: "800",
    color: gb.gray50,
  },
  // ── Scroll ───────────────────────────────────────────────────────────────
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: isTablet
      ? contentPaddingH + normalize(12)
      : normalize(12),
    paddingTop: normalize(14),
    paddingBottom: normalize(40),
    gap: normalize(14),
    ...(isTablet && { alignSelf: "center", width: CONTENT_MAX_WIDTH }),
  },
  // ── Sección (tarjeta) ─────────────────────────────────────────────────────
  seccion: {
    borderRadius: normalize(12),
    overflow: "hidden",
    backgroundColor: gb.gray50,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  seccionHeader: {
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(10),
    flexDirection: "row",
    alignItems: "center",
    gap: normalize(8),
  },
  seccionTitulo: {
    fontSize: normalize(13),
    fontWeight: "700",
    color: gb.gray50,
  },
  // ── Select inline ─────────────────────────────────────────────────────────
  selectInline: {
    width: normalize(130),
  },
  // ── Input nombre dispositivo ──────────────────────────────────────────────
  inputNombre: {
    fontSize: normalize(12),
    color: gb.gray500,
    textAlign: "right",
    maxWidth: normalize(140),
  },
  syncPanel: {
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(16),
    gap: normalize(8),
  },
  syncTitle: {
    fontSize: normalize(14),
    fontWeight: "700",
    color: gb.gray700,
  },
  syncSubtitle: {
    fontSize: normalize(12),
    color: gb.gray500,
    lineHeight: normalize(18),
  },
  syncButtonContainer: {
    marginTop: normalize(4),
  },
  syncButton: {
    backgroundColor: gb.blue550,
    borderRadius: normalize(10),
    alignItems: "center",
    justifyContent: "center",
    minHeight: normalize(42),
  },
  syncButtonDisabled: {
    backgroundColor: gb.gray300,
  },
  syncButtonText: {
    color: gb.gray50,
    fontSize: normalize(13),
    fontWeight: "700",
  },
});
