import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import TecladoSeguro from "../components/atoms/TecladoSeguro/TecladoSeguro";
import * as SystemUI from "expo-system-ui";
import { color, esOscuro } from "../utils/theme";

import AvisoModalHost from "../components/Molecules/AvisoModalHost/AvisoModalHost";
import { AuthProvider } from "../utils/AuthContext/AuthContext";

// Fondo de la ventana nativa (se ve al cambiar de pantalla o al abrir el teclado).
SystemUI.setBackgroundColorAsync(color.background).catch(() => {});

export default function AppLayout() {
  return (
    <AuthProvider>
      <StatusBar style={esOscuro ? "light" : "dark"} />
      {/* Android 15+ dibuja de borde a borde y ya no encoge la ventana con el
          teclado: este contenedor la recorre en todas las pantallas para que
          el teclado nunca tape el campo en el que se escribe. */}
      <TecladoSeguro style={{ flex: 1, backgroundColor: color.background }}>
      <Stack screenOptions={{ contentStyle: { backgroundColor: color.background } }}>
        <Stack.Screen
          name="(auth)"
          options={{
            headerShown: false,
            animation: "none",
          }}
        />
        <Stack.Screen
          name="(guest)"
          options={{
            headerShown: false,
            animation: "none",
          }}
        />
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
            animation: "none",
          }}
        />
      </Stack>
      </TecladoSeguro>
      <AvisoModalHost />
    </AuthProvider>
  );
}