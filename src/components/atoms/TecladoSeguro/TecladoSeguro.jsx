import { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  View,
} from "react-native";

const MARGEN = 56; // espacio entre el campo y el teclado (incluye su barra de herramientas)

/**
 * Contenedor raíz que evita que el teclado tape lo que se escribe.
 *
 * - iOS: KeyboardAvoidingView normal.
 * - Android 15+ (borde a borde) ya no encoge ni recorre la ventana con el
 *   teclado. Aquí se imita el "adjustPan" de Android: si el campo enfocado
 *   quedaría debajo del teclado, toda la pantalla sube lo justo para dejarlo
 *   visible, y regresa al cerrarse el teclado. Mientras el teclado está
 *   abierto se revisa cada 300 ms por si el usuario pasa a otro campo.
 *   Los modales son ventanas aparte y Android ya los ajusta solo.
 */
const TecladoSeguro = ({ style, children }) => {
  const [desplazamiento, setDesplazamiento] = useState(0);
  const actual = useRef(0);
  const tecladoArriba = useRef(null); // coordenada Y del borde superior del teclado

  useEffect(() => {
    if (Platform.OS !== "android") return undefined;

    let intervalo = null;

    const ajustar = () => {
      const top = tecladoArriba.current;
      const campo = TextInput.State.currentlyFocusedInput?.();
      if (top == null || !campo?.measureInWindow) return;
      campo.measureInWindow((x, y, w, h) => {
        // y ya incluye el desplazamiento aplicado: se suma para obtener la
        // posición original del campo.
        const abajoOriginal = y + h + actual.current;
        const necesario = Math.max(0, abajoOriginal + MARGEN - top);
        if (Math.abs(necesario - actual.current) > 2) {
          actual.current = necesario;
          setDesplazamiento(necesario);
        }
      });
    };

    const mostrar = Keyboard.addListener("keyboardDidShow", (e) => {
      tecladoArriba.current = e?.endCoordinates?.screenY ?? null;
      ajustar();
      clearInterval(intervalo);
      intervalo = setInterval(ajustar, 300);
    });
    const ocultar = Keyboard.addListener("keyboardDidHide", () => {
      clearInterval(intervalo);
      tecladoArriba.current = null;
      actual.current = 0;
      setDesplazamiento(0);
    });

    return () => {
      clearInterval(intervalo);
      mostrar.remove();
      ocultar.remove();
    };
  }, []);

  if (Platform.OS === "ios") {
    return (
      <KeyboardAvoidingView style={style} behavior="padding">
        {children}
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={[style, { overflow: "hidden" }]}>
      <View style={{ flex: 1, marginTop: -desplazamiento, marginBottom: desplazamiento }}>
        {children}
      </View>
    </View>
  );
};

export default TecladoSeguro;
