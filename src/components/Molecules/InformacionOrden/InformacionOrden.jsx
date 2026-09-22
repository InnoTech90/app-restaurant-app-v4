import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Text, View } from "react-native";
import { gb } from "../../../screens/globalStyles";
import { s } from "./styles";

const GRADIENTES = {
  ok: [gb.green500, gb.green600 ?? "#388E3C"],
  cancelado: [gb.red500, gb.red600],
  pendiente: ["#FF9800", "#F57C00"],
};

const InformacionOrden = ({
  montoTotal = "00.00",
  productosLength = 0,
  variante = "ok",
}) => {
  const colors = GRADIENTES[variante] ?? GRADIENTES.ok;

  return (
    <View style={s.infoCard}>
      <LinearGradient colors={colors} style={s.infoHeader}>
        <Ionicons name="receipt" size={24} color="white" />
        <View style={s.infoHeaderText}>
          <Text style={s.infoTitle}>Información de la Orden</Text>
          <Text style={s.infoSubtitle}>{productosLength || 0} productos</Text>
        </View>
        <Text style={s.totalAmount}>${montoTotal}</Text>
      </LinearGradient>
    </View>
  );
};

export default InformacionOrden;
