import { LinearGradient } from "expo-linear-gradient";
import { Image, Pressable, Text, View } from "react-native";
import { s } from "./style";

const Button = ({ children, onPress, style,  icon, gradient=false,styleContainer,disabled=false }) => {
    return (
        <>
            {
                gradient ?
                    <LinearGradient 
                    colors={gradient} 
                    style={[s.buttonContainer, styleContainer]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    >
                        <Pressable onPress={onPress} style={[s.buttonGRADIENT, style]} disabled={disabled}>
                            {icon && <View style={s.iconContainer}><Image source={icon} /></View>}
                            {children}
                        </Pressable>
                    </LinearGradient>
                    :
                    <View style={[s.buttonContainer, styleContainer]}>
                        <Pressable onPress={onPress} style={[s.button, style]} disabled={disabled}>
                            {icon && <View style={s.iconContainer}><Image source={icon} /></View>}
                            {children}
                        </Pressable>
                    </View>
            }
        </>
    );
}
export default Button;