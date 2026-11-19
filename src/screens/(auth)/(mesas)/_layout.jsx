import { Stack } from "expo-router";
import { color as tema } from "../../../utils/theme";


export default function MesasLayout() {
    
return <>
        <Stack screenOptions={{ contentStyle: { backgroundColor: tema.background } }}>
            <Stack.Screen
                name="Inicio/index"
                options={{
                    headerShown: false,
                    animation: "none"
                }}
            />
            <Stack.Screen
                name="Menu Principal/index"
                options={{
                    headerShown: false,
                    animation: "none"
                }}
            />
            <Stack.Screen
                name="DetalleArticulo/index"
                options={{
                    headerShown: false,
                    animation: "none"
                }}
            />
            <Stack.Screen
                name="DetalleComplemento/index"
                options={{
                    headerShown: false,
                    animation: "none"
                }}
            />
            <Stack.Screen
                name="Ticket/index"
                options={{
                    headerShown: false,
                    animation: "none"
                }}
            />
            <Stack.Screen
                name="Pago/index"
                options={{
                    headerShown: false,
                    animation: "none"
                }}
            />
        </Stack>
    </>
}