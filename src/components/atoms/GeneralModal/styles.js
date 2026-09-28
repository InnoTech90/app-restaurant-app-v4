import { Dimensions, StyleSheet } from "react-native";
import {
  CONTENT_MAX_WIDTH,
  isTablet,
  normalize,
} from "../../../utils/funcionesMaquetado/responsiveWH";

const MODAL_WIDTH = isTablet ? Math.min(CONTENT_MAX_WIDTH * 0.72, 560) : "90%";
const SCROLL_MAX_HEIGHT = Dimensions.get("window").height * (isTablet ? 0.68 : 0.74);

const s = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: isTablet ? normalize(24) : normalize(12),
  },
  sheet: {
    width: MODAL_WIDTH,
    maxWidth: isTablet ? 560 : undefined,
    maxHeight: isTablet ? "85%" : "92%",
    borderRadius: normalize(12),
    overflow: "hidden",
    backgroundColor: "white",
  },
  container: {
    width: "100%",
    flexShrink: 1,
    backgroundColor: "white",
  },
  content: {
    width: "100%",
    maxHeight: SCROLL_MAX_HEIGHT,
    flexShrink: 1,
    backgroundColor: "white",
  },
  contentContainer: {
    padding: isTablet ? normalize(16) : normalize(10),
  },
  header: {
    width: "100%",
    backgroundColor: "white",
    paddingHorizontal: isTablet ? normalize(20) : normalize(16),
    paddingVertical: isTablet ? normalize(16) : normalize(14),
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitleS: {
    flex: 1,
    fontSize: normalize(isTablet ? 18 : 16),
    fontWeight: "bold",
    marginRight: normalize(8),
  },
});

export default s;
