import { Text, View } from "react-native";

const Tooltip = ({ visible, children }) => {
    if (!visible) return null;
    return (
        <View style={{
            position: "absolute",
            bottom: "90%",
            alignSelf: "center",
            backgroundColor: "rgba(0,0,0,0.8)",
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 6,
            zIndex: 999,
        }}>
            <Text style={{ color: "white", fontSize: 12 }}>{children}</Text>
        </View>
    );
}

export default Tooltip;
