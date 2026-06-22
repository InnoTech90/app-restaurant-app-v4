import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LogBox } from "react-native";
import { AuthProvider } from "../utils/AuthContext/AuthContext";

// Suprime el warning de keep-awake que genera expo-camera
LogBox.ignoreLogs(["Unable to activate keep awake"]);

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