import { View, Image, Pressable } from "react-native";
import { s } from "./styles";



const DrawerButton = ({ onPress, style }) => {
    return (
        <View style={s.drawerButtonContainer}>
            <Pressable onPress={onPress} style={[s.drawerButton, style]}>
                <Image source={require("../../../assets/img/avatar_app_rest.png")} style={s.drawerIcon} />
            </Pressable>
        </View>
    )
}
export default DrawerButton;