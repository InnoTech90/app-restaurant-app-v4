import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../../../../components/atoms/Button/Button";
import RecoverButton from "../../../../components/atoms/RecoverButton/RecoverButton";
import ModalDividirCuenta from "../../../../components/Molecules/ModalDividirCuenta/ModalDividirCuenta";
import ModalSeleccionCliente from "../../../../components/Molecules/ModalSeleccionCliente/ModalSeleccionCliente";
import NipModal from "../../../../components/Molecules/NipModal/NipModal";
import PagoAdicionales from "../../../../components/Molecules/PagoAdicionales/PagoAdicionales";
import PagoArticulos from "../../../../components/Molecules/PagoArticulos/PagoArticulos";
import PagoDesglose from "../../../../components/Molecules/PagoDesglose/PagoDesglose";
import PagoInfoComanda from "../../../../components/Molecules/PagoInfoComanda/PagoInfoComanda";
import PagoMetodosPago from "../../../../components/Molecules/PagoMetodosPago/PagoMetodosPago";
import PagoMontoRecibido from "../../../../components/Molecules/PagoMontoRecibido/PagoMontoRecibido";
import { normalize } from "../../../../utils/funcionesMaquetado/responsiveWH";
import { gb } from "../../../globalStyles";
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
        const [finalizando, setFinalizando] = useState(false);
        const router = useRouter();

        const obtenerCamposDefault = async () => {
            const mesaDb = await Database.getMesa(idMesa);
            const comandaData = idMesa ? await Database.getComandaActivaPorMesa(idMesa) : null;
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

            // Defaults de finanzas desde configuraciones
            setMetodoPagoId(configuracionesDb?.ID_FORMATO_PAGO ?? null);
            setImpuestosPct(String(configuracionesDb?.IMPUESTOS ?? 0));
            setDescuento(String(configuracionesDb?.DESCUENTOS ?? 0));
            setDescuentoEsPct(!!configuracionesDb?.DESCUENTOS_ES_PCT);
            setCostoEnvio(String(configuracionesDb?.COSTO_ENVIO ?? 0));
            setCostoEnvioEsPct(!!configuracionesDb?.COSTO_ENVIO_ES_PCT);

            // Restaurar estado de bloqueo si la comanda ya fue impresa
            const yaImpresa = comandaData?.ESTATUS === 4;
            setCuentaImpresa(yaImpresa);
            if (yaImpresa && comandaData?.ID) {
                const montoGuardado = await AsyncStorage.getItem(`pago_monto_${comandaData.ID}`);
                if (montoGuardado) setMontoRecibido(montoGuardado);
            }

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
                const cargar = async () => {
                    try {
                        await obtenerCamposDefault();
                    } catch (error) {
                        console.error("Error cargando pago:", error);
                    }
                };

                cargar();
            }, [idMesa])
        );
    
    const articulos = articulosComanda;
    const subtotal = articulos.reduce((sum, r) => sum + (r.TOTAL ?? 0), 0);
    const montoImpuestos = desglosarImpuestos
        ? subtotal * (parseFloat(impuestosPct) || 0) / 100
        : 0;
    const montoDescuento = descuentoEsPct
        ? subtotal * (parseFloat(descuento) || 0) / 100
        : parseFloat(descuento) || 0;
    const montoPropina = propinaEsPct
        ? subtotal * (parseFloat(propina) || 0) / 100
        : parseFloat(propina) || 0;
    const montoCostoEnvio = costoEnvioEsPct
        ? subtotal * (parseFloat(costoEnvio) || 0) / 100
        : parseFloat(costoEnvio) || 0;
    const total = subtotal + montoImpuestos - montoDescuento + montoPropina + montoCostoEnvio;
    const cambio = Math.max(0, (parseFloat(montoRecibido) || 0) - total);
    const canPrint = (parseFloat(montoRecibido) || 0) >= total && total > 0;

    const ejecutarImpresion = async () => {
        if (!comanda) return;
        setImprimiendo(true);
        try {
            const metodoPagoNombre =
                formatosPago.find((f) => f.ID === metodoPagoId)?.NOMBRE ?? '-';
            await imprimirCuenta(
                comanda,
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
            // Bloquear la comanda tras imprimir
            await Database.setComandaImpresa(comanda.ID);
            await AsyncStorage.setItem(`pago_monto_${comanda.ID}`, montoRecibido);
            setCuentaImpresa(true);
            setComanda(prev => prev ? { ...prev, ESTATUS: 4 } : prev);
        } catch (e) {
            console.error('Error imprimiendo cuenta:', e);
        } finally {
            setImprimiendo(false);
        }
    };

    const finalizarVenta = async () => {
        if (!comanda?.ID || finalizando) return;
        setFinalizando(true);
        try {
            const metodoPagoNombre =
                formatosPago.find((f) => f.ID === metodoPagoId)?.NOMBRE ?? null;
            await Database.finalizarComanda(comanda.ID, {
                formatoPago: metodoPagoNombre,
                subtotal,
                descuento: montoDescuento,
                propina: montoPropina,
                costoEnvio: montoCostoEnvio,
                total,
                montoRecibido: parseFloat(montoRecibido) || 0,
                idMetodoPago: metodoPagoId,
            });
            await AsyncStorage.removeItem(`pago_monto_${comanda.ID}`);
            router.replace('/Inicio');
        } catch (e) {
            console.error('Error finalizando venta:', e);
        } finally {
            setFinalizando(false);
        }
    };

    const handleImprimirCuenta = () => {
        if (imprimiendo) return;
        if (configuraciones?.NIP_FINALIZAR_TICKET) {
            setOpenNipModal(true);
        } else {
            ejecutarImpresion();
        }
    };

    const cambiarCantidad = async (renglon, nuevaCantidad) => {
        if (nuevaCantidad < 1) return;
        try {
            const tipo = nuevaCantidad > renglon.CANTIDAD ? 'INCREMENTAR_ARTICULO' : 'DISMINUIR_ARTICULO';
            await Database.actualizarCantidadArticulo(renglon.ID, nuevaCantidad, renglon.PRECIO_VENTA);
            await Database.registrarMovimiento(renglon.ID_COMANDA, renglon.ID_ARTICULO, tipo);
            setArticulosComanda(prev =>
                prev.map(a =>
                    a.ID === renglon.ID
                        ? { ...a, CANTIDAD: nuevaCantidad, TOTAL: nuevaCantidad * (renglon.PRECIO_VENTA ?? 0) }
                        : a
                )
            );
        } catch (error) {
            console.error("Error actualizando cantidad:", error);
        }
    };

    const eliminarArticulo = async (renglon) => {
        try {
            await Database.registrarMovimiento(renglon.ID_COMANDA, renglon.ID_ARTICULO, 'ELIMINACION_ARTICULO');
            await Database.eliminarArticulo(renglon.ID);
            setArticulosComanda(prev => prev.filter(a => a.ID !== renglon.ID));
        } catch (error) {
            console.error("Error eliminando artículo:", error);
        }
    };

    const cambiarNota = (texto) => {
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
    };

    const extraerFecha = (fechaStr) => {
        
        if (!fechaStr) return "—";
        const [datePart] = fechaStr.split(" ");
        const [yyyy, mm, dd] = datePart.split("-");
        return `${dd}/${mm}/${yyyy.slice(2)}`;
    };

    const extraerHora = (fechaStr) => {
        if (!fechaStr) return "—";
        const [, timePart] = fechaStr.split(" ");
        return timePart?.slice(0, 5) ?? "—";
    };

    const fecha = extraerFecha(comanda?.FECHA);
    const hora = extraerHora(comanda?.FECHA);
    console.log("visible",openModalCliente);
    
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
            </LinearGradient>

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
                    onAbrirModalCliente={cuentaImpresa ? undefined : () => setOpenModalCliente(true)}
                    onQuitarCliente={() => {}}
                    disabled={cuentaImpresa}
                />
                <PagoArticulos
                    articulos={articulos}
                    nota={nota}
                    onCambiarCantidad={cuentaImpresa ? undefined : cambiarCantidad}
                    onEliminarArticulo={cuentaImpresa ? undefined : eliminarArticulo}
                    onNotaChange={cuentaImpresa ? undefined : cambiarNota}
                    onNotaBlur={() => {}}
                    disabled={cuentaImpresa}
                />
                
                <PagoMetodosPago
                    formatosPago={formatosPago}
                    metodoPagoId={metodoPagoId}
                    onSeleccionar={cuentaImpresa ? undefined : (id) => setMetodoPagoId(id)}
                    disabled={cuentaImpresa}
                />
                <PagoAdicionales
                    impuestosPct={impuestosPct}
                    onImpuestosChange={cuentaImpresa ? undefined : setImpuestosPct}
                    desglosarImpuestos={desglosarImpuestos}
                    onToggleDesglosar={cuentaImpresa ? undefined : () => setDesglosarImpuestos(prev => !prev)}
                    propina={propina}
                    propinaEsPct={propinaEsPct}
                    onPropinaChange={cuentaImpresa ? undefined : setPropina}
                    onPropinaToggle={cuentaImpresa ? undefined : (esPct) => setPropinaEsPct(esPct)}
                    descuento={descuento}
                    descuentoEsPct={descuentoEsPct}
                    onDescuentoChange={cuentaImpresa ? undefined : setDescuento}
                    onDescuentoToggle={cuentaImpresa ? undefined : (esPct) => setDescuentoEsPct(esPct)}
                    costoEnvio={costoEnvio}
                    costoEnvioEsPct={costoEnvioEsPct}
                    onCostoEnvioChange={cuentaImpresa ? undefined : setCostoEnvio}
                    onCostoEnvioToggle={cuentaImpresa ? undefined : (esPct) => setCostoEnvioEsPct(esPct)}
                    disabled={cuentaImpresa}
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
                />
                <PagoMontoRecibido
                    total={total}
                    montoRecibido={montoRecibido}
                    cambio={cambio}
                    onChangeMonto={setMontoRecibido}
                    onFocus={() => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100)}
                    disabled={cuentaImpresa}
                />
            </ScrollView>
            </KeyboardAvoidingView>

            {/* ── FOOTER FIJO ───────────────────────────────────── */}
            <View style={s.footer}>
                {cuentaImpresa ? (
                    <View style={s.footerRow}>
                        <Button
                            styleContainer={{ flex: 1, borderRadius: normalize(10), overflow: 'hidden' }}
                            style={s.btnImprimir}
                            gradient={[gb.gray300, gb.gray200]}
                            onPress={() => setOpenNipEditarModal(true)}
                        >
                            <Ionicons name="create-outline" size={normalize(18)} color={gb.gray700} />
                            <Text style={[s.btnImprimirTexto, { color: gb.gray700 }]}>Editar comanda</Text>
                        </Button>
                        <Button
                            styleContainer={{ flex: 1, borderRadius: normalize(10), overflow: 'hidden' }}
                            style={s.btnImprimir}
                            gradient={['#388E3C', '#4CAF50']}
                            onPress={finalizarVenta}
                            disabled={finalizando}
                        >
                            <Ionicons name="checkmark-circle-outline" size={normalize(18)} color={gb.gray50} />
                            <Text style={s.btnImprimirTexto}>
                                {finalizando ? 'Finalizando...' : 'Finalizar venta'}
                            </Text>
                        </Button>
                    </View>
                ) : (
                    <Button
                        styleContainer={[s.btnImprimirContainer, !canPrint ? { opacity: 0.45 } : null]}
                        style={s.btnImprimir}
                        gradient={gb.gradient_blue}
                        onPress={handleImprimirCuenta}
                        disabled={imprimiendo || !canPrint}
                    >
                        <Ionicons name="print-outline" size={normalize(20)} color={gb.gray50} />
                        <Text style={s.btnImprimirTexto}>
                            {imprimiendo ? 'Imprimiendo...' : 'Imprimir cuenta'}
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
                onGuardar={async (filas) => {
                    if (!comanda?.ID) return;
                    try {
                        await Database.guardarPagoCuentaDividida(comanda.ID, filas);
                        setFilasGuardadas(
                            filas.map((f) => ({
                                TOTAL: f.total,
                                FORMA_PAGO: f.formaPago,
                                CANTIDAD: f.cantidad,
                            }))
                        );
                        // Auto-rellenar monto recibido con el total
                        setMontoRecibido(String(total.toFixed(2)));
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
                onSubmit={async () => {
                    setOpenNipModal(false);
                    await ejecutarImpresion();
                }}
            />

            {/* ── MODAL NIP (editar comanda) ───────────────────── */}
            <NipModal
                visible={openNipEditarModal}
                onClose={() => setOpenNipEditarModal(false)}
                titulo="Editar comanda"
                onSubmit={async () => {
                    setOpenNipEditarModal(false);
                    await Database.setComandaAbierta(comanda.ID);
                    await AsyncStorage.removeItem(`pago_monto_${comanda.ID}`);
                    setCuentaImpresa(false);
                    setComanda(prev => prev ? { ...prev, ESTATUS: 0 } : prev);
                }}
            />

            {/* ── MODAL CLIENTE ─────────────────────────────────── */}
            <ModalSeleccionCliente
                visible={openModalCliente}
                onClose={() => setOpenModalCliente(false)}
                clientes={clientes}
                clienteSeleccionado={cliente}
                busqueda={buscadorCliente}
                onCambiarBusqueda={setBuscadorCliente}
                onSeleccionar={async (clienteSeleccionado) => {
                    if (!comanda?.ID) return;
                    try {
                        await Database.setClienteEnComanda(comanda.ID, clienteSeleccionado?.ID ?? null);
                        setCliente(clienteSeleccionado ?? null);
                        setComanda(prev => prev ? { ...prev, ID_CLIENTE: clienteSeleccionado?.ID ?? null } : prev);
                        setOpenModalCliente(false);
                    } catch (error) {
                        console.error("Error asignando cliente:", error);
                    }
                }}
            />
        </SafeAreaView>
    );
};

export default Pago;
