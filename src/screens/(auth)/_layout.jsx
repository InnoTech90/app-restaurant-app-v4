import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from "@react-navigation/drawer";
import { Redirect, useRouter, useSegments } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { useContext, useEffect, useState } from "react";
import { Alert } from "react-native";
import AuthHeader from "../../components/Molecules/AuthHeader/AuthHeader";
import NipModal from "../../components/Molecules/NipModal/NipModal";
import { dataBase } from "../../components/Molecules/NipModal/database";
import { AuthContext } from "../../utils/AuthContext/AuthContext";
import {
  exportarDatabaseSQLite,
  isExportDbDisponible,
} from "../../utils/exportDatabase";
import {
  autorizarSeccion,
  revocarOtrasSecciones,
  revocarTodasLasSecciones,
  tieneAccesoSeccion,
} from "../../utils/sectionAccess";
import { puedeVerOpcionDrawer } from "../../utils/gerentePermisos";
import VentasDatabase from "./Ventas/database";

function CustomDrawerContent({
  onCerrarSesion,
  onExportarDb,
  exportandoDb,
  mostrarExportarDb,
  ...props
}) {
  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      {mostrarExportarDb ? (
        <DrawerItem
          label={exportandoDb ? "Exportando BD..." : "Exportar BD (temporal)"}
          onPress={onExportarDb}
          disabled={exportandoDb}
        />
      ) : null}
      <DrawerItem label="Cerrar sesión" onPress={onCerrarSesion} />
    </DrawerContentScrollView>
  );
}

