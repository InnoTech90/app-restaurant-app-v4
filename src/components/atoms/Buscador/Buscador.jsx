import { Ionicons } from "@expo/vector-icons";
import { TextInput, View } from "react-native";
import { s } from "./styles";


const Buscador = ({ placeholder, value, onChangeText, style }) => {
    return (
        <View style={[s.buscadorContainer, style]}>
            <Ionicons name="search-outline" size={20} color="#888" style={s.icon} />
            <TextInput
                style={s.input}
                placeholder={placeholder}
                value={value}
                onChangeText={onChangeText}
                placeholderTextColor="#888"
            />
        </View>
    );
}

export default Buscador;