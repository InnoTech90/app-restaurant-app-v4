import { StyleSheet } from "react-native";
import { color, font, radius } from "../../../utils/theme";
import { isTablet, normalize } from "../../../utils/funcionesMaquetado/responsiveWH";

const SIZE = normalize(isTablet ? 48 : 44);

export const s = StyleSheet.create({
  drawerButtonContainer: {
    width: SIZE,
    height: SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  drawerButton: {
    width: SIZE,
    height: SIZE,
    borderRadius: radius.md,
    backgroundColor: color.surface,
    padding: 2,
    shadowColor: "#2A3A8C",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  drawerIcon: {
    width: "100%",
    height: "100%",
    borderRadius: radius.sm,
    overflow: "hidden",
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    minWidth: normalize(18),
    height: normalize(18),
    borderRadius: normalize(9),
    backgroundColor: color.danger,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: color.surface,
  },
  badgeText: {
    color: color.textOnPrimary,
    fontSize: font.xs,
    fontWeight: font.bold,
  },
});
