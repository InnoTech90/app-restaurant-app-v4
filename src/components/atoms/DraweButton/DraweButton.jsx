import { Image, Pressable, Text, View } from "react-native";
import { useDigitalOrdersBadge } from "../../../utils/digitalOrders/badgeStore";
import { s } from "./styles";

const DrawerButton = ({ onPress, style }) => {
  const pendingCount = useDigitalOrdersBadge();

  return (
    <View style={s.drawerButtonContainer}>
      <Pressable onPress={onPress} style={[s.drawerButton, style]}>
        <Image
          source={require("../../../assets/img/avatar_app_rest.png")}
          style={s.drawerIcon}
        />
        {pendingCount > 0 ? (
          <View style={s.badge}>
            <Text style={s.badgeText}>
              {pendingCount > 9 ? "9+" : String(pendingCount)}
            </Text>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
};

export default DrawerButton;
