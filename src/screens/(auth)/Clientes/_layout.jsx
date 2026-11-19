import { Stack } from "expo-router";
import { color as tema } from "../../../utils/theme";

export default function ClientesLayout() {
    return (
        <Stack screenOptions={{ contentStyle: { backgroundColor: tema.background } }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="Agregar" options={{ headerShown: false }} />
            <Stack.Screen name="Editar" options={{ headerShown: false }} />
        </Stack>
    );
}
