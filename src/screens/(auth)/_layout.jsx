import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from "@react-navigation/drawer";
import { Redirect, useSegments } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { useContext, useState } from "react";
import AuthHeader from "../../components/Molecules/AuthHeader/AuthHeader";
import NipModal from "../../components/Molecules/NipModal/NipModal";
import { dataBase } from "../../components/Molecules/NipModal/database";
import { AuthContext } from "../../utils/AuthContext/AuthContext";
import { mostrarAviso } from "../../utils/avisoModal";
import {
  exportarDatabaseSQLite,
  isExportDbDisponible,
} from "../../utils/exportDatabase";
import { requiereNipAcceso, sesionPuedeEntrar } from "../../utils/gerentePermisos";
import {
  autorizarSeccion,
  revocarOtrasSecciones,
  revocarTodasLasSecciones,
  tieneAccesoSeccion,
} from "../../utils/sectionAccess";
import {
  construirMensajeCierreSesion,
  hayPendientesCierreSesion,
  obtenerPendientesSincronizacion,
} from "../../utils/pendientesSincronizacion";

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
  const [exportandoDb, setExportandoDb] = useState(false);
  const [nipModal, setNipModal] = useState({
    visible: false,
    titulo: "",
    accion: null,
    keywords: null,
    modo: "dueño",
  });

  const enPantallaLibre = segments.includes("PantallaDeCarga");

  const pedirNip = (titulo, accion, { keywords = null, modo = "dueño" } = {}) => {
    setNipModal({ visible: true, titulo, accion, keywords, modo });
  };

  const cerrarNipModal = () => {
    setNipModal({
      visible: false,
      titulo: "",
      accion: null,
      keywords: null,
      modo: "dueño",
    });
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
      mostrarAviso({
        type: "danger",
        title: "Error",
        message: error?.message ?? "No se pudo exportar la base de datos.",
      });
    } finally {
      setExportandoDb(false);
    }
  };

  const intentarCerrarSesion = async () => {
    try {
      const pendientes = await obtenerPendientesSincronizacion();

      if (hayPendientesCierreSesion(pendientes)) {
        mostrarAviso({
          type: "warning",
          title: "No se puede cerrar sesión",
          message: construirMensajeCierreSesion(pendientes),
        });
        return;
      }

      pedirNip(
        "Cerrar sesión",
        () => {
          revocarTodasLasSecciones();
          contextoAutenticacion.desautenticar();
        },
        { modo: "acceso", keywords: [] },
      );
    } catch (error) {
      console.error("Error verificando pendientes antes de cerrar sesión:", error);
      mostrarAviso({
        type: "danger",
        title: "Error",
        message:
          "No se pudo verificar el estado de la sesión. Intenta nuevamente.",
      });
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
      restringeConModo: true,
      seccionAcceso: "caja",
    },
    {
      name: "MiRestaurante/index",
      label: "Mi Restaurante",
      title: "Mi Restaurante",
      keywords: ["business"],
      restringeConModo: true,
      seccionAcceso: "restaurante",
    },
    {
      name: "Clientes",
      label: "Clientes",
      title: "Clientes",
      accesoLibre: true,
    },
    {
      name: "Gastos",
      label: "Gastos",
      title: "Gastos",
      keywords: ["expenses"],
      restringeConModo: true,
      seccionAcceso: "gastos",
    },
    {
      name: "Inventarios/index",
      label: "Inventarios",
      title: "Inventarios",
      keywords: ["inventory"],
      restringeConModo: true,
      seccionAcceso: "inventarios",
    },
    {
      name: "Impresoras/index",
      label: "Impresoras",
      title: "Impresoras",
      accesoLibre: true,
    },
    {
      name: "Configuraciones/index",
      label: "Configuraciones",
      title: "Configuraciones",
      keywords: ["settings"],
      requiereNip: true,
      seccionAcceso: "configuraciones",
    },
    {
      name: "Plantillas/index",
      label: "Plantillas",
      title: "Plantillas",
      soloDesarrollo: true,
    },
  ];

  const hiddenScreens = [
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
  ];

  const ocultarDrawer = enPantallaLibre;

  const resolverAccesoYNavegar = async (screen, navigation) => {
    revocarOtrasSecciones(screen.seccionAcceso ?? null);

    const navegar = () => {
      if (screen.seccionAcceso) {
        autorizarSeccion(screen.seccionAcceso);
      }
      navigation.navigate(screen.name);
    };

    const pedirNipAcceso = () => {
      pedirNip(screen.title, navegar, {
        modo: "acceso",
        keywords: screen.keywords ?? [],
      });
    };

    if (screen.accesoLibre || screen.siempreVisible) {
      navegar();
      return;
    }

    if (screen.restringeConModo) {
      const configuraciones = await dataBase.getConfiguracionesModel();
      const modoRestrictivo = !!configuraciones?.[0]?.MODO_RESTRICTIVO;

      if (modoRestrictivo) {
        if (screen.seccionAcceso && tieneAccesoSeccion(screen.seccionAcceso)) {
          navegar();
          return;
        }
        pedirNipAcceso();
        return;
      }

      const permitido = await sesionPuedeEntrar(screen);
      if (!permitido) {
        mostrarAviso({
          type: "warning",
          title: "Sin permiso",
          message: "No tiene permisos para acceder a esta opción.",
        });
        return;
      }
      navegar();
      return;
    }

    if (requiereNipAcceso(screen) && !screen.requiereNipSi) {
      pedirNipAcceso();
      return;
    }

    let necesitaNip = !!screen.requiereNip;

    if (screen.requiereNipSi) {
      const configuraciones = await dataBase.getConfiguracionesModel();
      const config = configuraciones?.[0];
      if (config?.[screen.requiereNipSi]) {
        necesitaNip = !tieneAccesoSeccion(screen.seccionAcceso);
      }
    }

    if (necesitaNip) {
      pedirNipAcceso();
    } else {
      navegar();
    }
  };

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
        {drawerScreens.map((screen) => (
          <Drawer.Screen
            key={screen.name}
            name={screen.name}
            options={{
              drawerLabel: screen.label,
              title: screen.title,
              ...(ocultarDrawer || (screen.soloDesarrollo && !__DEV__)
                ? {
                    drawerItemStyle: { display: "none" },
                    href: null,
                  }
                : {}),
            }}
            listeners={({ navigation }) => ({
              drawerItemPress: async (e) => {
                e.preventDefault();
                navigation.closeDrawer();
                await resolverAccesoYNavegar(screen, navigation);
              },
            })}
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
        modo={nipModal.modo}
        keywords={nipModal.keywords}
        onClose={cerrarNipModal}
        onSubmit={onNipCorrecto}
      />
    </>
  );
}
