import { Stack } from "expo-router";

export default function GastosLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="Agregar" options={{ headerShown: false }} />
            <Stack.Screen name="Detalle" options={{ headerShown: false }} />
        </Stack>
    );
}
