import { Stack } from "expo-router";

export default function ClientesLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="Agregar" options={{ headerShown: false }} />
            <Stack.Screen name="Editar" options={{ headerShown: false }} />
        </Stack>
    );
}
