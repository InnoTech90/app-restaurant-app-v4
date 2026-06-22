import { Pressable, Text, View } from "react-native";
import { s } from "./styles";

const CardArticulo = ({ articulo, onPress }) => {
    return (
        <Pressable onPress={() => onPress && onPress(articulo)} style={s.contenedor}>
            <View style={s.info}>
                <Text style={s.nombre}>{articulo.NOMBRE}</Text>
                {articulo.NOMBRE_CORTO ? (
                    <Text style={s.nombreCorto}>{articulo.NOMBRE_CORTO}</Text>
                ) : null}
            </View>
            <View style={s.precioContainer}>
                <Text style={s.precio}>${Number(articulo.PRECIO).toFixed(2)}</Text>
            </View>
        </Pressable>
    );
};

export default CardArticulo;
