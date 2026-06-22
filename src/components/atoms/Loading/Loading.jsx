import { ActivityIndicator, View } from "react-native";

const Loading = ({ color = "#ffffff", size = "large", style }) => {
    return (
        <View style={style}>
            <ActivityIndicator size={size} color={color} />
        </View>
    );
}

export default Loading;
