import { Stack } from "expo-router";
import {Text, View } from "react-native";
import { s } from "./style";
export default function LoginLayout() {
    return <Stack>
            <Stack.Screen name="index" options={{
                headerTitleAlign: "center",
                headerTitle: () => (
                    < View style={s.header} >
                        <Text style={s.headerTitle}>ESCANEA O PEGA EL CÓDIGO</Text>
                    </View>
                ),
                headerShadowVisible: false,
                headerTransparent: true,
            }}
            />
    </Stack >
}