import { View,Image, Pressable } from "react-native";
import { s } from "./styles";

const QrButton = ({ onPress, style }) => {
    return (
        <View style={s.qrButtonContainer}>
            <Pressable onPress={onPress} style={[s.qrButton, style]}>
                <Image source={require("../../../assets/img/icono_qr.png")} style={s.qrIcon} />
            </Pressable>
        </View>
    )
}
export default QrButton;