import { Ionicons } from "@expo/vector-icons";
import { Text, TextInput, View } from "react-native";
import { gb } from "../../../screens/globalStyles";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";
import Button from "../../atoms/Button/Button";
import InputCantidad from "../../atoms/InputCantidad/InputCantidad";
import Card from "../Card/Card";
import { s } from "./styles";

const nombreComplemento = (comp) =>
  comp.complemento?.NOMBRE ??
  comp.COMP_NOMBRE ??
  comp.NOTA ??
  comp.NOMBRE ??
  "—";

const totalComplemento = (comp) =>
  Number(
    comp.TOTAL ??
      (comp.CANTIDAD ?? 0) *
        (comp.PRECIO_VENTA ??
          comp.COMP_PRECIO ??
          comp.complemento?.PRECIO ??
          0),
  );

const costoComplementosRenglon = (renglon) =>
  (renglon.complementos ?? []).reduce(
    (acc, c) => acc + totalComplemento(c),
    0,
  );

const descuentoRenglon = (renglon) => {
  const guardado = Number(renglon.DESCUENTO);
  if (Number.isFinite(guardado) && guardado > 0) return guardado;
  const subtotal =
    Number(renglon.SUBTOTAL) ||
    (renglon.CANTIDAD ?? 0) * (renglon.PRECIO_VENTA ?? 0);
  const costo = costoComplementosRenglon(renglon);
  return Math.max(0, subtotal + costo - (Number(renglon.TOTAL) || 0));
};

const FilaArticulo = ({
  renglon,
  onCambiarCantidad,
  onEliminar,
  isFirst,
  disabled,
}) => {
  const comps = renglon.complementos ?? [];
  const descuento = descuentoRenglon(renglon);
  const tieneAjustes =
    comps.length > 0 || descuento > 0 || !!renglon.NOTA?.trim();

  return (
    <View style={[s.articuloCard, !isFirst && s.articuloCardBorder]}>
      <View style={s.articuloRow}>
        <View style={s.articuloInfo}>
          <Text style={s.articuloNombre} numberOfLines={2}>
            {renglon.articulo?.NOMBRE ?? "—"}
          </Text>
          <View style={s.articuloMeta}>
            <Text style={s.articuloPrecio}>
              ${(renglon.PRECIO_VENTA ?? 0).toFixed(2)} c/u
            </Text>
          </View>
        </View>
        <InputCantidad
          value={renglon.CANTIDAD}
          onChange={(val) => onCambiarCantidad?.(renglon, val)}
          min={1}
          small
          disabled={disabled}
          style={s.inputCantidad}
        />
        <Text style={s.articuloTotal}>${(renglon.TOTAL ?? 0).toFixed(2)}</Text>
        <Button
          style={s.btnEliminar}
          styleContainer={s.btnEliminarContainer}
          onPress={() => onEliminar?.(renglon)}
          disabled={disabled}
        >
          <Ionicons
            name="trash-outline"
            size={normalize(14)}
            color={disabled ? gb.gray400 : gb.red600}
          />
        </Button>
      </View>

      {tieneAjustes && (
        <View style={s.ajustesLista}>
          {comps.length > 0 && (
            <View style={s.ajusteBloque}>
              <Text style={s.ajustesTitulo}>Complementos</Text>
              {comps.map((comp, i) => (
                <View
                  key={`${renglon.ID}-comp-${comp.ID ?? comp.ID_COMPLEMENTO ?? i}`}
                  style={s.ajusteRow}
                >
                  <Text style={s.ajusteBullet}>↳</Text>
                  <Text style={s.ajusteNombre} numberOfLines={1}>
                    {nombreComplemento(comp)}
                  </Text>
                  {totalComplemento(comp) > 0 && (
                    <Text style={s.ajustePrecioPos}>
                      +${totalComplemento(comp).toFixed(2)}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {descuento > 0 && (
            <View style={s.ajusteBloque}>
              <Text style={s.ajustesTitulo}>Descuento</Text>
              <View style={s.ajusteRow}>
                <Text style={s.ajusteBullet}>↳</Text>
                <Text style={s.ajusteNombre}>Descuento aplicado</Text>
                <Text style={s.ajustePrecioNeg}>
                  -${descuento.toFixed(2)}
                </Text>
              </View>
            </View>
          )}

          {!!renglon.NOTA?.trim() && (
            <View style={[s.ajusteBloque, s.notaPedido]}>
              <Ionicons
                name="document-text-outline"
                size={normalize(13)}
                color={gb.blue550}
              />
              <Text style={s.notaPedidoTexto} numberOfLines={2}>
                Nota: {renglon.NOTA}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const PagoArticulos = ({
  articulos,
  nota,
  onCambiarCantidad,
  onEliminarArticulo,
  onNotaChange,
  onNotaBlur,
  disabled = false,
}) => (
  <View style={s.wrapper}>
    <Card
      title="ARTÍCULOS"
      linealGradient={gb.gradient_blue}
      styleTitleHeader={{ color: gb.gray50 }}
      styleHeader={{ width: "100%" }}
      styleBody={{ width: "100%", paddingHorizontal: 0, paddingVertical: 0 }}
    >
      <View style={s.body}>
        <View style={s.listaHeader}>
          <Text style={[s.listaHeaderTexto, { flex: 1 }]}>Artículo</Text>
          <Text style={s.listaHeaderTexto}>Cant.</Text>
          <Text
            style={[
              s.listaHeaderTexto,
              { minWidth: normalize(52), textAlign: "right" },
            ]}
          >
            Total
          </Text>
          <View style={{ width: normalize(34) }} />
        </View>

        {articulos.length === 0 ? (
          <Text style={s.vacio}>Sin artículos en la comanda</Text>
        ) : (
          articulos.map((renglon, idx) => (
            <FilaArticulo
              key={renglon.ID ?? idx}
              renglon={renglon}
              onCambiarCantidad={onCambiarCantidad}
              onEliminar={onEliminarArticulo}
              isFirst={idx === 0}
              disabled={disabled}
            />
          ))
        )}

        <TextInput
          style={s.notasInput}
          multiline
          numberOfLines={2}
          placeholder="Nota de la mesa..."
          placeholderTextColor={gb.gray400}
          value={nota}
          onChangeText={onNotaChange}
          onBlur={onNotaBlur}
          editable={!disabled}
        />
      </View>
    </Card>
  </View>
);

export default PagoArticulos;
