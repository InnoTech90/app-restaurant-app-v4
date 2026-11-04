import { StyleSheet } from "react-native";

export const s = StyleSheet.create({
  drawerButtonContainer: {
    width: 70,
    height: 70,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  drawerButton: {
    width: 70,
    height: 70,
    backgroundColor: "transparent",
  },
  drawerIcon: {
    width: 70,
    height: 70,
  },
  badge: {
    position: "absolute",
    top: 6,
    right: 6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#DC2626",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
    lineHeight: 12,
  },
});