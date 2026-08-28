import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from "@react-navigation/drawer";
import { Redirect } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { useContext, useState } from "react";
import AuthHeader from "../../components/Molecules/AuthHeader/AuthHeader";
import NipModal from "../../components/Molecules/NipModal/NipModal";
import { dataBase } from "../../components/Molecules/NipModal/database";
import { AuthContext } from "../../utils/AuthContext/AuthContext";
import {
  autorizarVentas,
  revocarAccesoVentas,
  tieneAccesoVentas,
} from "../../utils/ventasAccess";

function CustomDrawerContent({ onCerrarSesion, ...props }) {
  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <DrawerItem label="Cerrar Sesión" onPress={onCerrarSesion} />
    </DrawerContentScrollView>
  );
}

export default function AuthLayout() {
  const contextoAutenticacion = useContext(AuthContext);
  const [nipModal, setNipModal] = useState({
    visible: false,
    titulo: "",
    accion: null,
  });

  const pedirNip = (titulo, accion) => {
    setNipModal({ visible: true, titulo, accion });
  };

  const cerrarNipModal = () => {
    setNipModal({ visible: false, titulo: "", accion: null });
  };

  const onNipCorrecto = async () => {
    const accion = nipModal.accion;
    cerrarNipModal();
    if (accion) await accion();
  };

  if (!contextoAutenticacion.isReady) {
    return null;
  }
  if (!contextoAutenticacion.autenticado) {
    return <Redirect href="/Login" />;
  }

  const drawerScreens = [
    {
      name: "(mesas)",
      label: "Mesas",
      title: "Mesas",
    },
    {
      name: "Ventas/index",
      label: "Ventas",
      title: "Ventas",
      requiereNipSi: "PROTEGER_VENTAS",
    },
    {
      name: "Caja/index",
      label: "Caja",
      title: "Caja",
    },
    {
      name: "MiRestaurante/index",
      label: "Mi Restaurante",
      title: "Mi Restaurante",
      requiereNip: true,
    },
    {
      name: "Clientes/index",
      label: "Clientes",
      title: "Clientes",
    },
    {
      name: "Gastos/index",
      label: "Gastos",
      title: "Gastos",
    },
    {
      name: "Inventarios/index",
      label: "Inventarios",
      title: "Inventarios",
    },
    {
      name: "Impresoras/index",
      label: "Impresoras",
      title: "Impresoras",
    },
    {
      name: "Configuraciones/index",
      label: "Configuraciones",
      title: "Configuraciones",
      requiereNip: true,
    },
  ];

  const hiddenScreens = [
    { name: "Inventarios/database" },
    { name: "Ventas/database" },
    {
      name: "PantallaDeCarga/index",
      headerShown: false,
    },
    {
      name: "Ventas/DetalleVentas",
      title: "Detalle de venta",
      label: "Detalle de venta",
    },
    {
      name: "Impresoras/styles",
      title: "Detalle de venta",
      label: "Detalle de venta",
    },
    { name: "Configuraciones/database" },
    { name: "Configuraciones/styles" },
    {
      name: "Gastos/Agregar",
      title: "Agregar gasto",
      headerShown: false,
    },
    { name: "Gastos/database" },
    { name: "Gastos/styles" },
    { name: "Caja/styles" },
    { name: "Caja/dataBase" },
    { name: "Ventas/styles" },
    { name: "Ventas/ticket" },
    { name: "Inventarios/styles" },
    { name: "Impresoras/Database" },
    { name: "MiRestaurante/styles" },
    { name: "MiRestaurante/database" },
    { name: "PantallaDeCarga/styles" },
    { name: "PantallaDeCarga/database" },
    { name: "PantallaDeCarga/integracion" },
    { name: "Impresoras/Funciones/Impresion" },
    { name: "Impresoras/templates/TicketDePrueba" },
  ];

  return (
    <>
      <Drawer
        drawerContent={(props) => (
          <CustomDrawerContent
            {...props}
            onCerrarSesion={() => {
              props.navigation.closeDrawer();
              revocarAccesoVentas();
              pedirNip("Cerrar sesión", () => {
                contextoAutenticacion.desautenticar();
              });
            }}
          />
        )}
        screenOptions={{
          header: ({ navigation, route, options }) => (
            <AuthHeader
              navigation={navigation}
              route={route}
              options={options}
            />
          ),
        }}
      >
        {drawerScreens.map((screen) => (
          <Drawer.Screen
            key={screen.name}
            name={screen.name}
            options={{
              drawerLabel: screen.label,
              title: screen.title,
            }}
            listeners={
              screen.requiereNip || screen.requiereNipSi
                ? ({ navigation }) => ({
                    drawerItemPress: async (e) => {
                      e.preventDefault();
                      navigation.closeDrawer();

                      if (screen.name !== "Ventas/index") {
                        revocarAccesoVentas();
                      }

                      if (navigation.isFocused()) return;

                      let necesitaNip = !!screen.requiereNip;

                      if (screen.requiereNipSi) {
                        const configuraciones =
                          await dataBase.getConfiguracionesModel();
                        const config = configuraciones?.[0];
                        if (config?.[screen.requiereNipSi]) {
                          necesitaNip = !tieneAccesoVentas();
                        }
                      }

                      if (necesitaNip) {
                        pedirNip(screen.title, () => {
                          if (screen.requiereNipSi) autorizarVentas();
                          navigation.navigate(screen.name);
                        });
                      } else {
                        navigation.navigate(screen.name);
                      }
                    },
                  })
                : ({ navigation }) => ({
                    drawerItemPress: (e) => {
                      revocarAccesoVentas();
                    },
                  })
            }
          />
        ))}

        {hiddenScreens.map((screen) => (
          <Drawer.Screen
            key={screen.name}
            name={screen.name}
            options={{
              drawerItemStyle: { display: "none" },
              ...(screen.title && { title: screen.title }),
              ...(screen.label && { drawerLabel: screen.label }),
              ...(screen.headerShown !== undefined && {
                headerShown: screen.headerShown,
              }),
            }}
          />
        ))}
      </Drawer>
      <NipModal
        visible={nipModal.visible}
        titulo={nipModal.titulo}
        onClose={cerrarNipModal}
        onSubmit={onNipCorrecto}
      />
    </>
  );
}
