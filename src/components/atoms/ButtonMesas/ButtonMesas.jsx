import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { clearAuthHeaderTitulo } from "../../../utils/authHeaderTitle";
import { s } from "./styles";

const ButtonMesas = ({ style }) => {
  const router = useRouter();
  return (
    <View style={s.buttonContainer}>
      <Pressable
        onPress={async () => {
          await AsyncStorage.multiRemove([
            "MesaSeleccionada",
            "MesaSeleccionadaNombre",
          ]);
          await clearAuthHeaderTitulo();
          router.replace("/Inicio");
        }}
        style={[s.button, style]}
      >
        <Ionicons name="grid" size={16} color="white" />
        <Text style={s.buttonText}>mesas</Text>
      </Pressable>
    </View>
  );
};

export default ButtonMesas;
