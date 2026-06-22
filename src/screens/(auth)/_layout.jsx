import { DrawerContentScrollView, DrawerItem, DrawerItemList } from "@react-navigation/drawer";
import { Redirect } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { useContext } from "react";
import AuthHeader from "../../components/Molecules/AuthHeader/AuthHeader";
import { AuthContext } from "../../utils/AuthContext/AuthContext";
// creacion de drawer personalizado para agregar el boton de cerrar sesión
function CustomDrawerContent(props) {
    const contextoAutenticacion = useContext(AuthContext);
    return (
        <DrawerContentScrollView {...props}>
            {/* Items normales con ruta */}
            <DrawerItemList {...props} />
            {/* ✅ Item visible sin ruta, solo ejecuta función */}
            <DrawerItem
                label="Cerrar Sesión"
                onPress={() => contextoAutenticacion.desautenticar()}
            />
        </DrawerContentScrollView>
    );
}

export default function AuthLayout() {
    const contextoAutenticacion = useContext(AuthContext);

    if (!contextoAutenticacion.isReady) { return null; }
    if (!contextoAutenticacion.autenticado) {
        return <Redirect href="/Login" />;
    }
    return <>
        <Drawer
            // se agrego el drawerContent para personalizar el contenido del drawer y agregar el boton de cerrar sesión
            drawerContent={
                (props) => <CustomDrawerContent {...props} />
            }

            screenOptions={{
                header: ({ navigation, route, options }) => (
                    <AuthHeader navigation={navigation} route={route} options={options} />
                )
            }}
        >

            <Drawer.Screen
                name="(mesas)"
                options={{
                    animation: "none",
                    drawerLabel: "Mesas",
                    title: "Mesas",
                }}
            />
            <Drawer.Screen
                name="Ventas/index"
                options={{
                    animation: "none",
                    drawerLabel: "Ventas",
                    title: "Ventas",
                }}
            />
            <Drawer.Screen
                name="Caja/index"
                options={{
                    animation: "none",
                    drawerLabel: "Caja",
                    title: "Caja",
                }}
            />
            <Drawer.Screen
                name="MiRestaurante/index"
                options={{
                    animation: "none",
                    drawerLabel: "Mi Restaurante",
                    title: "Mi Restaurante",
                }}
            />
            <Drawer.Screen
                name="Clientes/index"
                options={{
                    animation: "none",
                    drawerLabel: "Clientes",
                    title: "Clientes",
                }}
            />
            <Drawer.Screen
                name="Gastos/index"
                options={{
                    animation: "none",
                    drawerLabel: "Gastos",
                    title: "Gastos",
                }}
            />
            <Drawer.Screen
                name="Inventarios/index"
                options={{
                    animation: "none",
                    drawerLabel: "Inventarios",
                    title: "Inventarios",
                }}
            />
            <Drawer.Screen
                name="Impresoras/index"
                options={{
                    animation: "none",
                    drawerLabel: "Impresoras",
                    title: "Impresoras",
                }}
            />
            <Drawer.Screen
                name="Configuraciones/index"
                options={{
                    animation: "none",
                    drawerLabel: "Configuraciones",
                    title: "Configuraciones",
                }}
            />
            {/* ocultos */}
            <Drawer.Screen
                name="Inventarios/database"
                options={{
                    animation: "none",
                    drawerItemStyle: { display: "none" },
                }}
            />
            <Drawer.Screen
                name="Ventas/database"
                options={{
                    animation: "none",
                    drawerItemStyle: { display: "none" },
                }}
            />
            <Drawer.Screen
                name="PantallaDeCarga/index"
                options={{
                    headerShown: false,
                    animation: "none",
                    drawerItemStyle: { display: "none" },
                }}
            />
            <Drawer.Screen
                name="Ventas/DetalleVentas"
                
                options={{
                    animation: "none",
                    drawerItemStyle: { display: "none" },
                    title: "Detalle de venta",
                    drawerLabel: "Detalle de venta",
                }}
            />
            <Drawer.Screen
                name="Impresoras/styles"
                
                options={{
                    animation: "none",
                    drawerItemStyle: { display: "none" },
                    title: "Detalle de venta",
                    drawerLabel: "Detalle de venta",
                }}
            />
            <Drawer.Screen
                name="Configuraciones/database"
                options={{
                    animation: "none",
                    drawerItemStyle: { display: "none" },
                }}
            />
            <Drawer.Screen
                name="Configuraciones/styles"
                options={{
                    animation: "none",
                    drawerItemStyle: { display: "none" },
                }}
            />
            <Drawer.Screen
                name="Gastos/Agregar"
                options={{
                    animation: "none",
                    drawerItemStyle: { display: "none" },
                    title: "Agregar gasto",
                    headerShown: false,
                }}
            />
            <Drawer.Screen
                name="Gastos/database"
                options={{
                    animation: "none",
                    drawerItemStyle: { display: "none" },
                }}
            />
            <Drawer.Screen
                name="Gastos/styles"
                options={{
                    animation: "none",
                    drawerItemStyle: { display: "none" },
                }}
            />
            <Drawer.Screen
                name="Caja/styles"
                options={{
                    animation: "none",
                    drawerItemStyle: { display: "none" },
                }}
            />
            <Drawer.Screen
                name="Caja/dataBase"
                options={{
                    animation: "none",
                    drawerItemStyle: { display: "none" },
                }}
            />
            <Drawer.Screen
                name="Ventas/styles"
                options={{
                    animation: "none",
                    drawerItemStyle: { display: "none" },
                }}
            />
            <Drawer.Screen
                name="Ventas/ticket"
                options={{
                    animation: "none",
                    drawerItemStyle: { display: "none" },
                }}
            />
            <Drawer.Screen
                name="Inventarios/styles"
                options={{
                    animation: "none",
                    drawerItemStyle: { display: "none" },
                }}
            />
            <Drawer.Screen
                name="Impresoras/Database"
                options={{
                    animation: "none",
                    drawerItemStyle: { display: "none" },
                }}
            />
            <Drawer.Screen
                name="MiRestaurante/styles"
                options={{
                    animation: "none",
                    drawerItemStyle: { display: "none" },
                }}
            />
            <Drawer.Screen
                name="MiRestaurante/database"
                options={{
                    animation: "none",
                    drawerItemStyle: { display: "none" },
                }}
            />
            <Drawer.Screen
                name="PantallaDeCarga/styles"
                options={{
                    animation: "none",
                    drawerItemStyle: { display: "none" },
                }}
            />
            <Drawer.Screen
                name="PantallaDeCarga/database"
                options={{
                    animation: "none",
                    drawerItemStyle: { display: "none" },
                }}
            />
            <Drawer.Screen
                name="PantallaDeCarga/integracion"
                options={{
                    animation: "none",
                    drawerItemStyle: { display: "none" },
                }}
            />
            <Drawer.Screen
                name="Impresoras/Funciones/Impresion"
                options={{
                    animation: "none",
                    drawerItemStyle: { display: "none" },
                }}
            />
            
            <Drawer.Screen
                name="Impresoras/templates/TicketDePrueba"
                options={{
                    animation: "none",
                    drawerItemStyle: { display: "none" },
                }}
            />
            
          
        </Drawer>
    </>
}