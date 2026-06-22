import { Text, View } from "react-native";
import { s } from "./styles";

const CardProductoVenta = ({ producto, cantidad, precioUnitario, complementos }) => {
    const calcularComplementos = () => {
        if (!complementos || complementos.length === 0) return 0;
        const complementosAgrupados = Object.values(
            complementos.reduce((acc, item) => {

                if (!acc[item.id]) {
                    acc[item.id] = { ...item, cantidad: 1 };
                } else {
                    acc[item.id].cantidad += 1;
                    acc[item.id].precio += item.precio;
                }

                return acc;

            }, {})
        );
        return complementosAgrupados
    }
    const calcularTotal = () => {
        const totalComplementos = complementos ? complementos.reduce((sum, item) => sum + item.precio, 0) : 0;
        return (precioUnitario * cantidad) + totalComplementos;
    }

    return (
        <View style={s.constenerdorProducto}>
            <View style={s.row}>
                <Text style={s.tituloProducto}>{producto}</Text>
                <Text style={s.precioProducto}>${calcularTotal()}</Text>
            </View>
            <View style={s.row}>
                <Text style={s.textoProducto}>Cantidad: {cantidad}</Text>
                <Text style={s.textoProducto}>Precio unitario: ${precioUnitario}</Text>

            </View>
            {complementos && complementos.length > 0 ?
                <View style={s.contenedorComplementos}>
                    <View style={s.row}>
                        <Text style={s.tituloProducto}>Complementos:</Text>
                    </View>
                    {calcularComplementos().map((complemento) => (
                        <View key={complemento.id} style={s.row}>
                            <Text style={s.textoProducto}>{complemento.nombre} x{complemento.cantidad}</Text>
                            <Text style={s.precioComplemento}>+ ${complemento.precio}</Text>
                        </View>
                    ))}
                </View>
                : null
            }
        </View>
    )
}
export default CardProductoVenta;