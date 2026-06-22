import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { gb } from "../../../screens/globalStyles";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";
import Button from "../../atoms/Button/Button";
import Card from "../Card/Card";
import { s } from "./styles";

const PagoDesglose = ({
    subtotal,
    impuestosPct,
    montoImpuestos,
    descuento,
    descuentoEsPct,
    montoDescuento,
    propina,
    propinaEsPct,
    montoPropina,
    costoEnvio,
    costoEnvioEsPct,
    montoCostoEnvio,
    total,
    onDividirCuenta,
}) => (
    <View style={s.wrapper}>
        <Card
            title="DESGLOSE DE CUENTA"
            linealGradient={gb.gradient_blue}
            styleTitleHeader={{ color: gb.gray50 }}
            styleHeader={{ width: "100%" }}
            styleBody={{ width: "100%", paddingHorizontal: 0, paddingVertical: 0 }}
        >
            <View style={s.body}>
                <View style={s.row}>
                    <Text style={s.rowLabel}>Subtotal</Text>
                    <Text style={s.rowValor}>${subtotal.toFixed(2)}</Text>
                </View>
                {parseFloat(impuestosPct) > 0 && (
                    <View style={s.row}>
                        <Text style={s.rowLabel}>Impuestos ({impuestosPct}%)</Text>
                        <Text style={s.rowValor}>+${montoImpuestos.toFixed(2)}</Text>
                    </View>
                )}
                {parseFloat(descuento) > 0 && (
                    <View style={s.row}>
                        <Text style={s.rowLabel}>
                            Descuento ({descuentoEsPct ? `${descuento}%` : `$${descuento}`})
                        </Text>
                        <Text style={[s.rowValor, { color: gb.red600 }]}>
                            -${montoDescuento.toFixed(2)}
                        </Text>
                    </View>
                )}
                {parseFloat(propina) > 0 && (
                    <View style={s.row}>
                        <Text style={s.rowLabel}>
                            Propina ({propinaEsPct ? `${propina}%` : `$${propina}`})
                        </Text>
                        <Text style={[s.rowValor, { color: gb.green600 }]}>
                            +${montoPropina.toFixed(2)}
                        </Text>
                    </View>
                )}
                {parseFloat(costoEnvio) > 0 && (
                    <View style={s.row}>
                        <Text style={s.rowLabel}>
                            Costo de envío ({costoEnvioEsPct ? `${costoEnvio}%` : `$${costoEnvio}`})
                        </Text>
                        <Text style={s.rowValor}>+${montoCostoEnvio.toFixed(2)}</Text>
                    </View>
                )}
                <View style={s.divider} />
                <View style={s.row}>
                    <Text style={s.totalLabel}>TOTAL</Text>
                    <Text style={s.totalValor}>${total.toFixed(2)}</Text>
                </View>
                <Button
                    styleContainer={s.btnDividirContainer}
                    style={s.btnDividir}
                    onPress={onDividirCuenta}
                >
                    <Ionicons name="git-branch-outline" size={normalize(18)} color={gb.purple550} />
                    <Text style={s.btnDividirTexto}>Dividir cuenta</Text>
                </Button>
            </View>
        </Card>
    </View>
);

export default PagoDesglose;
