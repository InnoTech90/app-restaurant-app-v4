import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { s } from "./styles";

/** Renglón de artículo: nombre, descripción corta, precio y botón "+". */
const CardArticulo = ({ articulo, onPress }) => {
    return (
        <Pressable
            onPress={() => onPress && onPress(articulo)}
            style={({ pressed }) => [s.contenedor, pressed && s.presionado]}
        >
            <View style={s.info}>
                <Text style={s.nombre} numberOfLines={2}>{articulo.NOMBRE}</Text>
                {articulo.NOMBRE_CORTO ? (
                    <Text style={s.nombreCorto} numberOfLines={1}>{articulo.NOMBRE_CORTO}</Text>
                ) : null}
            </View>
            <Text style={s.precio}>${Number(articulo.PRECIO).toFixed(2)}</Text>
            <View style={s.agregar}>
                <Ionicons name="add" size={20} color="#FFFFFF" />
            </View>
        </Pressable>
    );
};

export default memo(CardArticulo);
