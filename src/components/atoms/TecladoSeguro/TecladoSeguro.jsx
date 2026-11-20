import { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MARGEN = 56; // espacio entre el campo y el teclado (incluye su barra de herramientas)

/**
 * Contenedor raíz que evita que el teclado tape lo que se escribe.
 *
 * - iOS: KeyboardAvoidingView normal.
 * - Android 15+ (borde a borde) ya no encoge la ventana con el teclado. Aquí:
 *   1. Se imita "adjustResize": se agrega abajo un relleno del alto del
 *      teclado, así las listas (ScrollView) se encogen, se pueden recorrer
 *      completas y Android mantiene visible el campo enfocado; los pies fijos
 *      (botones, nota de comanda) suben sobre el teclado.
 *   2. Solo si aun así el campo enfocado quedó tapado, la pantalla sube lo
 *      justo. Se calcula al abrir el teclado y al cambiar de campo, NO
 *      mientras el usuario hace scroll (antes se recalculaba cada 300 ms
 *      siguiendo al campo y, al subir con scroll, la pantalla quedaba en
 *      blanco).
 */
const TecladoSeguro = ({ style, children }) => {
  const insets = useSafeAreaInsets();
  const [relleno, setRelleno] = useState(0);
  const [desplazamiento, setDesplazamiento] = useState(0);
  const actual = useRef(0);
  const tecladoArriba = useRef(null);
  const campoMedido = useRef(null);

  useEffect(() => {
    if (Platform.OS !== "android") return undefined;

    let intervalo = null;
    let espera = null;

    const ajustar = () => {
      const top = tecladoArriba.current;
      const campo = TextInput.State.currentlyFocusedInput?.();
      if (top == null || !campo?.measureInWindow) return;
      campoMedido.current = campo;
      campo.measureInWindow((x, y, w, h) => {
        const abajoOriginal = y + h + actual.current;
        const necesario = Math.max(0, Math.round(abajoOriginal + MARGEN - top));
        if (Math.abs(necesario - actual.current) > 2) {
          actual.current = necesario;
          setDesplazamiento(necesario);
        }
      });
    };

    const mostrar = Keyboard.addListener("keyboardDidShow", (e) => {
      tecladoArriba.current = e?.endCoordinates?.screenY ?? null;
      setRelleno(Math.max(0, (e?.endCoordinates?.height ?? 0) - insets.bottom));
      actual.current = 0;
      setDesplazamiento(0);
      clearTimeout(espera);
      // Dar tiempo a que el relleno reacomode la pantalla antes de medir.
      espera = setTimeout(ajustar, 150);
      clearInterval(intervalo);
      // Solo vuelve a medir si el usuario pasa a OTRO campo.
      intervalo = setInterval(() => {
        const campo = TextInput.State.currentlyFocusedInput?.();
        if (campo && campo !== campoMedido.current) ajustar();
      }, 300);
    });
    const ocultar = Keyboard.addListener("keyboardDidHide", () => {
      clearInterval(intervalo);
      clearTimeout(espera);
      tecladoArriba.current = null;
      campoMedido.current = null;
      actual.current = 0;
      setDesplazamiento(0);
      setRelleno(0);
    });

    return () => {
      clearInterval(intervalo);
      clearTimeout(espera);
      mostrar.remove();
      ocultar.remove();
    };
  }, [insets.bottom]);

  if (Platform.OS === "ios") {
    return (
      <KeyboardAvoidingView style={style} behavior="padding">
        {children}
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={[style, { overflow: "hidden", paddingBottom: relleno }]}>
      <View style={{ flex: 1, marginTop: -desplazamiento, marginBottom: desplazamiento }}>
        {children}
      </View>
    </View>
  );
};

export default TecladoSeguro;
