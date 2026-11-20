import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Text, View } from "react-native";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";
import { gradient } from "../../../utils/theme";
import { s } from "./styles";

// Ícono del encabezado según el título (se puede forzar con la prop `icon`).
const ICONOS = {
    "información": "information-circle-outline",
    "informacion": "information-circle-outline",
    "artículos": "fast-food-outline",
    "método de pago": "card-outline",
    "adicional de pago": "add-circle-outline",
    "desglose de cuenta": "receipt-outline",
    "monto recibido": "cash-outline",
    "nota de la comanda": "create-outline",
    "informacion del negocio": "business-outline",
    "información del negocio": "business-outline",
};
const iconoPara = (t) => {
    const k = String(t ?? "").trim().toLowerCase();
    if (ICONOS[k]) return ICONOS[k];
    if (k.includes("sucursal")) return "storefront-outline";
    if (k.includes("redes") || k.includes("contacto")) return "chatbubbles-outline";
    if (k.includes("pago") || k.includes("factur")) return "wallet-outline";
    return "restaurant-outline";
};

/**
 * Tarjeta con título. El encabezado lleva el degradado de marca con título
 * e ícono en blanco (a pedido del usuario, como el diseño anterior). Las
 * props `linealGradient` y el color del título se ignoran: siempre es el
 * degradado de marca.
 */
/** "MÉTODO DE PAGO" → "Método de pago" (solo si viene todo en mayúsculas). */
const tituloOracion = (t) => {
    const txt = String(t ?? "");
    if (txt !== txt.toUpperCase()) return txt;
    const min = txt.toLowerCase();
    return min.charAt(0).toUpperCase() + min.slice(1);
};

// eslint-disable-next-line no-unused-vars
const Card = ({ title, children, styleBody, styleHeader, linealGradient, styleTitleHeader, icon }) => {
    const { color: _ignorado, ...tituloSinColor } = styleTitleHeader ?? {};
    return (
        <View style={[s.container, styleBody, s.containerModerno]}>
            {title ? (
                <LinearGradient
                    colors={gradient.brand}
                    start={gradient.brandStart}
                    end={gradient.brandEnd}
                    style={[s.header, styleHeader, s.headerModerno]}
                >
                    <View style={s.icono}>
                        <Ionicons
                            name={icon ?? iconoPara(title)}
                            size={normalize(16)}
                            color="#FFFFFF"
                        />
                    </View>
                    <Text style={[s.title, tituloSinColor, s.titleModerno]} numberOfLines={1}>
                        {tituloOracion(title)}
                    </Text>
                </LinearGradient>
            ) : null}
            {children}
        </View>
    );
};
export default Card;
