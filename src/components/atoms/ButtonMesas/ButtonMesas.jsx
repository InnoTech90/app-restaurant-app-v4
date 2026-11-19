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
        <Ionicons name="grid-outline" size={16} color="#4F5FE0" />
        <Text style={s.buttonText}>Mesas</Text>
      </Pressable>
    </View>
  );
};

export default ButtonMesas;
