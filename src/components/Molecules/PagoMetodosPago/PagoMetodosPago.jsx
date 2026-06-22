import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { gb } from "../../../screens/globalStyles";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";
import Button from "../../atoms/Button/Button";
import Card from "../Card/Card";
import { s } from "./styles";

const ICONO_METODO = {
    efectivo: "cash-outline",
    tarjeta: "card-outline",
    transferencia: "swap-horizontal-outline",
    "mercado pago": "phone-portrait-outline",
    clip: "tablet-portrait-outline",
    izettle: "tablet-landscape-outline",
    pendiente: "time-outline",
};

const iconoMetodo = (nombre = "") =>
    ICONO_METODO[nombre.toLowerCase()] ?? "wallet-outline";
    
const PagoMetodosPago = ({ formatosPago, metodoPagoId, onSeleccionar, disabled }) => (
   
    
    <View style={s.wrapper}>
        <Card
            title="MÉTODO DE PAGO"
            linealGradient={gb.gradient_blue}
            styleTitleHeader={{ color: gb.gray50 }}
            styleHeader={{ width: "100%" }}
            styleBody={{ width: "100%", paddingHorizontal: 0, paddingVertical: 0 }}
        >
            <View style={[s.body, disabled && { opacity: 0.5 }]}>
                <View style={s.grid}>
                    {formatosPago.map((formato) => {
                        const activo = metodoPagoId === formato.ID;
                        return (
                            <Button
                                key={formato.ID}
                                styleContainer={s.btnContainer}
                                style={[s.btn, activo && s.btnActivo]}
                                onPress={disabled ? undefined : () => onSeleccionar(activo ? null : formato.ID)}
                                disabled={disabled}
                            >
                                <Ionicons
                                     name={formato.ICONO || iconoMetodo(formato.NOMBRE)}
                                    size={normalize(22)}
                                    color={activo ? gb.blue550 : gb.gray500}
                                />
                                <Text
                                    style={[s.btnTexto, activo && s.btnTextoActivo]}
                                    numberOfLines={2}
                                >
                                    {formato.NOMBRE}
                                </Text>
                            </Button>
                        );
                    })}
                </View>
            </View>
        </Card>
    </View>
);

export default PagoMetodosPago;
