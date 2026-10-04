import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../../../../components/atoms/Button/Button";
import GeneralModal from "../../../../components/atoms/GeneralModal/GeneralModal";
import RecoverButton from "../../../../components/atoms/RecoverButton/RecoverButton";
import ModalDividirCuenta from "../../../../components/Molecules/ModalDividirCuenta/ModalDividirCuenta";
import MesasNavButtons from "../../../../components/Molecules/MesasNavButtons/MesasNavButtons";
import ModalSeleccionCliente from "../../../../components/Molecules/ModalSeleccionCliente/ModalSeleccionCliente";
import ModalWarning from "../../../../components/Molecules/ModalWarning/ModalWarning";
import NipModal from "../../../../components/Molecules/NipModal/NipModal";
import PagoAdicionales from "../../../../components/Molecules/PagoAdicionales/PagoAdicionales";
import Card from "../../../../components/Molecules/Card/Card";
import PagoArticulos from "../../../../components/Molecules/PagoArticulos/PagoArticulos";
import PagoDesglose from "../../../../components/Molecules/PagoDesglose/PagoDesglose";
import PagoInfoComanda from "../../../../components/Molecules/PagoInfoComanda/PagoInfoComanda";
import PagoMetodosPago from "../../../../components/Molecules/PagoMetodosPago/PagoMetodosPago";
import PagoMontoRecibido from "../../../../components/Molecules/PagoMontoRecibido/PagoMontoRecibido";
import { setAuthHeaderTitulo } from "../../../../utils/authHeaderTitle";
import { EdicionTicketStore } from "../../../../utils/edicionTicketStore";
import { normalize } from "../../../../utils/funcionesMaquetado/responsiveWH";
import { useEdicionTicket } from "../../../../utils/useEdicionTicket";
import { sesionPuedeEntrar } from "../../../../utils/gerentePermisos";
import { verificarConexionInternet } from "../../../../utils/ConeccionAInternet/ConeccionAInternet";
import { gb } from "../../../globalStyles";
import { integracionVentas } from "../../Ventas/integracion";
import ConfiguracionesDatabase from "../../Configuraciones/database";
import Database from "./database";
import { s } from "./styles";
import { imprimirCuenta } from "./ticket";

