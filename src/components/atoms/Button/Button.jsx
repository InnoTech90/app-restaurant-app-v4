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
    // Estilo propio para el estado bloqueado; si se manda, no se aplica la
    // opacidad genérica (que con colores fuertes se veía "lavado").
    disabledStyle,
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
                disabled && !disabledStyle && s.disabled,
            ]}
        >
            <Pressable
                onPress={onPress}
                style={({ pressed }) => [
                    fondoSolido ? s.buttonGRADIENT : s.button,
                    style,
                    disabled && disabledStyle,
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
