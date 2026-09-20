import { Stack } from "expo-router";
import { gb } from "../../globalStyles";

export default function GastosLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { flex: 1, backgroundColor: gb.gray100 },
            }}
        >
            <Stack.Screen name="index" />
            <Stack.Screen name="AsignarGasto" />
        </Stack>
    );
}
