import { Stack } from "expo-router";
import { color as tema } from "../../utils/theme";

export default function GuestLayout() {
    return <>
        <Stack screenOptions={{ contentStyle: { backgroundColor: tema.background } }}>
            <Stack.Screen
                name="(Login)/Login"
                options={{
                    headerShown: false,
                    animation: "none"
                }}
            />
        </Stack>
    </>
}
