import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, TextInput, View } from "react-native";
import { gb } from "../../../screens/globalStyles";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";
import Card from "../Card/Card";
import { s } from "./styles";

const TogglePctMonto = ({ esPct, onToggle }) => (
    <View style={[s.inputWrapper, { overflow: "hidden" }]}>
        <Pressable
            style={[s.toggleBtn, esPct && s.toggleBtnActivo]}
            onPress={() => onToggle(true)}
        >
            <Text style={[s.toggleBtnTexto, esPct && s.toggleBtnTextoActivo]}>%</Text>
        </Pressable>
        <Pressable
            style={[s.toggleBtn, !esPct && s.toggleBtnActivo]}
            onPress={() => onToggle(false)}
        >
            <Text style={[s.toggleBtnTexto, !esPct && s.toggleBtnTextoActivo]}>$</Text>
        </Pressable>
    </View>
);

const FilaAdicional = ({ label, valor, onCambiar, esPct, onTogglePct, sufijo }) => (
    <View style={s.row}>
        <Text style={s.label}>{label}</Text>
        <View style={{ flexDirection: "row", gap: normalize(6) }}>
            {onTogglePct && (
                <TogglePctMonto esPct={esPct} onToggle={onTogglePct} />
            )}
            <View style={s.inputWrapper}>
                <TextInput
                    style={s.input}
                    value={valor}
                    onChangeText={onCambiar}
                    keyboardType="decimal-pad"
                    placeholder="0"
                    placeholderTextColor={gb.gray300}
                />
                <Text style={s.inputSufijo}>{sufijo}</Text>
            </View>
        </View>
    </View>
);

const PagoAdicionales = ({
    impuestosPct,
    onImpuestosChange,
    desglosarImpuestos,
    onToggleDesglosar,
    propina,
    propinaEsPct,
    onPropinaChange,
    onPropinaToggle,
    descuento,
    descuentoEsPct,
    onDescuentoChange,
    onDescuentoToggle,
    costoEnvio,
    costoEnvioEsPct,
    onCostoEnvioChange,
    onCostoEnvioToggle,
    disabled,
}) => (
    <View style={s.wrapper}>
        <Card
            title="ADICIONAL DE PAGO"
            linealGradient={gb.gradient_blue}
            styleTitleHeader={{ color: gb.gray50 }}
            styleHeader={{ width: "100%" }}
            styleBody={{ width: "100%", paddingHorizontal: 0, paddingVertical: 0 }}
        >
            <View style={[s.body, disabled && { opacity: 0.5 }]}>
                <FilaAdicional
                    label="Impuestos"
                    valor={impuestosPct}
                    onCambiar={disabled ? undefined : onImpuestosChange}
                    sufijo="%"
                />
                <Pressable style={s.checkboxRow} onPress={disabled ? undefined : onToggleDesglosar}>
                    <View style={[s.checkbox, desglosarImpuestos && s.checkboxActivo]}>
                        {desglosarImpuestos && (
                            <Ionicons name="checkmark" size={normalize(12)} color={gb.gray50} />
                        )}
                    </View>
                    <Text style={s.checkboxLabel}>Desglosar impuestos en ticket</Text>
                </Pressable>
                <FilaAdicional
                    label="Propina"
                    valor={propina}
                    onCambiar={disabled ? undefined : onPropinaChange}
                    esPct={propinaEsPct}
                    onTogglePct={disabled ? undefined : onPropinaToggle}
                    sufijo={propinaEsPct ? "%" : "$"}
                />
                <FilaAdicional
                    label="Descuento"
                    valor={descuento}
                    onCambiar={disabled ? undefined : onDescuentoChange}
                    esPct={descuentoEsPct}
                    onTogglePct={disabled ? undefined : onDescuentoToggle}
                    sufijo={descuentoEsPct ? "%" : "$"}
                />
                <FilaAdicional
                    label="Costo de envío"
                    valor={costoEnvio}
                    onCambiar={disabled ? undefined : onCostoEnvioChange}
                    esPct={costoEnvioEsPct}
                    onTogglePct={disabled ? undefined : onCostoEnvioToggle}
                    sufijo={costoEnvioEsPct ? "%" : "$"}
                />
            </View>
        </Card>
    </View>
);

export default PagoAdicionales;
