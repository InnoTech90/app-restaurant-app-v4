import { Text, View } from "react-native";
import { s } from "./styles";

const formatMonto = (n) =>
  Number(n || 0).toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const CardProductoVenta = ({
  producto,
  cantidad,
  precioUnitario,
  complementos,
  descuento = 0,
  total,
}) => {
  const calcularComplementos = () => {
    if (!complementos || complementos.length === 0) return [];
    return Object.values(
      complementos.reduce((acc, item) => {
        if (!acc[item.id]) {
          acc[item.id] = { ...item, cantidad: 1 };
        } else {
          acc[item.id].cantidad += 1;
          acc[item.id].precio += item.precio;
        }
        return acc;
      }, {}),
    );
  };

  const totalComplementos = complementos
    ? complementos.reduce((sum, item) => sum + (Number(item.precio) || 0), 0)
    : 0;
  const descuentoNum = Number(descuento) || 0;
  const totalCalculado =
    (Number(precioUnitario) || 0) * (Number(cantidad) || 0) +
    totalComplementos -
    descuentoNum;
  const totalMostrar =
    total != null && Number.isFinite(Number(total))
      ? Number(total)
      : Math.max(0, totalCalculado);

  return (
    <View style={s.constenerdorProducto}>
      <View style={s.row}>
        <Text style={s.tituloProducto}>{producto}</Text>
        <Text style={s.precioProducto}>${formatMonto(totalMostrar)}</Text>
      </View>
      <View style={s.row}>
        <Text style={s.textoProducto}>Cantidad: {cantidad}</Text>
        <Text style={s.textoProducto}>
          Precio unitario: ${formatMonto(precioUnitario)}
        </Text>
      </View>
      {descuentoNum > 0 ? (
        <View style={s.descuentoRow}>
          <Text style={s.descuentoLabel}>Descuento</Text>
          <Text style={s.descuentoValor}>-${formatMonto(descuentoNum)}</Text>
        </View>
      ) : null}
      {complementos && complementos.length > 0 ? (
        <View style={s.contenedorComplementos}>
          <View style={s.row}>
            <Text style={s.tituloProducto}>Complementos:</Text>
          </View>
          {calcularComplementos().map((complemento) => (
            <View key={complemento.id} style={s.row}>
              <Text style={s.textoProducto}>
                {complemento.nombre} x{complemento.cantidad}
              </Text>
              <Text style={s.precioComplemento}>
                + ${formatMonto(complemento.precio)}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
};

export default CardProductoVenta;
