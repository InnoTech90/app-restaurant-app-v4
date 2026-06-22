import { Pressable, Text, TextInput, View } from "react-native";
import { gb } from "../../../screens/globalStyles";
import { s } from "./styles";

/**
 * Input numérico con toggle entre porcentaje (%) y monto ($).
 * @param {string}   value       - Valor actual como string
 * @param {boolean}  esPct       - true = porcentaje, false = monto fijo
 * @param {Function} onChangeValue - (string) => void
 * @param {Function} onToggle    - () => void, cambia entre % y $
 */
const InputToggle = ({ value, esPct, onChangeValue, onToggle }) => (
    <View style={s.container}>
        <TextInput
            style={s.input}
            value={value}
            onChangeText={onChangeValue}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={gb.gray300}
        />
        <Pressable style={[s.badge, esPct && s.badgeActive]} onPress={onToggle}>
            <Text style={[s.badgeText, esPct && s.badgeTextActive]}>{esPct ? "%" : "$"}</Text>
        </Pressable>
    </View>
);

export default InputToggle;
