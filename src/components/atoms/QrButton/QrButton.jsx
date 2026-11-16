import { Image, Pressable, View } from "react-native";
import { s } from "./styles";

const QrButton = ({ onPress, style, iconStyle }) => {
  return (
    <View style={s.qrButtonContainer}>
      <Pressable onPress={onPress} style={[s.qrButton, style]}>
        <Image
          source={require("../../../assets/img/icono_qr.png")}
          style={[s.qrIcon, iconStyle]}
        />
      </Pressable>
    </View>
  );
};

export default QrButton;
