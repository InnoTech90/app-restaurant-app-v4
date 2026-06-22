import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, FlatList, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../../../../components/atoms/Button/Button";
import InputCantidad from "../../../../components/atoms/InputCantidad/InputCantidad";
import ModalSinImpresora from "../../../../components/atoms/ModalSinImpresora/ModalSinImpresora";
import RecoverButton from "../../../../components/atoms/RecoverButton/RecoverButton";
import { normalize } from "../../../../utils/funcionesMaquetado/responsiveWH";
import { gb } from "../../../globalStyles";
import Database from "./database";
import { s } from "./styles";
import { imprimirComanda } from "./ticketTemplate";

const Ticket = () => {
    const router = useRouter();
    const { comanda: comandaRaw, id_mesa: idMesa } = useLocalSearchParams();
    const comandaData = JSON.parse(comandaRaw ?? "null");

    const [articulos, setArticulos] = useState(comandaData?.articulos ?? []);
    const [nota, setNota] = useState(comandaData?.comanda?.NOTA ?? "");
    const [mesa, setMesa] = useState(null);
    const [cliente, setCliente] = useState(null);
    const [imprimiendo, setImprimiendo] = useState(false);
    const [cancelando, setCancelando] = useState(false);
    const [modalSinImpresora, setModalSinImpresora] = useState(false);

    const comanda = comandaData?.comanda;
    const bloqueada = comanda?.ESTATUS === 4;

    useEffect(() => {
        if (idMesa) Database.getMesa(idMesa).then(setMesa).catch(console.error);
        if (comanda?.ID_CLIENTE) Database.getCliente(comanda.ID_CLIENTE).then(setCliente).catch(console.error);
    }, []);

    const totalProductos = articulos.reduce((acc, r) => acc + (r.CANTIDAD ?? 0), 0);
    const totalComanda = articulos.reduce((acc, r) => acc + (r.TOTAL ?? 0), 0);

    const formatearFecha = (fechaStr) => {
        if (!fechaStr) return { fecha: "—", hora: "—" };
        const [fecha, hora] = fechaStr.split(" ");
        return { fecha, hora: hora?.slice(0, 5) ?? "—" };
    };
    const { fecha, hora } = formatearFecha(comanda?.FECHA);

    const handleCancelar = () => {
        Alert.alert(
            "Cancelar comanda",
            "¿Estás seguro de que deseas cancelar esta comanda? Esta acción no se puede deshacer.",
            [
                { text: "No", style: "cancel" },
                {
                    text: "Sí, cancelar",
                    style: "destructive",
                    onPress: async () => {
                        if (cancelando || !comanda) return;
                        setCancelando(true);
                        try {
                            await Database.cancelarComanda(comanda.ID);
                            router.replace("/Inicio");
                        } catch (e) {
                            console.error("Error cancelando comanda:", e);
                            setCancelando(false);
                        }
                    },
                },
            ]
        );
    };

    const handleCambiarCantidad = async (renglon, nuevaCantidad) => {
        try {
            const tipo = nuevaCantidad > renglon.CANTIDAD ? 'INCREMENTAR_ARTICULO' : 'DISMINUIR_ARTICULO';
            await Database.actualizarCantidadArticulo(renglon.ID, nuevaCantidad, renglon.PRECIO_VENTA);
            await Database.registrarMovimiento(renglon.ID_COMANDA, renglon.ID_ARTICULO, tipo);
            setArticulos(prev =>
                prev.map(r =>
                    r.ID === renglon.ID
                        ? { ...r, CANTIDAD: nuevaCantidad, SUBTOTAL: nuevaCantidad * renglon.PRECIO_VENTA, TOTAL: nuevaCantidad * renglon.PRECIO_VENTA }
                        : r
                )
            );
        } catch (e) {
            console.error("Error actualizando cantidad:", e);
        }
    };

    const handleEliminarArticulo = (renglon) => {
        Alert.alert(
            "Eliminar artículo",
            `¿Eliminar "${renglon.articulo?.NOMBRE ?? "este artículo"}" de la comanda?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await Database.registrarMovimiento(renglon.ID_COMANDA, renglon.ID_ARTICULO, 'ELIMINACION_ARTICULO');
                            await Database.eliminarArticulo(renglon.ID);
                            setArticulos(prev => prev.filter(r => r.ID !== renglon.ID));
                        } catch (e) {
                            console.error("Error eliminando artículo:", e);
                        }
                    },
                },
            ]
        );
    };

    const handleNotaBlur = async () => {
        if (!comanda) return;
        try { await Database.actualizarNota(comanda.ID, nota); }
        catch (e) { console.error("Error guardando nota:", e); }
    };

    const handleImprimir = async () => {
        if (imprimiendo || !comanda) return;
        setImprimiendo(true);
        try {
            // sinPrecios=true: ticket de cocina/barra, nunca mostrar precios
            const resultado = await imprimirComanda(comanda, articulos, mesa, true);
            if (resultado === 'SIN_IMPRESORA') {
                setModalSinImpresora(true);
                return;
            }
            await Database.imprimirTicket(comanda.ID);
            await Database.registrarMovimiento(comanda.ID, null, 'IMPRESION_TICKET');
        } catch (e) {
            console.error("Error imprimiendo ticket:", e);
        } finally {
            setImprimiendo(false);
        }
    };

    const renderArticulo = ({ item: renglon, index: idx }) => (
        <View style={[s.articuloRow, idx !== 0 && s.articuloRowBorder]}>
            {/* Info */}
            <View style={s.articuloInfo}>
                <Text style={s.articuloNombre} numberOfLines={1}>
                    {renglon.articulo?.NOMBRE ?? "—"}
                </Text>
                <View style={s.articuloMeta}>
                    <Text style={s.articuloPrecio}>${(renglon.PRECIO_VENTA ?? 0).toFixed(2)} c/u</Text>
                    {renglon.complementos?.length > 0 && (
                        <Text style={s.articuloComps}>· +{renglon.complementos.length} comp.</Text>
                    )}
                </View>
            </View>
            {/* Cantidad */}
            <InputCantidad
                value={renglon.CANTIDAD}
                onChange={(val) => handleCambiarCantidad(renglon, val)}
                min={1}
                small
                disabled={bloqueada}
                style={s.inputCantidad}
            />
            {/* Total */}
            <Text style={s.articuloTotal}>${(renglon.TOTAL ?? 0).toFixed(2)}</Text>
            {/* Eliminar */}
            <Button
                style={s.btnEliminar}
                styleContainer={s.btnEliminarContainer}
                onPress={() => handleEliminarArticulo(renglon)}
                disabled={bloqueada}
            >
                <Ionicons name="trash-outline" size={normalize(14)} color={bloqueada ? gb.gray400 : gb.red600} />
            </Button>
        </View>
    );

    return (
        <SafeAreaView edges={["bottom"]} style={s.root}>
            <ModalSinImpresora
                visible={modalSinImpresora}
                onOmitir={() => setModalSinImpresora(false)}
                onVincular={() => {
                    setModalSinImpresora(false);
                    router.push("/(auth)/Impresoras");
                }}
            />
            {/* ── HEADER ── */}
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
                        Folio #{comanda?.FICHA ?? "—"} · {fecha} {hora}
                    </Text>
                </View>
                <Button
                    style={s.btnCancelar}
                    styleContainer={s.btnCancelarContainer}
                    onPress={handleCancelar}
                    disabled={cancelando}
                >
                    <Ionicons name="trash-outline" size={normalize(15)} color={gb.gray50} />
                </Button>
            </LinearGradient>

            {/* ── CLIENTE CHIP (solo si hay) ── */}
            {cliente && (
                <View style={s.clienteStrip}>
                    <Ionicons name="person-circle-outline" size={normalize(16)} color={gb.green500} />
                    <Text style={s.clienteNombre}>{cliente.NOMBRE}</Text>
                    {!!cliente.TELEFONO && (
                        <Text style={s.clienteTelefono}>{cliente.TELEFONO}</Text>
                    )}
                </View>
            )}

            {/* ── BANNER BLOQUEADO ── */}
            {bloqueada && (
                <View style={{ backgroundColor: gb.orange100 ?? '#FFF3CD', flexDirection: 'row', alignItems: 'center', paddingHorizontal: normalize(14), paddingVertical: normalize(8), gap: normalize(8) }}>
                    <Ionicons name="lock-closed-outline" size={normalize(16)} color={gb.orange600 ?? '#856404'} />
                    <Text style={{ fontSize: normalize(12), color: gb.orange600 ?? '#856404', fontWeight: '600' }}>
                        Cuenta impresa — ve a Pago para confirmar o editar
                    </Text>
                </View>
            )}

            {/* ── LISTA ARTÍCULOS (único scroll) ── */}
            <FlatList
                data={articulos}
                keyExtractor={(item) => String(item.ID)}
                style={s.lista}
                contentContainerStyle={s.listaContent}
                ListHeaderComponent={
                    <View style={s.listaHeader}>
                        <Text style={s.listaHeaderTexto}>Artículo</Text>
                        <Text style={s.listaHeaderTexto}>Cant.</Text>
                        <Text style={s.listaHeaderTexto}>Total</Text>
                        <View style={{ width: normalize(34) }} />
                    </View>
                }
                ListEmptyComponent={
                    <Text style={s.vacio}>Sin artículos en esta comanda</Text>
                }
                renderItem={renderArticulo}
            />

            {/* ── FOOTER FIJO ── */}
            <View style={s.footer}>
                {/* Nota */}
                <TextInput
                    style={s.notasInput}
                    multiline
                    numberOfLines={2}
                    placeholder="Nota de la mesa..."
                    placeholderTextColor={gb.gray400}
                    value={nota}
                    onChangeText={setNota}
                    onBlur={handleNotaBlur}
                    textAlignVertical="top"
                    editable={!bloqueada}
                />

                {/* Totales */}
                <View style={s.totalesRow}>
                    <Text style={s.totalProductos}>
                        {totalProductos} producto{totalProductos !== 1 ? "s" : ""}
                    </Text>
                    <Text style={s.totalGrande}>${totalComanda.toFixed(2)}</Text>
                </View>

                {/* Botón imprimir */}
                <Button
                    styleContainer={s.btnImprimirContainer}
                    style={s.btnImprimir}
                    gradient={bloqueada ? [gb.gray300, gb.gray200] : gb.gradient_blue}
                    onPress={handleImprimir}
                    disabled={imprimiendo || bloqueada}
                >
                    <Ionicons name="print-outline" size={normalize(20)} color={bloqueada ? gb.gray500 : gb.gray50} />
                    <Text style={[s.btnImprimirTexto, bloqueada && { color: gb.gray500 }]}>
                        {imprimiendo ? "Imprimiendo..." : "Imprimir ticket"}
                    </Text>
                </Button>
            </View>
        </SafeAreaView>
    );
};

export default Ticket;


