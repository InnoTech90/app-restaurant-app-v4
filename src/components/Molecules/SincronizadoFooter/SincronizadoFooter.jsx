import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { s } from "./styles";
import Button from "../../atoms/Button/Button";

/** Barra inferior blanca: Sincronizar (secundario) + Imprimir corte (principal). */
const SincronizadoFooter = ({ onSincronizar, onActualizar }) => {
    return (
        <View style={s.container}>
            <Button onPress={onSincronizar} style={s.secundario} styleContainer={s.item}>
                <Ionicons name="sync" size={20} color="#4F5FE0" />
                <Text style={s.secundarioTexto}>Sincronizar</Text>
            </Button>
            <Button onPress={onActualizar} style={s.principal} styleContainer={s.item}>
                <Ionicons name="print-outline" size={20} color="#FFFFFF" />
                <Text style={s.principalTexto}>Imprimir corte</Text>
            </Button>
        </View>
    );
};
export default SincronizadoFooter;
