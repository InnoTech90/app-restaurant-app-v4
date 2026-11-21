import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { clearAuthHeaderTitulo } from "../../../utils/authHeaderTitle";
import { s } from "./styles";

// variante "sobreColor": para fondos con degradado de marca (encabezado).
const ButtonMesas = ({ style, variante }) => {
  const sobreColor = variante === "sobreColor";
  const router = useRouter();
  return (
    <View style={[s.buttonContainer, sobreColor && s.buttonContainerSobreColor]}>
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
        <Ionicons name="grid-outline" size={16} color={sobreColor ? "#FFFFFF" : "#4F5FE0"} />
        <Text style={[s.buttonText, sobreColor && s.buttonTextSobreColor]}>Mesas</Text>
      </Pressable>
    </View>
  );
};

export default ButtonMesas;
