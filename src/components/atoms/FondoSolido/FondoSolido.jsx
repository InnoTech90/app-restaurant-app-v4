import { View } from "react-native";

/**
 * Reemplazo plano de `LinearGradient` (estilo moderno sin degradados).
 * Misma interfaz que `expo-linear-gradient` para poder sustituir el import:
 * pinta el primer color de `colors` como fondo sólido e ignora start/end.
 */
export const LinearGradient = ({ colors, style, children, ...rest }) => {
  const { start, end, locations, ...props } = rest;
  const fondo = Array.isArray(colors) && colors.length ? colors[0] : undefined;
  return (
    <View style={[{ backgroundColor: fondo }, style]} {...props}>
      {children}
    </View>
  );
};

export default LinearGradient;
