import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
  useDrawerStatus,
} from "@react-navigation/drawer";
import { Image } from "expo-image";
import { Redirect, useRouter, useSegments } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { color as tc, font as tf, gradient, radius, space } from "../../utils/theme";
import { useCallback, useContext, useEffect, useState } from "react";
import {
  AppState,
  DeviceEventEmitter,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  DISPOSITIVO_DESACTIVADO_EVENT,
  reiniciarAvisoDispositivo,
  verificarSesionDispositivo,
} from "../../utils/http/sesionDispositivo";
import AuthHeader from "../../components/Molecules/AuthHeader/AuthHeader";
import NipModal from "../../components/Molecules/NipModal/NipModal";
import { dataBase } from "../../components/Molecules/NipModal/database";
import { AuthContext } from "../../utils/AuthContext/AuthContext";
import { mostrarAviso } from "../../utils/avisoModal";
import { getDb } from "../../utils/db";
import { logoUsable } from "../../utils/logoSucursal";
import {
  DIGITAL_ORDERS_CAPABILITY_EVENT,
  refreshDigitalOrdersBadge,
  setDigitalOrdersPendingCount,
  useDigitalOrdersBadge,
} from "../../utils/digitalOrders/badgeStore";
import {
  attachDigitalOrderNotificationListeners,
  registerDigitalOrderPushToken,
} from "../../utils/digitalOrders/notifications";
import {
  connectDigitalOrdersSocket,
  deviceReceivesOrdersLocal,
  disconnectDigitalOrdersSocket,
  subscribeDigitalOrders,
} from "../../utils/digitalOrders/socket";
import {
  exportarDatabaseSQLite,
  isExportDbDisponible,
} from "../../utils/exportDatabase";
import { isTablet, normalize } from "../../utils/funcionesMaquetado/responsiveWH";
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
import { SUCURSAL_INFO_UPDATED_EVENT } from "./PantallaDeCarga/database";
import { gb } from "../globalStyles";

const INTERVALO_REVISION_DISPOSITIVO_MS = 60 * 1000;

// Íconos del menú lateral (Ionicons, sin emojis).
const DRAWER_ICONS = {
  "(mesas)": "grid-outline",
  "Ventas/index": "receipt-outline",
  "Caja/index": "cash-outline",
  "MiRestaurante/index": "storefront-outline",
  "PedidoEnLinea/index": "bicycle-outline",
  Clientes: "people-outline",
  Gastos: "wallet-outline",
  "Inventarios/index": "cube-outline",
  "Impresoras/index": "print-outline",
  "Configuraciones/index": "settings-outline",
  "Plantillas/index": "document-text-outline",
};

const drawerIcon = (name) =>
  DRAWER_ICONS[name]
    ? ({ color: iconColor, size }) => (
        <Ionicons name={DRAWER_ICONS[name]} size={size - 2} color={iconColor} />
      )
    : undefined;

