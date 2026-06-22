import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../../../components/atoms/Button/Button";
import EstatusSincronizado from "../../../components/atoms/EstatusSincronizado/EstatusSincronizado";
import RecoverButton from "../../../components/atoms/RecoverButton/RecoverButton";
import { listColumns, normalize } from "../../../utils/funcionesMaquetado/responsiveWH";
import { gb } from "../../globalStyles";
import { Database } from "./Database";
import { integracionClientes } from "./integracion";
import { s } from "./styles";

/* ─── Card de un cliente ───────────────────────────────────────── */
const ClienteCard = ({ cliente, onPress }) => {
    const iniciales = cliente.NOMBRE
        ? cliente.NOMBRE.split(" ").slice(0, 2).map(w => w[0]?.toUpperCase()).join("")
        : "?";

    return (
        <Pressable style={({ pressed }) => [s.card, { opacity: pressed ? 0.85 : 1 }]} onPress={onPress}>
            {/* Barra lateral con degradado */}
            <LinearGradient
                style={s.cardAccent}
                colors={gb.gradient_blue}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
            />

            <View style={s.cardBody}>
                {/* Nombre + avatar */}
                <View style={s.cardNameRow}>
                    <LinearGradient
                        style={s.cardAvatar}
                        colors={gb.gradient_blue}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Text style={s.cardAvatarText}>{iniciales}</Text>
                    </LinearGradient>
                    <View style={{ flex: 1 }}>
                        <Text style={s.cardName} numberOfLines={1}>{cliente.NOMBRE}</Text>
                        <View style={s.cardKey}>
                            <Text style={s.cardKeyText}>Clave #{cliente.DINNER_KEY}</Text>
                        </View>
                    </View>
                    <EstatusSincronizado sincronizado={!!cliente.SINCRONIZADO} />
                    <Ionicons name="chevron-forward" size={normalize(18)} color={gb.gray300} style={{ marginLeft: normalize(4) }} />
                </View>

                {/* Teléfono */}
                {!!cliente.TELEFONO && (
                    <View style={s.cardInfoRow}>
                        <Ionicons name="call-outline" size={normalize(13)} color={gb.blue500} />
                        <Text style={s.cardInfoText}>{cliente.TELEFONO}</Text>
                    </View>
                )}

                {/* Correo */}
                {!!cliente.CORREO && (
                    <View style={s.cardInfoRow}>
                        <Ionicons name="mail-outline" size={normalize(13)} color={gb.purple550} />
                        <Text style={s.cardInfoText} numberOfLines={1}>{cliente.CORREO}</Text>
                    </View>
                )}

                {/* Dirección */}
                {!!cliente.DIRECCION && (
                    <View style={s.cardInfoRow}>
                        <Ionicons name="location-outline" size={normalize(13)} color={gb.red400} />
                        <Text style={s.cardInfoText} numberOfLines={1}>{cliente.DIRECCION}</Text>
                    </View>
                )}
            </View>
        </Pressable>
    );
};

/* ─── Pantalla principal ───────────────────────────────────────── */
const Clientes = () => {
    const router = useRouter();
    const [clientes, setClientes] = useState([]);
    const [refrescando, setRefrescando] = useState(false);
    const [actualizando, setActualizando] = useState(false);
    const [sincronizando, setSincronizando] = useState(false);

    const cargar = async () => {
        try {
            const res = await Database.getClientes();
            setClientes(res ?? []);
        } catch (e) {
            console.error("Error al obtener clientes:", e);
        }
    };

    useFocusEffect(useCallback(() => { cargar(); }, []));

    const onRefresh = async () => {
        setRefrescando(true);
        await cargar();
        setRefrescando(false);
    };

    const irAEditar = (cliente) => {
        router.push({ pathname: "/Clientes/Editar", params: { data: JSON.stringify(cliente) } });
    };

    const irAAgregar = () => {
        router.push({ pathname: "/Clientes/Agregar" });
    };

    const handleActualizar = async () => {
        try {
            setActualizando(true);
            await integracionClientes.actualizar();
            await cargar();
        } catch (e) {
            Alert.alert("Error", String(e?.message ?? e));
        } finally {
            setActualizando(false);
        }
    };

    const handleSincronizar = async () => {
        try {
            setSincronizando(true);
            const { sincronizados } = await integracionClientes.sincronizar();
            await cargar();
            if (sincronizados === 0) {
                Alert.alert("Sin pendientes", "No hay clientes por sincronizar.");
            } else {
                Alert.alert("Listo", `${sincronizados} cliente(s) sincronizado(s).`);
            }
        } catch (e) {
            Alert.alert("Error", String(e?.message ?? e));
        } finally {
            setSincronizando(false);
        }
    };

    return (
        <SafeAreaView edges={["bottom"]} style={{ flex: 1, backgroundColor: "black" }}>
            {/* Header */}
            <LinearGradient style={s.header} colors={gb.gradient_blue} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <RecoverButton />
                <Text style={s.headerTitle}>Clientes</Text>
                <Button style={s.btnAdd} onPress={irAAgregar}>
                    <Ionicons name="add" size={normalize(20)} color="white" />
                </Button>
            </LinearGradient>

            {/* Lista */}
            <View style={s.body}>
                <FlatList
                    data={clientes}
                    keyExtractor={(item) => String(item.ID)}
                    numColumns={listColumns}
                    key={listColumns}
                    columnWrapperStyle={listColumns > 1 ? { gap: normalize(10) } : null}
                    contentContainerStyle={[s.listContent, clientes.length === 0 && { flex: 1 }]}
                    refreshControl={
                        <RefreshControl refreshing={refrescando} onRefresh={onRefresh} colors={gb.gradient_blue} />
                    }
                    renderItem={({ item }) => (
                        <ClienteCard cliente={item} onPress={() => irAEditar(item)} />
                    )}
                    ListEmptyComponent={
                        <View style={s.emptyContainer}>
                            <Ionicons name="people-outline" size={normalize(52)} color={gb.gray300} />
                            <Text style={s.emptyText}>Sin clientes registrados</Text>
                        </View>
                    }
                />
            </View>
            <LinearGradient style={s.footer} colors={gb.gradient_blue} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                    
                <Button style={s.btnSync} onPress={handleActualizar} disabled={actualizando || sincronizando}>
                    <Ionicons name="refresh-outline" size={normalize(20)} color="white" />
                    <Text style={s.btnSyncText}>{actualizando ? "Actualizando..." : "Actualizar"}</Text>
                </Button>
                <Button style={s.btnSync} onPress={handleSincronizar} disabled={actualizando || sincronizando}>
                    <Ionicons name="sync-outline" size={normalize(20)} color="white" />
                    <Text style={s.btnSyncText}>{sincronizando ? "Sincronizando..." : "Sincronizar"}</Text>
                </Button>
            </LinearGradient>

        </SafeAreaView>
    );
};

export default Clientes;
