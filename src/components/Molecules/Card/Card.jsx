import { Text, View } from "react-native";
import { s } from "./styles";

/**
 * Tarjeta con título. Estilo moderno: el título va como etiqueta pequeña
 * dentro de la tarjeta blanca (ya no hay franja con degradado). `linealGradient`
 * se acepta por compatibilidad con las pantallas existentes y se ignora; el
 * color del título que mandaban (blanco, para ir sobre el degradado) también.
 */
/** "MÉTODO DE PAGO" → "Método de pago" (solo si viene todo en mayúsculas). */
const tituloOracion = (t) => {
    const txt = String(t ?? "");
    if (txt !== txt.toUpperCase()) return txt;
    const min = txt.toLowerCase();
    return min.charAt(0).toUpperCase() + min.slice(1);
};

// eslint-disable-next-line no-unused-vars
const Card = ({ title, children, styleBody, styleHeader, linealGradient, styleTitleHeader }) => {
    const { color: _ignorado, ...tituloSinColor } = styleTitleHeader ?? {};
    return (
        <View style={[s.container, styleBody, s.containerModerno]}>
            {title ? (
                <View style={[s.header, styleHeader, s.headerModerno]}>
                    <Text style={[s.title, tituloSinColor, s.titleModerno]}>
                        {tituloOracion(title)}
                    </Text>
                </View>
            ) : null}
            {children}
        </View>
    );
};
export default Card;
