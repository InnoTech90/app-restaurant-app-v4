import { Pressable, Text, View } from "react-native";
import { s } from "./style";

/**
 * Input de cantidad con botones + y -
 * @param {number}   value     - Valor actual (mínimo 1)
 * @param {Function} onChange  - Callback (nuevoValor) => void
 * @param {object}   style     - Override del contenedor
 */
const InputCantidad = ({ value = 1, onChange, style, min = 1, small = false, disabled = false }) => {
    const restar = () => {
        if (value > min) onChange(value - 1);
    };
    const sumar = () => {
        onChange(value + 1);
    };

    return (
        <View style={[s.contenedor, style]}>
            <Pressable
                onPress={restar}
                style={[s.boton, small && s.botonSmall, (disabled || value <= min) && s.botonDeshabilitado]}
                disabled={disabled || value <= min}
            >
                <Text style={[s.botonTexto, small && s.botonTextoSmall, (disabled || value <= min) && s.botonTextoDeshabilitado]}>−</Text>
            </Pressable>

            <View style={[s.valorContainer, small && s.valorContainerSmall]}>
                <Text style={s.valor}>{value}</Text>
            </View>

            <Pressable onPress={sumar} style={[s.boton, small && s.botonSmall, disabled && s.botonDeshabilitado]} disabled={disabled}>
                <Text style={[s.botonTexto, small && s.botonTextoSmall, disabled && s.botonTextoDeshabilitado]}>+</Text>
            </Pressable>
        </View>
    );
};

export default InputCantidad;
