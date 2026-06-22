import { Stack } from "expo-router";

export default function GuestLayout() {
    return <>
        <Stack>
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
