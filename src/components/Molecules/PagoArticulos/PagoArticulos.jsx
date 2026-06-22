import { Ionicons } from "@expo/vector-icons";
import { Text, TextInput, View } from "react-native";
import { gb } from "../../../screens/globalStyles";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";
import Button from "../../atoms/Button/Button";
import InputCantidad from "../../atoms/InputCantidad/InputCantidad";
import Card from "../Card/Card";
import { s } from "./styles";

const FilaArticulo = ({ renglon, onCambiarCantidad, onEliminar, isFirst, disabled }) => (
    <View style={[s.articuloRow, isFirst && { borderTopWidth: 0 }]}>
        <View style={s.articuloInfo}>
            <Text style={s.articuloNombre} numberOfLines={1}>
                {renglon.articulo?.NOMBRE ?? "—"}
            </Text>
            <View style={s.articuloMeta}>
                <Text style={s.articuloPrecio}>
                    ${(renglon.PRECIO_VENTA ?? 0).toFixed(2)} c/u
                </Text>
                {renglon.complementos?.length > 0 && (
                    <Text style={s.articuloComps}>
                        · +{renglon.complementos.length} comp.
                    </Text>
                )}
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
            <Ionicons name="trash-outline" size={normalize(14)} color={disabled ? gb.gray400 : gb.red600} />
        </Button>
    </View>
);

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
