import { Image, Pressable, View } from "react-native";
import { s } from "./style";

/**
 * Botón base. Estilo moderno: color sólido. Si una pantalla manda `gradient`
 * (p. ej. el degradado de marca), se usa su primer color como fondo sólido;
 * así todos los botones principales quedan iguales sin tocar cada pantalla.
 */
const Button = ({
    children,
    onPress,
    style,
    icon,
    gradient = false,
    styleContainer,
    disabled = false,
}) => {
    const fondoSolido =
        Array.isArray(gradient) && gradient.length > 0
            ? { backgroundColor: gradient[0] }
            : null;

    return (
        <View
            style={[
                s.buttonContainer,
                fondoSolido,
                styleContainer,
                disabled && s.disabled,
            ]}
        >
            <Pressable
                onPress={onPress}
                style={({ pressed }) => [
                    fondoSolido ? s.buttonGRADIENT : s.button,
                    style,
                    pressed && !disabled && s.pressed,
                ]}
                disabled={disabled}
            >
                {icon && (
                    <View style={s.iconContainer}>
                        <Image source={icon} />
                    </View>
                )}
                {children}
            </Pressable>
        </View>
    );
};

export default Button;
