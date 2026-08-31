import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../utils/AuthContext/AuthContext";

export default function AppLayout() {

    return <>
        <AuthProvider >
            <StatusBar style="auto" />
            <Stack >
                <Stack.Screen
                    name="(auth)"
                    options={{
                        headerShown: false,
                        animation: "none"
                    }}
                />

                <Stack.Screen
                    name="(guest)"
                    options={{
                        headerShown: false,
                        animation: "none"
                    }}
                />
                <Stack.Screen
                    name="index"
                    options={{
                        headerShown: false,
                        animation: "none"
                    }}
                />
                

             
            </Stack>
        </AuthProvider>
    </>
}