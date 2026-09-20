import { StyleSheet } from "react-native";
import {
  CONTENT_MAX_WIDTH,
  contentPaddingH,
  isTablet,
  normalize,
} from "../../../utils/funcionesMaquetado/responsiveWH";
import { gb } from "../../globalStyles";

const s = StyleSheet.create({
  // ── Header ──────────────────────────────────────────────────────────────
  header: {
    width: "100%",
    height: normalize(isTablet ? 56 : 50),
    paddingHorizontal: isTablet
      ? contentPaddingH + normalize(16)
      : normalize(10),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    color: "white",
    fontSize: normalize(isTablet ? 20 : 18),
    fontWeight: "bold",
  },

  // ── Lista ────────────────────────────────────────────────────────────────
  listContent: {
    paddingVertical: normalize(16),
    paddingHorizontal: isTablet ? contentPaddingH + normalize(16) : normalize(16),
    gap: normalize(12),
    ...(isTablet && {
      alignSelf: "center",
      width: "100%",
      maxWidth: CONTENT_MAX_WIDTH + contentPaddingH * 2,
    }),
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: normalize(80),
    gap: normalize(12),
    alignSelf: "center",
    width: "100%",
    maxWidth: isTablet ? 480 : undefined,
  },
  emptyText: {
    fontSize: normalize(15),
    color: gb.gray500,
    textAlign: "center",
    lineHeight: normalize(22),
  },

  // ── Card impresora ────────────────────────────────────────────────────────
  card: {
    backgroundColor: "white",
    borderRadius: normalize(14),
    padding: normalize(isTablet ? 16 : 14),
    gap: normalize(12),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: normalize(2) },
    shadowOpacity: 0.08,
    shadowRadius: normalize(6),
    elevation: 3,
    width: "100%",
    flex: 1,
    ...(isTablet
      ? {
          flexDirection: "column",
          alignItems: "stretch",
          minHeight: normalize(140),
        }
      : {
          flexDirection: "row",
          alignItems: "center",
        }),
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: normalize(12),
    flex: isTablet ? 0 : 1,
  },
  iconBox: {
    width: normalize(isTablet ? 52 : 46),
    height: normalize(isTablet ? 52 : 46),
    borderRadius: normalize(12),
    backgroundColor: gb.blue100,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBoxLinked: {
    backgroundColor: gb.green100 || "#ddfbdf",
  },
  cardInfo: {
    flex: 1,
    gap: normalize(4),
    minWidth: 0,
  },
  cardNombre: {
    fontSize: normalize(isTablet ? 16 : 14),
    fontWeight: "700",
    color: gb.gray800,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: normalize(5),
  },
  statusDot: {
    width: normalize(7),
    height: normalize(7),
    borderRadius: normalize(4),
  },
  statusText: {
    fontSize: normalize(isTablet ? 12 : 11),
    fontWeight: "600",
  },
  macText: {
    fontSize: normalize(isTablet ? 11 : 10),
    color: gb.gray400,
    fontFamily: "monospace",
  },
  cardActions: {
    gap: normalize(8),
    ...(isTablet
      ? {
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "flex-end",
          borderTopWidth: 1,
          borderTopColor: gb.gray100,
          paddingTop: normalize(12),
          marginTop: normalize(2),
        }
      : {
          flexDirection: "column",
          alignItems: "stretch",
        }),
  },
  btnVincular: {
    backgroundColor: gb.blue550,
    borderRadius: normalize(8),
    paddingHorizontal: normalize(isTablet ? 14 : 10),
    paddingVertical: normalize(isTablet ? 8 : 6),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: normalize(4),
    ...(isTablet && { minWidth: normalize(110) }),
  },
  btnDesvincular: {
    backgroundColor: gb.red600,
    borderRadius: normalize(8),
    paddingHorizontal: normalize(isTablet ? 14 : 10),
    paddingVertical: normalize(isTablet ? 8 : 6),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: normalize(4),
    ...(isTablet && { minWidth: normalize(110) }),
  },
  btnTest: {
    backgroundColor: gb.green500,
    borderRadius: normalize(8),
    paddingHorizontal: normalize(isTablet ? 14 : 10),
    paddingVertical: normalize(isTablet ? 8 : 6),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: normalize(4),
    ...(isTablet && { minWidth: normalize(110) }),
  },
  btnText: {
    color: "white",
    fontSize: normalize(isTablet ? 12 : 11),
    fontWeight: "700",
  },

  // ── Modal Bluetooth ───────────────────────────────────────────────────────
  modalBody: {
    gap: normalize(8),
    width: "100%",
    ...(isTablet && {
      alignSelf: "center",
      maxWidth: 520,
      paddingHorizontal: normalize(8),
      paddingBottom: normalize(8),
    }),
  },
  scanningRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: normalize(8),
    paddingVertical: normalize(6),
  },
  scanningText: {
    fontSize: normalize(13),
    color: gb.blue550,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: normalize(12),
    fontWeight: "700",
    color: gb.gray500,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: normalize(6),
    marginBottom: normalize(2),
  },
  deviceItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: normalize(10),
    paddingVertical: normalize(isTablet ? 12 : 10),
    paddingHorizontal: normalize(4),
    borderBottomWidth: 1,
    borderBottomColor: gb.gray200,
  },
  deviceIconBox: {
    width: normalize(isTablet ? 42 : 36),
    height: normalize(isTablet ? 42 : 36),
    borderRadius: normalize(9),
    backgroundColor: gb.blue100,
    alignItems: "center",
    justifyContent: "center",
  },
  deviceInfo: {
    flex: 1,
    minWidth: 0,
  },
  deviceName: {
    fontSize: normalize(isTablet ? 14 : 13),
    fontWeight: "700",
    color: gb.gray800,
  },
  deviceAddress: {
    fontSize: normalize(isTablet ? 11 : 10),
    color: gb.gray400,
    fontFamily: "monospace",
  },
  deviceConnectBtn: {
    backgroundColor: gb.blue550,
    borderRadius: normalize(8),
    paddingHorizontal: normalize(isTablet ? 14 : 10),
    paddingVertical: normalize(isTablet ? 8 : 5),
  },
  deviceConnectText: {
    color: "white",
    fontSize: normalize(isTablet ? 12 : 11),
    fontWeight: "700",
  },
  noDevicesText: {
    fontSize: normalize(13),
    color: gb.gray400,
    textAlign: "center",
    paddingVertical: normalize(10),
    lineHeight: normalize(20),
  },
  scanBtn: {
    backgroundColor: gb.blue550,
    borderRadius: normalize(10),
    paddingVertical: normalize(isTablet ? 12 : 10),
    alignItems: "center",
    marginTop: normalize(8),
    flexDirection: "row",
    justifyContent: "center",
    gap: normalize(6),
    ...(isTablet && { alignSelf: "center", minWidth: normalize(240) }),
  },
  scanBtnText: {
    color: "white",
    fontSize: normalize(13),
    fontWeight: "700",
  },
});

export default s;
