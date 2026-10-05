import { StyleSheet } from "react-native";
import {
  CONTENT_MAX_WIDTH,
  contentPaddingH,
  isTablet,
  normalize,
} from "../../../utils/funcionesMaquetado/responsiveWH";
import { gb } from "../../globalStyles";

export const s = StyleSheet.create({
  /* ── Header ─────────────────────────────── */
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
  btnAdd: {
    width: normalize(35),
    height: normalize(35),
    borderRadius: normalize(15),
    backgroundColor: gb.gray50 + "20",
    borderWidth: normalize(1),
    borderColor: gb.gray50,
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  },
  btnHeaderDelete: {
    width: normalize(35),
    height: normalize(35),
    borderRadius: normalize(15),
    backgroundColor: "#C5303040",
    borderWidth: normalize(1),
    borderColor: "#FCA5A5",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  },
  cardDeleteBtn: {
    width: normalize(34),
    height: normalize(34),
    borderRadius: normalize(10),
    backgroundColor: "#C5303014",
    borderWidth: 1,
    borderColor: "#C53030",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: normalize(4),
  },

  /* ── Body / lista ────────────────────────── */
  body: {
    flex: 1,
    backgroundColor: gb.gray100,
  },
  leyendaColores: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: normalize(14),
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(8),
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: gb.gray200,
  },
  leyendaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: normalize(6),
  },
  leyendaMuestra: {
    width: normalize(14),
    height: normalize(14),
    borderRadius: normalize(4),
  },
  leyendaTexto: {
    color: gb.gray600,
    fontSize: normalize(12),
  },
  listContent: {
    paddingVertical: normalize(14),
    paddingHorizontal: isTablet
      ? contentPaddingH + normalize(14)
      : normalize(14),
    paddingBottom: normalize(30),
    gap: normalize(14),
    ...(isTablet && {
      alignSelf: "center",
      width: CONTENT_MAX_WIDTH + contentPaddingH * 2,
      maxWidth: "100%",
    }),
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: normalize(60),
    gap: normalize(10),
    alignSelf: "center",
    width: "100%",
    maxWidth: isTablet ? 480 : undefined,
  },
  emptyText: {
    color: gb.gray400,
    fontSize: normalize(14),
  },

  /* ── Card cliente ────────────────────────── */
  card: {
    backgroundColor: "white",
    borderRadius: normalize(14),
    flexDirection: "row",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    width: "100%",
    flex: 1,
  },
  cardInactiva: {
    opacity: 0.92,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  cardPendiente: {
    borderWidth: 1,
    borderColor: "#F6C9A4",
  },
  cardBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: normalize(6),
    alignItems: "center",
  },
  cardPendienteBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#FFF3E0",
    borderRadius: normalize(8),
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(3),
    borderWidth: 1,
    borderColor: "#FF9800",
  },
  cardPendienteBadgeText: {
    color: "#E65100",
    fontSize: normalize(11),
    fontWeight: "700",
  },
  cardInactivoBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#C5303018",
    borderRadius: normalize(8),
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(3),
  },
  cardInactivoBadgeText: {
    color: "#C53030",
    fontSize: normalize(11),
    fontWeight: "700",
  },
  cardAccent: {
    width: normalize(5),
  },
  cardBody: {
    flex: 1,
    paddingVertical: normalize(16),
    paddingHorizontal: normalize(16),
    gap: normalize(12),
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: normalize(4),
  },
  cardAvatar: {
    width: normalize(38),
    height: normalize(38),
    borderRadius: normalize(19),
    alignItems: "center",
    justifyContent: "center",
    marginRight: normalize(10),
  },
  cardAvatarText: {
    color: "white",
    fontWeight: "bold",
    fontSize: normalize(15),
  },
  cardNameRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  cardNameBlock: {
    flex: 1,
    gap: normalize(6),
  },
  cardName: {
    color: gb.purple800,
    fontWeight: "700",
    fontSize: normalize(15),
    lineHeight: normalize(20),
    textTransform: "capitalize",
  },
  cardDetails: {
    gap: normalize(10),
    paddingTop: normalize(12),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: gb.gray200,
  },
  cardInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: normalize(8),
  },
  cardInfoText: {
    color: gb.gray500,
    fontSize: normalize(13),
    lineHeight: normalize(18),
    flex: 1,
  },
  cardKey: {
    alignSelf: "flex-start",
    backgroundColor: gb.purple550 + "18",
    borderRadius: normalize(8),
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(3),
  },
  cardKeyText: {
    color: gb.purple550,
    fontSize: normalize(11),
    fontWeight: "600",
  },

  /* ── Formulario (Agregar / Editar) ────────── */
  formBody: {
    flex: 1,
    backgroundColor: gb.gray100,
  },
  formScroll: {
    padding: normalize(16),
    paddingBottom: normalize(160),
    gap: normalize(12),
  },
  sectionLabel: {
    color: gb.purple800,
    fontWeight: "700",
    fontSize: normalize(13),
    marginBottom: normalize(2),
    marginTop: normalize(8),
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  saveBtn: {
    marginTop: normalize(8),
    borderRadius: normalize(12),
    overflow: "hidden",
  },
  saveBtnInner: {
    paddingVertical: normalize(14),
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: normalize(8),
  },
  saveBtnText: {
    color: "white",
    fontWeight: "700",
    fontSize: normalize(15),
  },
  btnSync: {
    flexDirection: "row",
    flex: 1,
    borderWidth: normalize(1),
    borderColor: gb.gray50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: gb.gray50 + "20",
    borderRadius: normalize(15),
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(0),
  },
  btnSyncText: {
    color: "white",
    fontWeight: "600",
    fontSize: normalize(14),
    marginLeft: normalize(6),
  },
  footer: {
    width: "100%",
    height: normalize(50),
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(8),
    gap: normalize(10),
    justifyContent: "space-around",
  },
});
