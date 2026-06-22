import { Text, TextInput, View } from "react-native";
import { gb } from "../../../screens/globalStyles";
import Card from "../Card/Card";
import { s } from "./styles";

const PagoMontoRecibido = ({ total, montoRecibido, cambio, onChangeMonto, onFocus, disabled = false }) => (
    <View style={s.wrapper}>
        <Card
            title="MONTO RECIBIDO"
            linealGradient={gb.gradient_blue}
            styleTitleHeader={{ color: gb.gray50 }}
            styleHeader={{ width: "100%" }}
            styleBody={{ width: "100%", paddingHorizontal: 0, paddingVertical: 0 }}
        >
            <View style={s.body}>
                <View style={s.montoWrapper}>
                    <Text style={s.simbolo}>$</Text>
                    <TextInput
                        style={s.input}
                        value={montoRecibido}
                        onChangeText={onChangeMonto}
                        onFocus={onFocus}
                        keyboardType="decimal-pad"
                        placeholder={total.toFixed(2)}
                        placeholderTextColor={gb.gray300}
                        selectTextOnFocus
                        editable={!disabled}
                    />
                </View>
                <View style={s.cambioRow}>
                    <Text style={s.cambioLabel}>Cambio</Text>
                    <Text
                        style={[
                            s.cambioValor,
                            (parseFloat(montoRecibido) || 0) < total && s.cambioValorNegativo,
                        ]}
                    >
                        ${cambio.toFixed(2)}
                    </Text>
                </View>
            </View>
        </Card>
    </View>
);

export default PagoMontoRecibido;
