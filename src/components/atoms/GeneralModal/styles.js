import { Dimensions, StyleSheet } from "react-native";
import {
  CONTENT_MAX_WIDTH,
  hp,
  isTablet,
  normalize,
} from "../../../utils/funcionesMaquetado/responsiveWH";
import { color, font, radius, shadow } from "../../../utils/theme";

const MODAL_WIDTH = isTablet ? Math.min(CONTENT_MAX_WIDTH * 0.72, 560) : "90%";
const SCROLL_MAX_HEIGHT = hp(isTablet ? 68 : 74);

const s = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: color.overlay,
    paddingHorizontal: isTablet ? normalize(24) : normalize(12),
  },
  sheet: {
    width: MODAL_WIDTH,
    maxWidth: isTablet ? 560 : undefined,
    maxHeight: isTablet ? "85%" : "92%",
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: color.surface,
    ...shadow.raised,
  },
  container: {
    width: "100%",
    flexShrink: 1,
    backgroundColor: color.surface,
  },
  content: {
    width: "100%",
    maxHeight: SCROLL_MAX_HEIGHT,
    flexShrink: 1,
    backgroundColor: color.surface,
  },
  contentContainer: {
    padding: isTablet ? normalize(16) : normalize(10),
  },
  header: {
    width: "100%",
    backgroundColor: color.surface,
    borderBottomWidth: 1,
    borderBottomColor: color.border,
    paddingHorizontal: isTablet ? normalize(20) : normalize(16),
    paddingVertical: isTablet ? normalize(16) : normalize(14),
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitleS: {
    flex: 1,
    fontSize: font.lg,
    fontWeight: font.bold,
    color: color.title,
    marginRight: normalize(8),
  },
});

export default s;
