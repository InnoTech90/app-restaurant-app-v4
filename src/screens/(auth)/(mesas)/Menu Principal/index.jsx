import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Card from "../../../../components/Molecules/Card/Card";
import CardArticulo from "../../../../components/Molecules/CardArticulo/CardArticulo";
import Buscador from "../../../../components/atoms/Buscador/Buscador";
import Button from "../../../../components/atoms/Button/Button";
import GeneralModal from "../../../../components/atoms/GeneralModal/GeneralModal";
import Loading from "../../../../components/atoms/Loading/Loading";
import RecoverButton from "../../../../components/atoms/RecoverButton/RecoverButton";
import Select from "../../../../components/atoms/Select/Select";
import { normalize } from "../../../../utils/funcionesMaquetado/responsiveWH";
import { gb } from "../../../globalStyles";
import Database from "./database";
import { s } from "./styles";

const MenuPrincipal = () => {
    const [grupos, setGrupos] = useState([]);
    const [articulos, setArticulos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState("");
    const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);
    const [comandaActiva, setComandaActiva] = useState(null);
    const [modalCliente, setModalCliente] = useState(false);
    const [clientes, setClientes] = useState([]);
    const [buscadorCliente, setBuscadorCliente] = useState("");
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
    const [guardandoCliente, setGuardandoCliente] = useState(false);
    const router = useRouter();
    const { id_mesa: idMesa } = useLocalSearchParams();

    useEffect(() => {
        cargarMenu();
    }, []);

 
    useFocusEffect(
        useCallback(() => {
            if (!idMesa) return;

            let activa = true;

            const cargar = async () => {
                try {
                    const comandaActualizada = await Database.getComandaCompleta(idMesa);
                    if (!activa) return;

                    setComandaActiva(comandaActualizada);

                    const idCliente = comandaActualizada?.comanda?.ID_CLIENTE ?? null;
                    if (!idCliente) {
                        setClienteSeleccionado(null);
                        return;
                    }

                    const clienteActualizado = await Database.getCliente(idCliente);
                    if (!activa) return;
                    setClienteSeleccionado(clienteActualizado);
                } catch (error) {
                    if (activa) console.error("Error cargando comanda:", error);
                }
            };

            cargar();

            return () => {
                activa = false;
            };
        }, [idMesa])
    );

    const cargarMenu = async () => {
        try {
            const { grupos, articulos } = await Database.getMenu();
            setGrupos(grupos);
            setArticulos(articulos);
        } catch (e) {
            console.error("Error cargando menú:", e);
        } finally {
            setCargando(false);
        }
    };

    const datosFiltrados = useMemo(() => {
        const texto = busqueda.trim().toLowerCase();
        return grupos
            .filter(g => grupoSeleccionado === null || g.UUID === grupoSeleccionado)
            .map(g => ({
                ...g,
                articulos: articulos.filter(a => {
                    if (a.ID_GRUPO !== g.UUID) return false;
                    if (!texto) return true;
                    return (
                        a.NOMBRE?.toLowerCase().includes(texto) ||
                        a.NOMBRE_CORTO?.toLowerCase().includes(texto)
                    );
                }),
            }))
            .filter(g => g.articulos.length > 0);
    }, [grupos, articulos, busqueda, grupoSeleccionado]);

    const clientesFiltrados = useMemo(() => {
        const texto = buscadorCliente.trim().toLowerCase();
        if (!texto) return clientes;
        return clientes.filter(c =>
            c.NOMBRE?.toLowerCase().includes(texto) ||
            c.TELEFONO?.toLowerCase().includes(texto)
        );
    }, [clientes, buscadorCliente]);

    const abrirModalCliente = async () => {
        const lista = await Database.getClientes().catch(() => []);
        setClientes(lista);
        setBuscadorCliente("");
        setModalCliente(true);
    };

    const seleccionarCliente = async (cliente) => {
        if (guardandoCliente || !comandaActiva) return;
        setGuardandoCliente(true);
        try {
            await Database.setClienteEnComanda(comandaActiva.comanda.ID, cliente?.ID ?? null);
            setComandaActiva(prev => ({ ...prev, comanda: { ...prev.comanda, ID_CLIENTE: cliente?.ID ?? null } }));
            setClienteSeleccionado(cliente ?? null);
            setModalCliente(false);
        } catch (e) {
            console.error("Error asignando cliente:", e);
        } finally {
            setGuardandoCliente(false);
        }
    };

    if (cargando) {
        return (
            <SafeAreaView style={s.centrado}>
                <Loading color={gb.blue550} />
            </SafeAreaView>
        );
    }
    const agregarArticulo = (articulo) => {
        if (comandaActiva?.comanda?.ESTATUS === 4) return;
        router.push({ pathname: "/DetalleArticulo", params: { articulo: JSON.stringify(articulo, null, 2), id_mesa: idMesa } });
    }
    const abrirTicket = () => {
        if (!comandaActiva) return;
        router.push({ pathname: "/Ticket", params: { comanda: JSON.stringify(comandaActiva), id_mesa: idMesa } });
    };
    const abrirPago = () => {
        if (!comandaActiva) return;
        router.push({ pathname: "/Pago", params: { comanda: JSON.stringify(comandaActiva), id_mesa: idMesa } });
    };
    return (
        <SafeAreaView edges={["bottom"]} style={{ flex: 1, backgroundColor: "black" }}>
            {/* Header */}
            <View style={{ backgroundColor: gb.gray50 }}>
                <LinearGradient style={s.header} colors={gb.gradient_blue} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                    <RecoverButton />
                </LinearGradient>
                {/* Buscador */}
                <View style={s.buscadorWrapper}>
                    <Buscador
                        placeholder="Buscar artículo..."
                        value={busqueda}
                        onChangeText={setBusqueda}
                    />
                </View>

                {/* Filtro por grupo */}
                <View style={s.filtroContainer}>
                    <Select
                        placeholder="Todos los grupos"
                        options={[
                            { label: "Todos", value: null },
                            ...grupos.map(g => ({ label: g.NOMBRE, value: g.UUID }))
                        ]}
                        value={grupoSeleccionado}
                        onChange={(val) => setGrupoSeleccionado(val)}
                    />
                </View>

                {/* Barra de comanda activa */}
                {comandaActiva && (
                    <LinearGradient
                        colors={comandaActiva.comanda?.ESTATUS === 4 ? ['#FB8C00', '#FFA726'] : gb.gradient_blue}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={s.comandaBar}
                    >
                        <View style={s.comandaBarInner}>
                            <Ionicons
                                name="receipt-outline"
                                size={normalize(20)}
                                color={gb.gray50}
                                style={s.comandaBarIcono}
                            />
                            <View style={s.comandaBarTextos}>
                                <Text style={s.comandaBarTitulo}>
                                    {comandaActiva.comanda?.ESTATUS === 4
                                        ? `🔒 Cuenta impresa · ${comandaActiva.articulos.length} artículo${comandaActiva.articulos.length !== 1 ? 's' : ''}`
                                        : `Comanda activa · ${comandaActiva.articulos.length} artículo${comandaActiva.articulos.length !== 1 ? 's' : ''}`
                                    }
                                </Text>
                                {comandaActiva.articulos.map((r, i) => (
                                    <Text key={i} style={s.comandaBarArticulo}>
                                        {r.CANTIDAD}× {r.articulo?.NOMBRE ?? "—"}
                                        {r.complementos.length > 0
                                            ? `  (+${r.complementos.length} comp.)`
                                            : ""}
                                    </Text>
                                ))}
                            </View>
                            <Text style={s.comandaBarTotal}>
                                ${comandaActiva.totalComanda.toFixed(2)}
                            </Text>
                        </View>
                    </LinearGradient>
                )}
            </View>

            {/* Lista de grupos con artículos */}
            <ScrollView contentContainerStyle={s.listaContainer}>
                {datosFiltrados.length === 0 ? (
                    <Text style={s.textoVacio}>No se encontraron artículos</Text>
                ) : (
                    datosFiltrados.map(grupo => (
                        <View key={grupo.UUID} style={s.grupoWrapper}>
                            <Card
                                title={grupo.NOMBRE.toUpperCase()}
                                linealGradient={gb.gradient_blue}
                                styleTitleHeader={{ color: gb.gray50 }}
                                styleHeader={{ width: "100%" }}
                                styleBody={{ width: "100%", paddingHorizontal: 0, paddingVertical: 0, paddingBottom: 0 }}
                            >
                                {grupo.articulos.map(articulo => (
                                    <CardArticulo
                                        key={articulo.UUID}
                                        articulo={articulo}
                                        onPress={(a) => agregarArticulo(a)}
                                    />
                                ))}
                            </Card>
                        </View>
                    ))
                )}
            </ScrollView>
            {comandaActiva && (
                <View style={s.containerButtons}>
                    <Button styleContainer={s.botonAccionContainer} style={s.botonAccion} onPress={abrirModalCliente}>
                        <Ionicons name="person-outline" size={normalize(22)} color={comandaActiva?.comanda?.ID_CLIENTE ? gb.green500 : gb.blue550} />
                        <Text style={[s.botonAccionTexto, comandaActiva?.comanda?.ID_CLIENTE && { color: gb.green500 }]}>
                            {clienteSeleccionado ? clienteSeleccionado.NOMBRE.split(" ")[0] : "Cliente"}
                        </Text>
                    </Button>
                    <View style={s.botonAccionDivider} />
                    <Button styleContainer={s.botonAccionContainer} style={s.botonAccion} onPress={abrirTicket}>
                        <Ionicons name="receipt-outline" size={normalize(22)} color={gb.purple550} />
                        <Text style={[s.botonAccionTexto, { color: gb.purple550 }]}>Ticket</Text>
                    </Button>
                    <View style={s.botonAccionDivider} />
                    <Button styleContainer={s.botonAccionContainer} style={[s.botonAccion, s.botonPagar]} onPress={abrirPago}>
                        <Ionicons name="cash-outline" size={normalize(22)} color={gb.gray50} />
                        <Text style={[s.botonAccionTexto, { color: gb.gray50 }]}>Pagar</Text>
                    </Button>
                </View>
            )}

            {/* Modal selección de cliente */}
            <GeneralModal
                visible={modalCliente}
                onRequestClose={() => setModalCliente(false)}
                headerTitle="Seleccionar cliente"
                headerColorGrandien={gb.gradient_blue}
                headerColorText={gb.gray50}
                iconCloseColor={gb.gray50}
                scrollable={false}
            >
                <View style={s.modalBuscador}>
                    <Buscador
                        placeholder="Buscar cliente..."
                        value={buscadorCliente}
                        onChangeText={setBuscadorCliente}
                    />
                </View>
                <FlatList
                    data={clientesFiltrados}
                    keyExtractor={(item) => String(item.ID)}
                    contentContainerStyle={{ paddingBottom: normalize(20) }}
                    ListHeaderComponent={
                        <Button
                            styleContainer={s.modalClienteItem}
                            style={s.modalClienteBoton}
                            onPress={() => seleccionarCliente(null)}
                        >
                            <View style={[s.modalClienteAvatar, { backgroundColor: gb.gray200 }]}>
                                <Ionicons name="person-outline" size={normalize(18)} color={gb.gray500} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={s.modalClienteNombre}>Sin cliente</Text>
                            </View>
                            {!clienteSeleccionado && (
                                <Ionicons name="checkmark-circle" size={normalize(20)} color={gb.green500} />
                            )}
                        </Button>
                    }
                    ListEmptyComponent={
                        <Text style={s.modalVacio}>Sin clientes registrados</Text>
                    }
                    renderItem={({ item }) => (
                        <Button
                            styleContainer={s.modalClienteItem}
                            style={s.modalClienteBoton}
                            onPress={() => seleccionarCliente(item)}
                        >
                            <View style={s.modalClienteAvatar}>
                                <Text style={s.modalClienteAvatarText}>
                                    {item.NOMBRE?.split(" ").slice(0, 2).map(w => w[0]?.toUpperCase()).join("") ?? "?"}
                                </Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={s.modalClienteNombre}>{item.NOMBRE}</Text>
                                {!!item.TELEFONO && (
                                    <Text style={s.modalClienteTelefono}>{item.TELEFONO}</Text>
                                )}
                            </View>
                            {clienteSeleccionado?.ID === item.ID && (
                                <Ionicons name="checkmark-circle" size={normalize(20)} color={gb.green500} />
                            )}
                        </Button>
                    )}
                />
            </GeneralModal>
        </SafeAreaView>
    );
};

export default MenuPrincipal;