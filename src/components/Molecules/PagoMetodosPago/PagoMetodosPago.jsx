import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { gb } from "../../../screens/globalStyles";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";
import Button from "../../atoms/Button/Button";
import Card from "../Card/Card";
import { s } from "./styles";

// El servidor puede mandar en ICONO un nombre que no existe en Ionicons
// (se mostraba "?"): solo se usa si existe; si no, se elige por el nombre.
const ICONO_POR_PALABRA = [
    ["efectivo", "cash-outline"],
    ["debito", "card-outline"],
    ["débito", "card-outline"],
    ["credito", "card-outline"],
    ["crédito", "card-outline"],
    ["tarjeta", "card-outline"],
    ["transfer", "swap-horizontal-outline"],
    ["spei", "swap-horizontal-outline"],
    ["mercado", "phone-portrait-outline"],
    ["paypal", "logo-paypal"],
    ["clip", "tablet-portrait-outline"],
    ["terminal", "tablet-portrait-outline"],
    ["vale", "ticket-outline"],
    ["cheque", "document-text-outline"],
    ["pendiente", "time-outline"],
];

const iconoMetodo = (icono, nombre = "") => {
    if (icono && Ionicons.glyphMap?.[icono]) return icono;
    const n = String(nombre).toLowerCase();
    return ICONO_POR_PALABRA.find(([p]) => n.includes(p))?.[1] ?? "wallet-outline";
};

const PagoMetodosPago = ({ formatosPago, metodoPagoId, onSeleccionar, disabled }) => (
   
    
    <View style={s.wrapper}>
        <Card
            title="MÉTODO DE PAGO"
            linealGradient={gb.gradient_blue}
            styleTitleHeader={{ color: "#FFFFFF" }}
            styleHeader={{ width: "100%" }}
            styleBody={{ width: "100%", paddingHorizontal: 0, paddingVertical: 0 }}
        >
            <View style={[s.body, disabled && { opacity: 0.5 }]}>
                <View style={s.grid}>
                    {formatosPago.map((formato) => {
                        const activo =
                            metodoPagoId != null &&
                            Number(metodoPagoId) === Number(formato.ID);
                        return (
                            <Button
                                key={formato.ID}
                                styleContainer={s.btnContainer}
                                style={[s.btn, activo && s.btnActivo]}
                                onPress={disabled ? undefined : () => onSeleccionar(activo ? null : formato.ID)}
                                disabled={disabled}
                            >
                                <Ionicons
                                     name={iconoMetodo(formato.ICONO, formato.NOMBRE)}
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
