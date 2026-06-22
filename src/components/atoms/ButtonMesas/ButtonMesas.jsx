import { View, Pressable, Text } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';
import { s } from "./styles";
import { useRouter } from "expo-router";

const ButtonMesas = ({ style }) => {
    const router = useRouter();
    return (
        <View style={s.buttonContainer}>
            <Pressable onPress={() => { router.replace('/Inicio') }} style={[s.button, style]}>
                    <Ionicons name="grid" size={16} color="white" />
                <Text style={s.buttonText}>
                    mesas
                </Text>
            </Pressable>
        </View>
    )
}
export default ButtonMesas;