import {View,Text} from "react-native";
import { s } from "./styles";
import Button from "../../atoms/Button/Button";
import { Ionicons } from "@expo/vector-icons";
import { gb } from "../../../screens/globalStyles";
import { LinearGradient } from "expo-linear-gradient";

const SincronizadoFooter = ({ onSincronizar,onActualizar }) => {
    return (
        <LinearGradient style={s.container} colors={gb.gradient_blue}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
        >
            <Button onPress={onSincronizar} style={s.button} >
                <Ionicons name="sync" size={24} color={gb.gray50} />
                <Text style={s.buttonText}>Sincronizar</Text>
            </Button>
            <Button onPress={onActualizar} style={s.button}>
                <Ionicons name="print-outline" size={24} color={gb.gray50} />
                <Text style={s.buttonText}>Imprimir Corte</Text>
            </Button>
        </LinearGradient>
    )
}
export default SincronizadoFooter;