export default function AuthLayout() {
  const contextoAutenticacion = useContext(AuthContext);
  const segments = useSegments();
  const router = useRouter();
  const [exportandoDb, setExportandoDb] = useState(false);
  const [nipModal, setNipModal] = useState({
    visible: false,
    titulo: "",
    accion: null,
  });

  const enPantallaLibre =
    segments.includes("LoginGerente") || segments.includes("PantallaDeCarga");

  useEffect(() => {
    if (!contextoAutenticacion.isReady || !contextoAutenticacion.autenticado) {
      return;
    }

    if (!contextoAutenticacion.gerenteSesion && !enPantallaLibre) {
      router.replace("/LoginGerente");
      return;
    }

    if (
      contextoAutenticacion.gerenteSesion &&
      segments.includes("LoginGerente")
    ) {
      router.replace("/Inicio");
    }
  }, [
    contextoAutenticacion.isReady,
    contextoAutenticacion.autenticado,
    contextoAutenticacion.gerenteSesion,
    enPantallaLibre,
    segments,
    router,
  ]);

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

  const handleExportarDb = async () => {
    if (exportandoDb) return;
    setExportandoDb(true);
    try {
      await exportarDatabaseSQLite();
    } catch (error) {
      console.error("Error exportando base de datos:", error);
      Alert.alert(
        "Error",
        error?.message ?? "No se pudo exportar la base de datos.",
      );
    } finally {
      setExportandoDb(false);
    }
  };

  const intentarCerrarSesion = async () => {
    try {
      const { pendientes, sinSincronizar } =
        await VentasDatabase.getBloqueosCierreSesion();

      const mensajes = [];
      if (pendientes > 0) {
        mensajes.push(
          `Tienes ${pendientes} venta${pendientes === 1 ? "" : "s"} pendiente${pendientes === 1 ? "" : "s"} por resolver.`,
        );
      }
      if (sinSincronizar > 0) {
        mensajes.push(
          `Tienes ${sinSincronizar} venta${sinSincronizar === 1 ? "" : "s"} sin sincronizar.`,
        );
      }

      if (mensajes.length > 0) {
        Alert.alert("No se puede cerrar sesión", mensajes.join("\n\n"));
        return;
      }

      pedirNip("Cerrar sesión", () => {
        revocarTodasLasSecciones();
        contextoAutenticacion.cerrarSesionGerente();
      });
    } catch (error) {
      console.error("Error verificando ventas antes de cerrar sesión:", error);
      Alert.alert(
        "Error",
        "No se pudo verificar el estado de las ventas. Intenta nuevamente.",
      );
    }
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
      // Entrada principal tras login; no depende de KEYWORD.
      siempreVisible: true,
    },
    {
      name: "Ventas/index",
      label: "Ventas",
      title: "Ventas",
      keywords: ["sales"],
      requiereNipSi: "PROTEGER_VENTAS",
      seccionAcceso: "ventas",
    },
    {
      name: "Caja/index",
      label: "Caja",
      title: "Caja",
      keywords: ["cash"],
    },
    {
      name: "MiRestaurante/index",
      label: "Mi Restaurante",
      title: "Mi Restaurante",
      keywords: ["business"],
      requiereNip: true,
    },
    {
      name: "Clientes",
      label: "Clientes",
      title: "Clientes",
      keywords: ["customers"],
    },
    {
      name: "Gastos",
      label: "Gastos",
      title: "Gastos",
      keywords: ["expenses"],
      requiereNipSi: "MODO_RESTRICTIVO",
      seccionAcceso: "gastos",
    },
    {
      name: "Inventarios/index",
      label: "Inventarios",
      title: "Inventarios",
      keywords: ["inventory"],
      requiereNipSi: "MODO_RESTRICTIVO",
      seccionAcceso: "inventarios",
    },
    {
      name: "Impresoras/index",
      label: "Impresoras",
      title: "Impresoras",
      keywords: ["printers"],
    },
    {
      name: "Configuraciones/index",
      label: "Configuraciones",
      title: "Configuraciones",
      keywords: ["settings"],
      requiereNip: false,
    },
  ];

  const gerenteSesion = contextoAutenticacion.gerenteSesion;

  const hiddenScreens = [
    {
      name: "LoginGerente/index",
      headerShown: false,
      swipeEnabled: false,
    },
    { name: "Inventarios/database" },
    { name: "Ventas/database" },
    {
      name: "PantallaDeCarga/index",
      headerShown: false,
      swipeEnabled: false,
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
    { name: "Ventas/integracion" },
    { name: "Inventarios/styles" },
    { name: "Inventarios/integracion" },
    { name: "Gastos/integracion" },
    { name: "Clientes/integracion" },
    { name: "Impresoras/Database" },
    { name: "MiRestaurante/styles" },
    { name: "MiRestaurante/database" },
    { name: "PantallaDeCarga/styles" },
    { name: "PantallaDeCarga/database" },
    { name: "PantallaDeCarga/integracion" },
    { name: "Impresoras/Funciones/Impresion" },
    { name: "Impresoras/templates/TicketDePrueba" },
    { name: "LoginGerente/database" },
    { name: "LoginGerente/integracion" },
  ];

  const ocultarDrawer = enPantallaLibre;

  return (
    <>
      <Drawer
        drawerContent={(props) => (
          <CustomDrawerContent
            {...props}
            exportandoDb={exportandoDb}
            mostrarExportarDb={isExportDbDisponible()}
            onExportarDb={() => {
              props.navigation.closeDrawer();
              handleExportarDb();
            }}
            onCerrarSesion={() => {
              props.navigation.closeDrawer();
              revocarTodasLasSecciones();
              intentarCerrarSesion();
            }}
          />
        )}
        screenOptions={{
          ...(ocultarDrawer && {
            swipeEnabled: false,
            headerShown: false,
          }),
          header: ({ navigation, route, options }) => (
            <AuthHeader
              navigation={navigation}
              route={route}
              options={options}
            />
          ),
        }}
      >
        {drawerScreens.map((screen) => {
          const tienePermiso = puedeVerOpcionDrawer(gerenteSesion, screen);
          const ocultarItem = ocultarDrawer || !tienePermiso;

          return (
            <Drawer.Screen
              key={screen.name}
              name={screen.name}
              options={{
                drawerLabel: screen.label,
                title: screen.title,
                ...(ocultarItem
                  ? {
                      drawerItemStyle: { display: "none" },
                      // Expo Router: oculta del menú aunque exista el archivo de ruta
                      href: null,
                    }
                  : {}),
              }}
              listeners={
                screen.requiereNip || screen.requiereNipSi
                  ? ({ navigation }) => ({
                      drawerItemPress: async (e) => {
                        e.preventDefault();
                        navigation.closeDrawer();

                        if (!puedeVerOpcionDrawer(gerenteSesion, screen)) {
                          Alert.alert(
                            "Sin permiso",
                            "Tu usuario no tiene acceso a esta opción.",
                          );
                          return;
                        }

                        revocarOtrasSecciones(screen.seccionAcceso ?? null);

                        if (navigation.isFocused()) return;

                        let necesitaNip = !!screen.requiereNip;

                        if (screen.requiereNipSi) {
                          const configuraciones =
                            await dataBase.getConfiguracionesModel();
                          const config = configuraciones?.[0];
                          if (config?.[screen.requiereNipSi]) {
                            necesitaNip = !tieneAccesoSeccion(
                              screen.seccionAcceso,
                            );
                          }
                        }

                        const navegar = () => navigation.navigate(screen.name);

                        if (necesitaNip) {
                          pedirNip(screen.title, () => {
                            if (screen.seccionAcceso) {
                              autorizarSeccion(screen.seccionAcceso);
                            }
                            navegar();
                          });
                        } else {
                          navegar();
                        }
                      },
                    })
                  : () => ({
                      drawerItemPress: (e) => {
                        if (!puedeVerOpcionDrawer(gerenteSesion, screen)) {
                          e.preventDefault();
                          Alert.alert(
                            "Sin permiso",
                            "Tu usuario no tiene acceso a esta opción.",
                          );
                          return;
                        }
                        revocarTodasLasSecciones();
                      },
                    })
              }
            />
          );
        })}

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
              ...(screen.swipeEnabled !== undefined && {
                swipeEnabled: screen.swipeEnabled,
                drawerLockMode:
                  screen.swipeEnabled === false ? "locked-closed" : undefined,
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