const Pago = () => {
  const { id_mesa: idMesa } = useLocalSearchParams();
  const [mesa, setMesa] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [formatosPago, setFormatosPago] = useState([]);
  const [configuraciones, setConfiguraciones] = useState([]);
  const [openModalCliente, setOpenModalCliente] = useState(false);
  const [openModalDividir, setOpenModalDividir] = useState(false);
  const [openNipModal, setOpenNipModal] = useState(false);
  const [openNipFinalizar, setOpenNipFinalizar] = useState(false);
  const scrollRef = useRef(null);
  const [filasGuardadas, setFilasGuardadas] = useState([]);
  const [buscadorCliente, setBuscadorCliente] = useState("");
  const [comanda, setComanda] = useState(null);
  const [articulosComanda, setArticulosComanda] = useState([]);
  const [nota, setNota] = useState("");
  const notaDebounceRef = useRef(null);
  const [metodoPagoId, setMetodoPagoId] = useState(null);
  const [impuestosPct, setImpuestosPct] = useState("0");
  const [desglosarImpuestos, setDesglosarImpuestos] = useState(false);
  const [propina, setPropina] = useState("0");
  const [propinaEsPct, setPropinaEsPct] = useState(true);
  const [descuento, setDescuento] = useState("0");
  const [descuentoEsPct, setDescuentoEsPct] = useState(true);
  const [costoEnvio, setCostoEnvio] = useState("0");
  const [costoEnvioEsPct, setCostoEnvioEsPct] = useState(false);
  const [montoRecibido, setMontoRecibido] = useState("");
  const [imprimiendo, setImprimiendo] = useState(false);
  const [cuentaImpresa, setCuentaImpresa] = useState(false);
  const [openNipEditarModal, setOpenNipEditarModal] = useState(false);
  const [openNipAdicional, setOpenNipAdicional] = useState(false);
  const [openNipDescuento, setOpenNipDescuento] = useState(false);
  const [articuloAEliminar, setArticuloAEliminar] = useState(null);
  const [openNipEliminar, setOpenNipEliminar] = useState(false);
  const [openNipCancelarModal, setOpenNipCancelarModal] = useState(false);
  const [openConfirmCancelar, setOpenConfirmCancelar] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [mostrarCajaCerrada, setMostrarCajaCerrada] = useState(false);
  const [finalizando, setFinalizando] = useState(false);
  const router = useRouter();
  const campoAdicionalAbierto = useRef(false);
  const campoDescuentoAbierto = useRef(false);
  const accionAdicionalRef = useRef(null);
  const accionDescuentoRef = useRef(null);

  const {
    puedeEditar,
    requiereNipEdicion,
    notaDesbloqueada,
    modalNipEdicion,
    cerrarNipEdicion,
    solicitarEdicion,
    editarCampo,
    enfocarCampo,
    cerrarCampo,
    confirmarNipEdicion,
  } = useEdicionTicket(configuraciones);

  const aplicarAdicional = async (accion, { campo = false } = {}) => {
    if (cuentaImpresa) return;

    if (configuraciones?.MODO_RESTRICTIVO) {
      if (campo && campoAdicionalAbierto.current) {
        accion();
        return;
      }
      accionAdicionalRef.current = () => {
        if (campo) campoAdicionalAbierto.current = true;
        accion();
      };
      setOpenNipAdicional(true);
      return;
    }

    const permitido = await sesionPuedeEntrar({ keywords: ["sales"] });
    if (!permitido) {
      Alert.alert(
        "Sin permiso",
        "No tiene permisos para modificar el adicional de pago.",
      );
      return;
    }
    accion();
  };

  const aplicarDescuento = (accion, { campo = false } = {}) => {
    if (cuentaImpresa) return;
    if (campo && campoDescuentoAbierto.current) {
      accion();
      return;
    }
    accionDescuentoRef.current = () => {
      if (campo) campoDescuentoAbierto.current = true;
      accion();
    };
    setOpenNipDescuento(true);
  };

  const cerrarAdicional = () => {
    campoAdicionalAbierto.current = false;
    campoDescuentoAbierto.current = false;
  };

  const desbloquearComanda = async () => {
    if (!comanda?.ID) return;
    await Database.setComandaAbierta(comanda.ID);
    await AsyncStorage.multiRemove([
      `pago_monto_${comanda.ID}`,
      `pago_metodo_${comanda.ID}`,
    ]);
    setCuentaImpresa(false);
    setComanda((prev) => (prev ? { ...prev, ESTATUS: 0 } : prev));
  };

  const solicitarCancelarCuenta = () => {
    if (cancelando || !comanda?.ID) return;
    setOpenConfirmCancelar(true);
  };

  const confirmarCancelarCuenta = async () => {
    if (cancelando || !comanda?.ID) return;
    setCancelando(true);
    setOpenNipCancelarModal(false);
    setOpenConfirmCancelar(false);
    try {
      await Database.cancelarComanda(comanda.ID);
      await AsyncStorage.multiRemove([
        `pago_monto_${comanda.ID}`,
        `pago_metodo_${comanda.ID}`,
      ]);
      router.replace("/Inicio");
    } catch (e) {
      console.error("Error cancelando cuenta:", e);
      Alert.alert("Error", "No se pudo cancelar la cuenta. Intenta de nuevo.");
      setCancelando(false);
    }
  };

  const sameMetodoId = (a, b) =>
    a != null && b != null && Number(a) === Number(b);

  const persistirCobro = async (idComanda, metodoId, monto) => {
    if (!idComanda) return;
    const ops = [];
    if (metodoId != null) {
      ops.push([`pago_metodo_${idComanda}`, String(metodoId)]);
    }
    if (monto != null) {
      ops.push([`pago_monto_${idComanda}`, String(monto)]);
    }
    if (ops.length) await AsyncStorage.multiSet(ops);
  };

  const obtenerCamposDefault = async () => {
    await ConfiguracionesDatabase.runMigraciones();
    const mesaDb = await Database.getMesa(idMesa);
    const comandaData = idMesa
      ? await Database.getComandaActivaPorMesa(idMesa)
      : null;
    const clienteDb = comandaData?.ID_CLIENTE
      ? await Database.getCliente(comandaData.ID_CLIENTE)
      : null;
    const formatosPagoDb = await Database.getFormatosPago();
    const configuracionesDb = await Database.getConfiguraciones();
    const clientesDb = await Database.getClientes();

    setMesa(mesaDb);
    setComanda(comandaData);
    setCliente(clienteDb);
    setFormatosPago(formatosPagoDb);
    setConfiguraciones(configuracionesDb);
    setClientes(clientesDb);

    // Adicional de pago: siempre inicia en 0 (el usuario digita al enfocar).
    let metodoInicial = configuracionesDb?.ID_FORMATO_PAGO ?? null;
    setImpuestosPct("0");
    setPropina("0");
    setPropinaEsPct(true);
    setDescuento("0");
    setDescuentoEsPct(true);
    setCostoEnvio("0");
    setCostoEnvioEsPct(false);
    setDesglosarImpuestos(false);

    // Restaurar estado de bloqueo si la comanda ya fue impresa
    const yaImpresa = comandaData?.ESTATUS === 4;
    setCuentaImpresa(yaImpresa);
    if (comandaData?.ID) {
      const [metodoGuardado, montoGuardado] = await AsyncStorage.multiGet([
        `pago_metodo_${comandaData.ID}`,
        `pago_monto_${comandaData.ID}`,
      ]);
      if (metodoGuardado?.[1] != null && metodoGuardado[1] !== "") {
        metodoInicial = Number(metodoGuardado[1]);
      }
      if (yaImpresa && montoGuardado?.[1]) {
        setMontoRecibido(montoGuardado[1]);
      }
    }

    const metodoExiste = formatosPagoDb.some((f) =>
      sameMetodoId(f.ID, metodoInicial),
    );
    setMetodoPagoId(metodoExiste ? Number(metodoInicial) : null);

    if (comandaData?.ID) {
      const arts = await Database.getArticulosComanda(comandaData.ID);
      setArticulosComanda(arts);
      setNota(comandaData.NOTA ?? "");

      const pagoDividido = await Database.getPagoCuentaDividida(comandaData.ID);
      setFilasGuardadas(pagoDividido ?? []);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setAuthHeaderTitulo("Pagar");
      const cargar = async () => {
        try {
          await obtenerCamposDefault();
        } catch (error) {
          console.error("Error cargando pago:", error);
        }
      };

      cargar();
    }, [idMesa]),
  );

  const articulos = articulosComanda;
  const subtotal = articulos.reduce((sum, r) => sum + (r.TOTAL ?? 0), 0);
  const montoImpuestos = desglosarImpuestos
    ? (subtotal * (parseFloat(impuestosPct) || 0)) / 100
    : 0;
  const montoDescuento = descuentoEsPct
    ? (subtotal * (parseFloat(descuento) || 0)) / 100
    : parseFloat(descuento) || 0;
  const montoPropina = propinaEsPct
    ? (subtotal * (parseFloat(propina) || 0)) / 100
    : parseFloat(propina) || 0;
  const montoCostoEnvio = costoEnvioEsPct
    ? (subtotal * (parseFloat(costoEnvio) || 0)) / 100
    : parseFloat(costoEnvio) || 0;
  const total =
    subtotal + montoImpuestos - montoDescuento + montoPropina + montoCostoEnvio;
  const cambio = Math.max(0, (parseFloat(montoRecibido) || 0) - total);
  const metodoPagoSeleccionado = formatosPago.find((formato) =>
    sameMetodoId(formato.ID, metodoPagoId),
  );
  const tieneMetodoPago = !!metodoPagoSeleccionado;
  const esEfectivo = /efectivo/i.test(
    String(metodoPagoSeleccionado?.NOMBRE ?? ""),
  );
  const canPrint = tieneMetodoPago && total > 0;

  const comandaPayload = comanda
    ? {
        comanda,
        articulos: articulosComanda,
        totalComanda: subtotal,
      }
    : null;

  const irClientes = () => {
    setAuthHeaderTitulo("Clientes");
    setOpenModalCliente(true);
  };

  const ejecutarImpresion = async () => {
    if (!comanda || !tieneMetodoPago) return;
    setImprimiendo(true);
    try {
      const metodoPagoNombre =
        formatosPago.find((f) => f.ID === metodoPagoId)?.NOMBRE ?? "-";
      const impresionOk = await imprimirCuenta(
        { ...comanda, NOTA: nota },
        articulosComanda,
        mesa,
        cliente,
        {
          subtotal,
          impuestos: montoImpuestos,
          descuento: montoDescuento,
          propina: montoPropina,
          costoEnvio: montoCostoEnvio,
          total,
          montoRecibido: parseFloat(montoRecibido) || 0,
          cambio,
        },
        metodoPagoNombre,
        filasGuardadas,
        formatosPago,
      );

      await Database.setComandaImpresa(comanda.ID);
      await persistirCobro(comanda.ID, metodoPagoId, montoRecibido);
      setCuentaImpresa(true);
      setComanda((prev) => (prev ? { ...prev, ESTATUS: 4 } : prev));

      if (!impresionOk) {
        Alert.alert(
          "No se pudo imprimir",
          "No pudimos conectar con la impresora. Verifica que esté encendida y cerca del dispositivo. Puedes continuar y finalizar la venta.",
        );
      }
    } catch (e) {
      console.warn("Error inesperado al imprimir cuenta:", e?.message ?? e);
      try {
        await Database.setComandaImpresa(comanda.ID);
        await persistirCobro(comanda.ID, metodoPagoId, montoRecibido);
        setCuentaImpresa(true);
        setComanda((prev) => (prev ? { ...prev, ESTATUS: 4 } : prev));
        Alert.alert(
          "No se pudo imprimir",
          "Ocurrió un problema al imprimir la cuenta, pero puedes continuar y finalizar la venta.",
        );
      } catch (errorGuardado) {
        console.error("Error guardando estado de cuenta:", errorGuardado);
        Alert.alert(
          "Error",
          "No se pudo guardar el estado de la cuenta. Intenta nuevamente.",
        );
      }
    } finally {
      setImprimiendo(false);
    }
  };

  const finalizarVenta = async () => {
    if (!comanda?.ID || finalizando) return;
    if (!tieneMetodoPago) {
      Alert.alert(
        "Método de pago",
        "Selecciona un método de pago para finalizar la venta.",
      );
      return;
    }
    const comandaId = comanda.ID;
    setFinalizando(true);
    try {
      const metodoPagoNombre = metodoPagoSeleccionado?.NOMBRE ?? null;
      const montoCobrado =
        Number(montoRecibido) > 0 ? Number(montoRecibido) : total;
      const resultado = await Database.finalizarComanda(comandaId, {
        formatoPago: metodoPagoNombre,
        subtotal,
        descuento: montoDescuento,
        propina: montoPropina,
        costoEnvio: montoCostoEnvio,
        impuestos: montoImpuestos,
        total,
        montoRecibido: montoCobrado,
        idMetodoPago: metodoPagoId,
      });
      if (resultado?.code === "CAJA_CERRADA") {
        setMostrarCajaCerrada(true);
        return;
      }
      await AsyncStorage.multiRemove([
        `pago_monto_${comandaId}`,
        `pago_metodo_${comandaId}`,
      ]);
      EdicionTicketStore.clear();

      const hayInternet = await verificarConexionInternet();
      if (hayInternet) {
        try {
          await integracionVentas.sincronizarVentas([comandaId]);
        } catch (syncError) {
          console.warn(
            "No se pudo sincronizar la venta automáticamente:",
            syncError,
          );
        }
      }

      router.replace("/Inicio");
    } catch (e) {
      console.error("Error finalizando venta:", e);
      Alert.alert(
        "Error",
        "No se pudo finalizar la venta. Verifica que la caja esté abierta e intenta de nuevo.",
      );
    } finally {
      setFinalizando(false);
    }
  };

  const solicitarFinalizarVenta = () => {
    if (!tieneMetodoPago) {
      Alert.alert(
        "Método de pago",
        "Selecciona un método de pago para finalizar la venta.",
      );
      return;
    }
    if (finalizando) return;
    setOpenNipFinalizar(true);
  };

  const handleImprimirCuenta = () => {
    if (imprimiendo || !canPrint) return;
    if (configuraciones?.NIP_FINALIZAR_TICKET) {
      setOpenNipModal(true);
    } else {
      ejecutarImpresion();
    }
  };

  const cambiarCantidad = (renglon, nuevaCantidad) => {
    const cantidadActual = Number(renglon.CANTIDAD) || 0;
    const cantidadNueva = Number(nuevaCantidad) || 0;
    if (cantidadNueva < 1 || cantidadNueva === cantidadActual) return;

    solicitarEdicion(async () => {
      try {
        const tipo =
          cantidadNueva > cantidadActual
            ? "INCREMENTAR_ARTICULO"
            : "DISMINUIR_ARTICULO";
        const costoComps = (renglon.complementos ?? []).reduce(
          (acc, c) =>
            acc +
            Number(
              c.TOTAL ??
                (c.CANTIDAD ?? 0) *
                  (c.PRECIO_VENTA ??
                    c.COMP_PRECIO ??
                    c.complemento?.PRECIO ??
                    0),
            ),
          0,
        );
        const descGuardado = Number(renglon.DESCUENTO);
        const subtotalAnterior =
          Number(renglon.SUBTOTAL) ||
          cantidadActual * (renglon.PRECIO_VENTA ?? 0);
        const descuento =
          Number.isFinite(descGuardado) && descGuardado > 0
            ? descGuardado
            : Math.max(
                0,
                subtotalAnterior + costoComps - (Number(renglon.TOTAL) || 0),
              );
        const nuevoSubtotal = cantidadNueva * (renglon.PRECIO_VENTA ?? 0);
        const nuevoTotal = Math.max(0, nuevoSubtotal - descuento + costoComps);

        await Database.actualizarCantidadArticulo(
          renglon.ID,
          cantidadNueva,
          renglon.PRECIO_VENTA,
          {
            subtotal: nuevoSubtotal,
            total: nuevoTotal,
            descuento,
          },
        );
        await Database.registrarMovimiento(
          renglon.ID_COMANDA,
          renglon.ID_ARTICULO,
          tipo,
        );
        setArticulosComanda((prev) =>
          prev.map((a) =>
            a.ID === renglon.ID
              ? {
                  ...a,
                  CANTIDAD: cantidadNueva,
                  SUBTOTAL: nuevoSubtotal,
                  TOTAL: nuevoTotal,
                  DESCUENTO: descuento,
                }
              : a,
          ),
        );
      } catch (error) {
        console.error("Error actualizando cantidad:", error);
      }
    });
  };

  const pedirNipEliminacion =
    Number(configuraciones?.MODO_RESTRICTIVO) === 1 ||
    Number(configuraciones?.HABILITAR_EDICION_TICKET) === 0;

  const eliminarArticulo = (renglon) => {
    setArticuloAEliminar(renglon);
  };

  const confirmarEliminarArticulo = async () => {
    const renglon = articuloAEliminar;
    if (!renglon) return;
    try {
      await Database.registrarMovimiento(
        renglon.ID_COMANDA,
        renglon.ID_ARTICULO,
        "ELIMINACION_ARTICULO",
      );
      await Database.eliminarArticulo(renglon.ID);
      setArticulosComanda((prev) => prev.filter((a) => a.ID !== renglon.ID));
    } catch (error) {
      console.error("Error eliminando artículo:", error);
    } finally {
      setArticuloAEliminar(null);
      setOpenNipEliminar(false);
    }
  };

  const cambiarNota = (texto) => {
    if (cuentaImpresa) return;
    editarCampo(() => {
      setNota(texto);
      if (notaDebounceRef.current) clearTimeout(notaDebounceRef.current);
      notaDebounceRef.current = setTimeout(async () => {
        if (!comanda?.ID) return;
        try {
          await Database.actualizarNota(comanda.ID, texto);
        } catch (error) {
          console.error("Error guardando nota:", error);
        }
      }, 600);
    });
  };

  const parseFechaUtc = (fechaStr) => {
    if (!fechaStr) return null;
    const raw = String(fechaStr).trim();
    const normalizada = raw.includes("T") ? raw : raw.replace(" ", "T");
    const sinZona = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(
      normalizada,
    );
    const iso = sinZona ? `${normalizada}Z` : normalizada;
    const fecha = new Date(iso);
    return Number.isNaN(fecha.getTime()) ? null : fecha;
  };

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return { fecha: "—", hora: "—" };
    const fechaObj = parseFechaUtc(fechaStr);
    if (!fechaObj) {
      const [fechaRaw, horaRaw] = String(fechaStr).split(" ");
      return { fecha: fechaRaw ?? "—", hora: horaRaw?.slice(0, 5) ?? "—" };
    }

    const partes = {};
    for (const parte of new Intl.DateTimeFormat("es-MX", {
      timeZone: "America/Mexico_City",
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(fechaObj)) {
      if (parte.type !== "literal") partes[parte.type] = parte.value;
    }

    return {
      fecha: `${partes.day}/${partes.month}/${partes.year}`,
      hora: `${partes.hour}:${partes.minute}`,
    };
  };

  const { fecha, hora } = formatearFecha(comanda?.FECHA);

  return (
    <SafeAreaView edges={["bottom"]} style={s.root}>
      {/* ── HEADER ────────────────────────────────────────── */}
      <LinearGradient
        style={s.header}
        colors={gb.gradient_blue}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <RecoverButton />
        <View style={s.headerCenter}>
          <Text style={s.headerMesa}>{mesa?.NOMBRE ?? "Mesa"}</Text>
          <Text style={s.headerSub}>
            Folio #{comanda?.FICHA == 0 ? 0 : comanda?.FICHA} · {fecha} {hora}
          </Text>
        </View>
        <Button
          style={s.btnCancelar}
          styleContainer={s.btnCancelarContainer}
          onPress={solicitarCancelarCuenta}
          disabled={cancelando || !comanda?.ID}
        >
          <Ionicons
            name="trash-outline"
            size={normalize(15)}
            color={gb.gray50}
          />
        </Button>
      </LinearGradient>

      {!cuentaImpresa && requiereNipEdicion && !puedeEditar && (
        <View
          style={{
            backgroundColor: gb.red100 ?? "#FDECEC",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: normalize(14),
            paddingVertical: normalize(8),
            gap: normalize(8),
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              gap: normalize(8),
            }}
          >
            <Ionicons
              name="lock-closed-outline"
              size={normalize(16)}
              color={gb.red600}
            />
            <Text
              style={{
                flex: 1,
                fontSize: normalize(12),
                color: gb.red600,
                fontWeight: "600",
              }}
            >
              Cada cambio de la comanda pide NIP
            </Text>
          </View>
        </View>
      )}

      {/* ── SCROLL PRINCIPAL ──────────────────────────────── */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollRef}
          style={s.scroll}
          contentContainerStyle={s.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <PagoInfoComanda
            mesa={mesa}
            comanda={comanda}
            cliente={cliente}
            fecha={fecha}
            hora={hora}
            onAbrirModalCliente={() => setOpenModalCliente(true)}
            onQuitarCliente={() => {}}
            disabled={false}
          />
          <PagoArticulos
            articulos={articulos}
            onCambiarCantidad={cuentaImpresa ? undefined : cambiarCantidad}
            onEliminarArticulo={cuentaImpresa ? undefined : eliminarArticulo}
            disabled={cuentaImpresa}
          />

          <PagoMetodosPago
            formatosPago={formatosPago}
            metodoPagoId={metodoPagoId}
            onSeleccionar={(id) => {
              setMetodoPagoId(id);
              const metodo = formatosPago.find((f) => sameMetodoId(f.ID, id));
              if (!/efectivo/i.test(String(metodo?.NOMBRE ?? ""))) {
                setMontoRecibido("");
              }
              if (comanda?.ID && id != null) {
                persistirCobro(comanda.ID, id, montoRecibido);
              }
            }}
            disabled={false}
          />
          <PagoAdicionales
            impuestosPct={impuestosPct}
            onImpuestosChange={
              cuentaImpresa
                ? undefined
                : (v) =>
                    aplicarAdicional(() => setImpuestosPct(v), { campo: true })
            }
            desglosarImpuestos={desglosarImpuestos}
            onToggleDesglosar={
              cuentaImpresa
                ? undefined
                : () =>
                    aplicarAdicional(() =>
                      setDesglosarImpuestos((prev) => !prev),
                    )
            }
            propina={propina}
            propinaEsPct={propinaEsPct}
            onPropinaChange={cuentaImpresa ? undefined : setPropina}
            onPropinaToggle={cuentaImpresa ? undefined : setPropinaEsPct}
            descuento={descuento}
            descuentoEsPct={descuentoEsPct}
            onDescuentoChange={
              cuentaImpresa
                ? undefined
                : (v) =>
                    aplicarDescuento(
                      () => {
                        if (descuentoEsPct) {
                          const n = parseFloat(
                            String(v).replace(/[^0-9.]/g, ""),
                          );
                          if (!isNaN(n) && n > 100) {
                            setDescuento("100");
                            return;
                          }
                        }
                        setDescuento(v);
                      },
                      { campo: true },
                    )
            }
            onDescuentoToggle={
              cuentaImpresa
                ? undefined
                : (esPct) => aplicarDescuento(() => setDescuentoEsPct(esPct))
            }
            costoEnvio={costoEnvio}
            costoEnvioEsPct={costoEnvioEsPct}
            onCostoEnvioChange={cuentaImpresa ? undefined : setCostoEnvio}
            onCostoEnvioToggle={cuentaImpresa ? undefined : setCostoEnvioEsPct}
            disabled={cuentaImpresa}
            onCerrarCampo={cerrarAdicional}
          />
          <PagoDesglose
            subtotal={subtotal}
            impuestosPct={impuestosPct}
            montoImpuestos={montoImpuestos}
            descuento={descuento}
            descuentoEsPct={descuentoEsPct}
            montoDescuento={montoDescuento}
            propina={propina}
            propinaEsPct={propinaEsPct}
            montoPropina={montoPropina}
            costoEnvio={costoEnvio}
            costoEnvioEsPct={costoEnvioEsPct}
            montoCostoEnvio={montoCostoEnvio}
            total={total}
            onDividirCuenta={() => setOpenModalDividir(true)}
            tieneDivision={filasGuardadas.length > 0}
            divisiones={filasGuardadas}
            formatosPago={formatosPago}
          />
          {esEfectivo && (
            <PagoMontoRecibido
              total={total}
              montoRecibido={montoRecibido}
              cambio={cambio}
              onChangeMonto={(valor) => {
                const aplicar = () => {
                  setMontoRecibido(valor);
                  if (comanda?.ID) {
                    persistirCobro(comanda.ID, metodoPagoId, valor);
                  }
                };
                if (cuentaImpresa) aplicar();
                else editarCampo(aplicar);
              }}
              onBlur={cerrarCampo}
              onFocus={() =>
                setTimeout(
                  () => scrollRef.current?.scrollToEnd({ animated: true }),
                  100,
                )
              }
              disabled={false}
            />
          )}
          <Card
            title="NOTA DE LA COMANDA"
            linealGradient={gb.gradient_blue}
            styleTitleHeader={{ color: gb.gray50 }}
            styleHeader={{ width: "100%" }}
            styleBody={{ width: "100%", paddingHorizontal: normalize(12), paddingVertical: normalize(12) }}
          >
            <Pressable
              onPress={
                cuentaImpresa
                  ? undefined
                  : () => {
                      if (requiereNipEdicion && !notaDesbloqueada) {
                        enfocarCampo();
                      }
                    }
              }
            >
              <TextInput
                style={s.notasInput}
                multiline
                numberOfLines={2}
                placeholder="Escribe una nota para la comanda..."
                placeholderTextColor={gb.gray400}
                value={nota}
                onChangeText={cuentaImpresa ? undefined : cambiarNota}
                onFocus={
                  cuentaImpresa
                    ? undefined
                    : () => {
                        enfocarCampo();
                        setTimeout(
                          () =>
                            scrollRef.current?.scrollToEnd({ animated: true }),
                          100,
                        );
                      }
                }
                onBlur={cerrarCampo}
                editable={
                  !cuentaImpresa && (!requiereNipEdicion || notaDesbloqueada)
                }
              />
            </Pressable>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── FOOTER FIJO ───────────────────────────────────── */}
      <View style={s.footer}>
        {cuentaImpresa ? (
          <View style={s.footerRow}>
            <Button
              styleContainer={{
                flex: 1,
                borderRadius: normalize(10),
                overflow: "hidden",
              }}
              style={s.btnImprimir}
              gradient={[gb.gray300, gb.gray200]}
              onPress={async () => {
                if (configuraciones?.MODO_RESTRICTIVO) {
                  setOpenNipEditarModal(true);
                  return;
                }
                const permitido = await sesionPuedeEntrar({
                  keywords: ["sales"],
                });
                if (!permitido) {
                  Alert.alert(
                    "Sin permiso",
                    "No tiene permisos para editar la cuenta.",
                  );
                  return;
                }
                await desbloquearComanda();
              }}
            >
              <Ionicons
                name="create-outline"
                size={normalize(18)}
                color={gb.gray700}
              />
              <Text style={[s.btnImprimirTexto, { color: gb.gray700 }]}>
                Editar Cuenta
              </Text>
            </Button>
            <Button
              styleContainer={{
                flex: 1,
                borderRadius: normalize(10),
                overflow: "hidden",
                opacity: finalizando ? 0.6 : 1,
              }}
              style={s.btnImprimir}
              gradient={["#388E3C", "#4CAF50"]}
              onPress={solicitarFinalizarVenta}
              disabled={finalizando}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={normalize(18)}
                color={gb.gray50}
              />
              <Text style={s.btnImprimirTexto}>
                {finalizando ? "Finalizando..." : "Finalizar venta"}
              </Text>
            </Button>
          </View>
        ) : (
          <Button
            styleContainer={[
              s.btnImprimirContainer,
              !canPrint ? { opacity: 0.45 } : null,
            ]}
            style={s.btnImprimir}
            gradient={gb.gradient_blue}
            onPress={handleImprimirCuenta}
            disabled={imprimiendo || !canPrint}
          >
            <Ionicons
              name="print-outline"
              size={normalize(20)}
              color={gb.gray50}
            />
            <Text style={s.btnImprimirTexto}>
              {imprimiendo ? "Imprimiendo..." : "Imprimir cuenta"}
            </Text>
          </Button>
        )}
      </View>

      {/* ── MODAL DIVIDIR CUENTA ──────────────────────────── */}
      <ModalDividirCuenta
        visible={openModalDividir}
        onClose={() => setOpenModalDividir(false)}
        total={total}
        formatosPago={formatosPago}
        formatoPagoDefault={metodoPagoId}
        filasGuardadas={filasGuardadas}
        disabled={false}
        onLimpiar={async () => {
          if (!comanda?.ID) return;
          await Database.limpiarPagoCuentaDividida(comanda.ID);
          setFilasGuardadas([]);
        }}
        onGuardar={async (filas) => {
          if (!comanda?.ID) return;
          try {
            await Database.guardarPagoCuentaDividida(comanda.ID, filas);
            setFilasGuardadas(
              filas.map((f) => ({
                TOTAL: f.total,
                FORMA_PAGO: f.formaPago,
                CANTIDAD: f.cantidad,
              })),
            );
            setMontoRecibido(String(total.toFixed(2)));
            if (filas?.[0]?.formaPago != null) {
              setMetodoPagoId(Number(filas[0].formaPago));
              await persistirCobro(
                comanda.ID,
                filas[0].formaPago,
                total.toFixed(2),
              );
            }
            setOpenModalDividir(false);
          } catch (error) {
            console.error("Error guardando pago dividido:", error);
          }
        }}
      />

      {/* ── MODAL NIP (imprimir) ──────────────────────────── */}
      <NipModal
        visible={openNipModal}
        onClose={() => setOpenNipModal(false)}
        titulo="Imprimir cuenta"
        modo="acceso"
        keywords={["sales"]}
        onSubmit={async () => {
          setOpenNipModal(false);
          await ejecutarImpresion();
        }}
      />

      <NipModal
        visible={openNipFinalizar}
        onClose={() => setOpenNipFinalizar(false)}
        titulo="Finalizar venta"
        modo="acceso"
        keywords={["sales", "cash"]}
        onSubmit={async () => {
          setOpenNipFinalizar(false);
          await finalizarVenta();
        }}
      />

      {/* ── MODAL NIP (editar comanda) ───────────────────── */}
      <NipModal
        visible={openNipEditarModal}
        onClose={() => setOpenNipEditarModal(false)}
        titulo="Editar comanda"
        modo="acceso"
        keywords={["sales"]}
        onSubmit={async () => {
          setOpenNipEditarModal(false);
          await desbloquearComanda();
        }}
      />

      <NipModal
        visible={openNipAdicional}
        onClose={() => {
          setOpenNipAdicional(false);
          accionAdicionalRef.current = null;
        }}
        titulo="Adicional de pago"
        modo="acceso"
        keywords={["sales"]}
        onSubmit={async () => {
          setOpenNipAdicional(false);
          const accion = accionAdicionalRef.current;
          accionAdicionalRef.current = null;
          await accion?.();
        }}
      />

      <NipModal
        visible={openNipDescuento}
        onClose={() => {
          setOpenNipDescuento(false);
          accionDescuentoRef.current = null;
        }}
        titulo="Aplicar descuento"
        modo="acceso"
        keywords={["sales"]}
        onSubmit={async () => {
          setOpenNipDescuento(false);
          const accion = accionDescuentoRef.current;
          accionDescuentoRef.current = null;
          await accion?.();
        }}
      />

      <ModalWarning
        visible={!!articuloAEliminar && !openNipEliminar}
        type="danger"
        title="Eliminar artículo"
        message={`¿Estás seguro de eliminar "${articuloAEliminar?.articulo?.NOMBRE ?? "este artículo"}" de la comanda?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onCancel={() => setArticuloAEliminar(null)}
        onConfirm={() => {
          if (pedirNipEliminacion) setOpenNipEliminar(true);
          else confirmarEliminarArticulo();
        }}
      />

      <ModalWarning
        visible={openConfirmCancelar && !openNipCancelarModal}
        type="danger"
        title="Cancelar comanda"
        message={`¿Estás seguro de cancelar el pedido de ${mesa?.NOMBRE ?? "esta mesa"}? Esta acción no se puede deshacer.`}
        confirmText="Sí, cancelar"
        cancelText="No"
        onCancel={() => setOpenConfirmCancelar(false)}
        onConfirm={() => {
          if (pedirNipEliminacion) setOpenNipCancelarModal(true);
          else confirmarCancelarCuenta();
        }}
      />

      <NipModal
        visible={openNipEliminar}
        titulo="Eliminar artículo"
        modo="acceso"
        keywords={["sales"]}
        onClose={() => {
          setOpenNipEliminar(false);
          setArticuloAEliminar(null);
        }}
        onSubmit={confirmarEliminarArticulo}
      />

      <NipModal
        visible={openNipCancelarModal}
        onClose={() => {
          setOpenNipCancelarModal(false);
          setOpenConfirmCancelar(false);
        }}
        titulo="Cancelar comanda"
        modo="acceso"
        keywords={["sales"]}
        onSubmit={confirmarCancelarCuenta}
      />

      <NipModal
        visible={modalNipEdicion}
        titulo="Editar ticket"
        modo="acceso"
        keywords={["sales"]}
        onSubmit={confirmarNipEdicion}
        onClose={cerrarNipEdicion}
      />

      {/* ── MODAL CLIENTE ─────────────────────────────────── */}
      <ModalSeleccionCliente
        visible={openModalCliente}
        onClose={() => {
          setOpenModalCliente(false);
          setAuthHeaderTitulo("Pagar");
        }}
        clientes={clientes}
        clienteSeleccionado={cliente}
        busqueda={buscadorCliente}
        onCambiarBusqueda={setBuscadorCliente}
        onSeleccionar={async (clienteSeleccionado) => {
          if (!comanda?.ID) return;
          try {
            await Database.setClienteEnComanda(
              comanda.ID,
              clienteSeleccionado?.ID ?? null,
            );
            setCliente(clienteSeleccionado ?? null);
            setComanda((prev) =>
              prev
                ? { ...prev, ID_CLIENTE: clienteSeleccionado?.ID ?? null }
                : prev,
            );
            setOpenModalCliente(false);
            setAuthHeaderTitulo("Pagar");
          } catch (error) {
            console.error("Error asignando cliente:", error);
          }
        }}
      />

      <GeneralModal
        visible={mostrarCajaCerrada}
        onRequestClose={() => setMostrarCajaCerrada(false)}
        headerColorGrandien={[gb.red600, gb.red400]}
        iconCloseColor={gb.gray50}
        headerColorText={gb.gray50}
        headerTitle="Caja cerrada"
        scrollable={false}
      >
        <View style={{ alignItems: "center", padding: normalize(12) }}>
          <Ionicons
            name="lock-closed-outline"
            size={normalize(42)}
            color={gb.red600}
          />
          <Text style={{ textAlign: "center", marginVertical: normalize(14) }}>
            No hay una caja abierta. Abre la caja para poder cobrar.
          </Text>
          <Button onPress={() => setMostrarCajaCerrada(false)}>
            <Text style={{ color: gb.gray50 }}>Cerrar</Text>
          </Button>
        </View>
      </GeneralModal>

      {comanda && (
        <MesasNavButtons
          tabActiva="pagar"
          idMesa={idMesa}
          comandaPayload={comandaPayload}
          tieneCliente={!!(cliente?.ID ?? comanda?.ID_CLIENTE)}
          onPressCliente={irClientes}
        />
      )}
    </SafeAreaView>
  );
};

export default Pago;
