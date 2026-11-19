import { StyleSheet, View } from "react-native";
import { color } from "../../../utils/theme";

/**
 * Sub-encabezado de pantalla (fila con regresar, título y acciones) en el
 * estilo moderno: fondo blanco que continúa el encabezado global y una línea
 * inferior. Reemplaza al antiguo bloque con degradado; acepta los mismos
 * `style` y `children`.
 */
const HeaderBar = ({ style, children }) => (
  <View style={[style, s.bar]}>{children}</View>
);

const s = StyleSheet.create({
  bar: {
    backgroundColor: color.surface,
    borderBottomWidth: 1,
    borderBottomColor: color.border,
  },
});

export default HeaderBar;
