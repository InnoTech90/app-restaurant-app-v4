import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { gb } from "../../../screens/globalStyles";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";
import { s } from "./styles";

/**
 * Fila de configuración reutilizable.
 * @param {string}    icon      - Nombre del icono Ionicons
 * @param {string}    iconColor - Color del icono (default blue550)
 * @param {string}    titulo    - Título principal de la fila
 * @param {string}    subtitulo - Descripción secundaria
 * @param {ReactNode} children  - Control a la derecha (Switch, Select, TextInput...)
 * @param {boolean}   border    - Si muestra borde inferior (default true)
 */
const ConfigItem = ({ icon, iconColor = gb.blue550, titulo, subtitulo, children, border = true }) => (
    <View style={[s.row, border && s.rowBorder]}>
        <View style={s.iconWrap}>
            <Ionicons name={icon} size={normalize(20)} color={iconColor} />
        </View>
        <View style={s.textos}>
            <Text style={s.titulo}>{titulo}</Text>
            {!!subtitulo && <Text style={s.subtitulo}>{subtitulo}</Text>}
        </View>
        <View style={s.control}>{children}</View>
    </View>
);

export default ConfigItem;
