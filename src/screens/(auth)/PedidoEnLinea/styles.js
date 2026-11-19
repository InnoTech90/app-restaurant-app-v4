import { StyleSheet } from "react-native";
import {
  contentPaddingH,
  isTablet,
  normalize,
} from "../../../utils/funcionesMaquetado/responsiveWH";
import { gb } from "../../globalStyles";

import { color as tema } from "../../../utils/theme";
export const s = StyleSheet.create({
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
    color: tema.text,
    fontSize: normalize(isTablet ? 20 : 18),
    fontWeight: "bold",
  },
  body: {
    flex: 1,
    backgroundColor: gb.gray100,
  },
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: normalize(8),
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(10),
    backgroundColor: tema.surface,
    borderBottomWidth: 1,
    borderBottomColor: gb.gray200,
  },
  filterChip: {
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(7),
    borderRadius: normalize(999),
    backgroundColor: gb.gray100,
    borderWidth: 1,
    borderColor: gb.gray200,
  },
  filterChipActive: {
    backgroundColor: "#1F3A8A",
    borderColor: "#1F3A8A",
  },
  filterChipText: {
    color: gb.gray700,
    fontSize: normalize(12),
    fontWeight: "600",
  },
  filterChipTextActive: {
    color: "white",
  },
  listContent: {
    padding: normalize(14),
    gap: normalize(12),
    paddingBottom: normalize(40),
  },
  card: {
    backgroundColor: tema.surface,
    borderRadius: normalize(14),
    padding: normalize(14),
    borderWidth: 1,
    borderColor: gb.gray200,
    gap: normalize(8),
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: normalize(8),
  },
  cardTitle: {
    flex: 1,
    fontSize: normalize(16),
    fontWeight: "700",
    color: gb.gray900,
  },
  badge: {
    borderRadius: normalize(999),
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(4),
  },
  badgeText: {
    color: "white",
    fontSize: normalize(11),
    fontWeight: "700",
  },
  meta: {
    color: gb.gray600,
    fontSize: normalize(13),
  },
  notes: {
    color: gb.gray700,
    fontSize: normalize(13),
    fontStyle: "italic",
  },
  itemsBox: {
    backgroundColor: gb.gray50,
    borderRadius: normalize(10),
    padding: normalize(10),
    gap: normalize(4),
  },
  itemLine: {
    color: gb.gray800,
    fontSize: normalize(13),
  },
  total: {
    fontSize: normalize(15),
    fontWeight: "700",
    color: gb.gray900,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: normalize(8),
    marginTop: normalize(4),
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: normalize(60),
    gap: normalize(8),
    backgroundColor: gb.gray100,
  },
  emptyText: {
    color: gb.gray600,
    fontSize: normalize(14),
  },
});
