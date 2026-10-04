import { Pressable, Text, View } from "react-native";
import { s } from "./style";

/**
 * Input de cantidad con botones + y -
 * @param {number}   value     - Valor actual (mínimo 1)
 * @param {Function} onChange  - Callback (nuevoValor) => void
 * @param {object}   style     - Override del contenedor
 */
const InputCantidad = ({ value = 1, onChange, style, min = 1, small = false, disabled = false }) => {
    const actual = Number(value) || 0;
    const restar = () => {
        if (actual > min) onChange(actual - 1);
    };
    const sumar = () => {
        onChange(actual + 1);
    };

    return (
        <View style={[s.contenedor, style]}>
            <Pressable
                onPress={restar}
                style={[s.boton, small && s.botonSmall, (disabled || actual <= min) && s.botonDeshabilitado]}
                disabled={disabled || actual <= min}
            >
                <Text style={[s.botonTexto, small && s.botonTextoSmall, (disabled || actual <= min) && s.botonTextoDeshabilitado]}>−</Text>
            </Pressable>

            <View style={[s.valorContainer, small && s.valorContainerSmall]}>
                <Text style={s.valor}>{actual}</Text>
            </View>

            <Pressable onPress={sumar} style={[s.boton, small && s.botonSmall, disabled && s.botonDeshabilitado]} disabled={disabled}>
                <Text style={[s.botonTexto, small && s.botonTextoSmall, disabled && s.botonTextoDeshabilitado]}>+</Text>
            </Pressable>
        </View>
    );
};

export default InputCantidad;
