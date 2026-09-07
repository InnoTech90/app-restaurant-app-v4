import { LinearGradient } from "expo-linear-gradient";
import { usePathname } from "expo-router";
import { useContext } from "react";
import { Text, View } from "react-native";
import DrawerButton from "../../../components/atoms/DraweButton/DraweButton";
import { gb } from "../../../screens/globalStyles";
import { AuthContext } from "../../../utils/AuthContext/AuthContext";
import ButtonMesas from "../../atoms/ButtonMesas/ButtonMesas";
import { s } from "./styles";

const AuthHeader = ({ navigation, route, options }) => {
  const pathname = usePathname();
  const { gerenteSesion } = useContext(AuthContext);

  return (
    <LinearGradient
      colors={gb.gradient_blue}
      style={s.header}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <View style={s.containerHeader}>
        <DrawerButton onPress={() => navigation.openDrawer()} />

        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={s.title}>
            {options?.title
              ? options.title.toUpperCase()
              : pathname.replace("/", "").toUpperCase() || "INICIO"}
          </Text>
          {gerenteSesion?.nombre ? (
            <Text
              style={{
                color: gb.gray50,
                fontSize: 11,
                opacity: 0.85,
                marginTop: 2,
              }}
              numberOfLines={1}
            >
              {gerenteSesion.nombre}
            </Text>
          ) : null}
        </View>

        <ButtonMesas />
      </View>
    </LinearGradient>
  );
};

export default AuthHeader;

