import { Stack } from "expo-router";


export default function MesasLayout() {
    
return <>
        <Stack>
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