function PedidoEnLineaDrawerLabel({ color, label }) {
  const pendingCount = useDigitalOrdersBadge();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        flex: 1,
        paddingRight: 8,
      }}
    >
      <Text
        style={{
          color,
          fontWeight: Platform.OS === "ios" ? "600" : undefined,
          fontFamily: Platform.select({
            ios: undefined,
            default: "sans-serif-medium",
          }),
        }}
      >
        {label}
      </Text>
      {pendingCount > 0 ? (
        <View
          style={{
            minWidth: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: tc.danger,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 5,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>
            {pendingCount > 9 ? "9+" : String(pendingCount)}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function CustomDrawerContent({
  onCerrarSesion,
  onExportarDb,
  exportandoDb,
  mostrarExportarDb,
  ...props
}) {
  const drawerStatus = useDrawerStatus();
  const insets = useSafeAreaInsets();
  const [sucursal, setSucursal] = useState(null);

  const cargarSucursal = useCallback(async () => {
    try {
      const db = await getDb();
      const row = await db.getFirstAsync(
        `SELECT NOMBRE, LOGO FROM SUCURSAL LIMIT 1`,
      );
      setSucursal(row ?? null);
    } catch {
      setSucursal(null);
    }
  }, []);

  useEffect(() => {
    cargarSucursal();
  }, [cargarSucursal]);

  useEffect(() => {
    if (drawerStatus === "open") {
      cargarSucursal();
    }
  }, [drawerStatus, cargarSucursal]);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(
      SUCURSAL_INFO_UPDATED_EVENT,
      (payload) => {
        if (payload?.nombre || payload?.logo) {
          setSucursal({
            NOMBRE: payload.nombre ?? null,
            LOGO: payload.logo ?? null,
          });
          return;
        }
        cargarSucursal();
      },
    );
    return () => sub.remove();
  }, [cargarSucursal]);

  const [logoFallo, setLogoFallo] = useState(false);
  const logoUri = logoFallo ? "" : logoUsable(sucursal?.LOGO);
  useEffect(() => setLogoFallo(false), [sucursal?.LOGO]);

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={[
        drawerStyles.scroll,
        { paddingTop: insets.top + space.sm },
      ]}
    >
      <LinearGradient
        colors={gradient.brand}
        start={gradient.brandStart}
        end={gradient.brandEnd}
        style={drawerStyles.header}
      >
        <Image
          key={logoUri || "fallback-logo"}
          source={
            logoUri
              ? { uri: logoUri }
              : require("../../assets/img/logo_app_rest_blanco.png")
          }
          style={drawerStyles.logo}
          contentFit="contain"
          cachePolicy="none"
          transition={200}
          onError={() => setLogoFallo(true)}
        />
        {sucursal?.NOMBRE ? (
          <Text style={drawerStyles.nombre} numberOfLines={2}>
            {sucursal.NOMBRE}
          </Text>
        ) : null}
      </LinearGradient>
      <DrawerItemList {...props} />
      <View style={drawerStyles.separator} />
      {mostrarExportarDb ? (
        <DrawerItem
          label={exportandoDb ? "Exportando BD..." : "Exportar BD (temporal)"}
          onPress={onExportarDb}
          disabled={exportandoDb}
          icon={({ color: c, size }) => (
            <Ionicons name="download-outline" size={size - 2} color={c} />
          )}
          style={drawerStyles.item}
          labelStyle={drawerStyles.label}
        />
      ) : null}
      <DrawerItem
        label="Cerrar sesión"
        onPress={onCerrarSesion}
        icon={({ size }) => (
          <Ionicons name="log-out-outline" size={size - 2} color={tc.danger} />
        )}
        style={drawerStyles.item}
        labelStyle={[drawerStyles.label, { color: tc.danger }]}
      />
    </DrawerContentScrollView>
  );
}

const drawerStyles = StyleSheet.create({
  scroll: {
    paddingTop: space.sm,
    paddingBottom: space.xl,
  },
  header: {
    paddingHorizontal: space.lg,
    paddingTop: space.lg,
    paddingBottom: space.lg,
    marginBottom: space.md,
    marginHorizontal: space.md,
    alignItems: "center",
    borderRadius: radius.lg,
  },
  separator: {
    height: 1,
    backgroundColor: tc.border,
    marginHorizontal: space.lg,
    marginVertical: space.sm,
  },
  item: {
    borderRadius: radius.md,
    marginHorizontal: space.md,
  },
  label: {
    fontSize: tf.md,
    fontWeight: tf.medium,
    color: tc.text,
  },
  logo: {
    width: normalize(120),
    height: normalize(72),
  },
  nombre: {
    marginTop: normalize(10),
    fontSize: normalize(15),
    fontWeight: tf.bold,
    color: tc.textOnPrimary,
    textAlign: "center",
  },
});

export default function AuthLayout() {
  const contextoAutenticacion = useContext(AuthContext);
  const router = useRouter();
  const segments = useSegments();
  const [exportandoDb, setExportandoDb] = useState(false);
  const [recibePedidos, setRecibePedidos] = useState(false);
  const [capabilityTick, setCapabilityTick] = useState(0);
  const [nipModal, setNipModal] = useState({
    visible: false,
    titulo: "",
    accion: null,
    keywords: null,
    modo: "dueño",
  });

  const enPantallaLibre = segments.includes("PantallaDeCarga");

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(
      DIGITAL_ORDERS_CAPABILITY_EVENT,
      () => setCapabilityTick((tick) => tick + 1),
    );
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!contextoAutenticacion?.autenticado || enPantallaLibre) {
      setRecibePedidos(false);
      setDigitalOrdersPendingCount(0);
      disconnectDigitalOrdersSocket();
      return undefined;
    }

    let removeNotificationListeners = () => {};
    let unsubscribeSocket = () => {};
    let cancelled = false;

    const setupRealtime = async () => {
      disconnectDigitalOrdersSocket();

      const receivesOrders = await deviceReceivesOrdersLocal();
      if (cancelled) return;
      setRecibePedidos(receivesOrders);
      if (!receivesOrders) {
        setDigitalOrdersPendingCount(0);
        return;
      }

      try {
        await connectDigitalOrdersSocket();
        await registerDigitalOrderPushToken();
        await refreshDigitalOrdersBadge();
      } catch (error) {
        console.warn("No se pudo iniciar notificaciones de pedidos", error);
      }

      if (cancelled) return;

      removeNotificationListeners = attachDigitalOrderNotificationListeners({
        onReceive: () => {
          refreshDigitalOrdersBadge();
          mostrarAviso({
            type: "info",
            title: "Nuevo pedido en línea",
            message: "Revisa la sección Pedido en línea",
          });
        },
        onRespond: () => {
          router.push("/PedidoEnLinea");
        },
      });

      unsubscribeSocket = subscribeDigitalOrders((event) => {
        refreshDigitalOrdersBadge();
        if (event === "created") {
          mostrarAviso({
            type: "info",
            title: "Nuevo pedido en línea",
            message: "Llegó un pedido nuevo",
          });
        }
      });
    };

    setupRealtime();

    return () => {
      cancelled = true;
      unsubscribeSocket?.();
      removeNotificationListeners?.();
      disconnectDigitalOrdersSocket();
    };
  }, [
    contextoAutenticacion?.autenticado,
    enPantallaLibre,
    router,
    capabilityTick,
  ]);

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

  // Dispositivo desactivado/eliminado en User → cerrar sesión cuanto antes.
  // Los datos locales (ventas pendientes) NO se borran: desautenticar solo
  // cierra la sesión, y el dispositivo ya no puede volver a entrar.
  useEffect(() => {
    if (!contextoAutenticacion?.autenticado) return undefined;
    reiniciarAvisoDispositivo();

    const sub = DeviceEventEmitter.addListener(
      DISPOSITIVO_DESACTIVADO_EVENT,
      () => {
        revocarTodasLasSecciones();
        contextoAutenticacion.desautenticar();
        mostrarAviso({
          type: "danger",
          title: "Dispositivo desactivado",
          message:
            "Este dispositivo fue desactivado por el administrador del negocio y se cerró la sesión.",
        });
      },
    );

    verificarSesionDispositivo();
    const intervalo = setInterval(
      verificarSesionDispositivo,
      INTERVALO_REVISION_DISPOSITIVO_MS,
    );
    const subApp = AppState.addEventListener("change", (estado) => {
      if (estado === "active") verificarSesionDispositivo();
    });

    return () => {
      sub.remove();
      clearInterval(intervalo);
      subApp.remove();
    };
  }, [contextoAutenticacion?.autenticado]);

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
      name: "PedidoEnLinea/index",
      label: "Pedido en línea",
      title: "Pedido en línea",
      accesoLibre: true,
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
    { name: "Caja/integracion" },
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
    { name: "PedidoEnLinea/database" },
    { name: "PedidoEnLinea/styles" },
    { name: "PedidoEnLinea/integracion" },
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
          sceneStyle: { backgroundColor: tc.background },
          drawerStyle: {
            backgroundColor: tc.surface,
            width: isTablet ? normalize(320) : "80%",
          },
          drawerActiveTintColor: tc.primaryDark,
          drawerActiveBackgroundColor: tc.primarySoft,
          drawerInactiveTintColor: tc.text,
          drawerItemStyle: drawerStyles.item,
          drawerLabelStyle: { fontSize: tf.md, fontWeight: tf.medium },
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
              drawerLabel:
                screen.name === "PedidoEnLinea/index"
                  ? ({ color }) => (
                      <PedidoEnLineaDrawerLabel
                        color={color}
                        label={screen.label}
                      />
                    )
                  : screen.label,
              title: screen.title,
              drawerIcon: drawerIcon(screen.name),
              ...(ocultarDrawer ||
              (screen.soloDesarrollo && !__DEV__) ||
              (screen.name === "PedidoEnLinea/index" && !recibePedidos)
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
