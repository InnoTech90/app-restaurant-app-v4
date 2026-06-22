import { LinearGradient } from "expo-linear-gradient";
import { usePathname } from "expo-router";
import { Text, View } from "react-native";
import DrawerButton from "../../../components/atoms/DraweButton/DraweButton";
import { gb } from "../../../screens/globalStyles";
import ButtonMesas from "../../atoms/ButtonMesas/ButtonMesas";
import { s } from "./styles";


const AuthHeader = ({ navigation, route, options }) => {
    const pathname = usePathname()
    console.log("pathname", pathname);
    
    return (
        <LinearGradient
            colors={gb.gradient_blue}
            style={s.header}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
        >
            <View style={s.containerHeader}>
                {/* Botón abrir drawer */}
                <DrawerButton onPress={() => navigation.openDrawer()} />

                {/* Título */}
                <Text style={s.title}>
                    {options?.title ? options.title.toUpperCase() : pathname.replace('/', '').toUpperCase() || "INICIO"}
                </Text>

                {/* mesas */}
                <ButtonMesas />
            </View>
        </LinearGradient>
    );
}

export default AuthHeader;