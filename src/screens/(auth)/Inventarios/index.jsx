import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Pressable,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MateriaPrimaCard from "../../../components/Molecules/MateriaPrimaCard/MateriaPrimaCard";
import ModalAjustarInventario from "../../../components/Molecules/ModalAjustarInventario/ModalAjustarInventario";
import RecoverButton from "../../../components/atoms/RecoverButton/RecoverButton";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";
import { gb } from "../../globalStyles";
import InventariosDatabase from "./database";
import { integracionInventarios } from "./integracion";
import { s } from "./styles";

const Inventarios = () => {
    const [items, setItems]       = useState([]);
    const [cargando, setCargando] = useState(true);
    const [sincronizando, setSincronizando] = useState(false);
    const [error, setError]       = useState(null);
    const [seleccionado, setSeleccionado] = useState(null);

    // ── Carga ──────────────────────────────────────────────────────────────
    useFocusEffect(
        useCallback(() => {
            let activo = true;
            const cargar = async () => {
                try {
                    setCargando(true);
                    setError(null);
                    const data = await InventariosDatabase.getMateriasPrimas();
                    if (activo) setItems(data);
                } catch (e) {
                    console.error("Error cargando inventario:", e);
                    if (activo) setError(String(e?.message ?? e));
                } finally {
                    if (activo) setCargando(false);
                }
            };
            cargar();
            return () => { activo = false; };
        }, [])
    );

    const actualizar = async () => {
        try {
            setCargando(true);
            setError(null);
            await integracionInventarios.actualizar();
            const data = await InventariosDatabase.getMateriasPrimas();
            setItems(data);
        } catch (e) {
            setError(String(e?.message ?? e));
        } finally {
            setCargando(false);
        }
    };

    const sincronizar = async () => {
        try {
            setSincronizando(true);
            setError(null);
            const { sincronizados } = await integracionInventarios.sincronizar();
            // Refresca la lista local para mostrar los nuevos iconos de sync
            const data = await InventariosDatabase.getMateriasPrimas();
            setItems(data);
            if (sincronizados === 0) {
                Alert.alert("Sin pendientes", "No hay movimientos por sincronizar.");
            } else {
                Alert.alert("Listo", `${sincronizados} movimiento(s) sincronizado(s).`);
            }
        } catch (e) {
            Alert.alert("Error", String(e?.message ?? e));
        } finally {
            setSincronizando(false);
        }
    };

    // ── Guardar desde el modal ─────────────────────────────────────────────
    const handleGuardar = async (uuidSucursal, nuevoStock) => {
        await InventariosDatabase.actualizarStock(uuidSucursal, nuevoStock);
        setItems((prev) =>
            prev.map((i) =>
                i.UUID_SUCURSAL === uuidSucursal
                    ? { ...i, STOCK_ACTUAL: nuevoStock, SINCRONIZADO: 0 }
                    : i
            )
        );
    };

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <SafeAreaView edges={["bottom"]} style={s.root}>
            {/* Header */}
            <LinearGradient
                style={s.header}
                colors={gb.gradient_blue}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
            >
                <RecoverButton />
                <Text style={s.headerTitle}>Inventario</Text>
                <View style={{ width: normalize(35) }} />
            </LinearGradient>

            {cargando ? (
                <ActivityIndicator
                    size="large"
                    color={gb.purple550}
                    style={{ marginTop: normalize(40) }}
                />
            ) : error ? (
                <View style={s.emptyContainer}>
                    <Ionicons name="alert-circle-outline" size={normalize(50)} color={gb.red400} />
                    <Text style={[s.emptyText, { color: gb.red400 }]}>{error}</Text>
                </View>
            ) : (
                <FlatList
                    data={items}
                    keyExtractor={(item) => item.UUID_SUCURSAL ?? item.UUID}
                    style={{backgroundColor:gb.gray50}}
                    contentContainerStyle={items.length === 0 ? { flex: 1 } : s.listContent}
                    ListHeaderComponent={
                        <View style={s.bannerContainer}>
                            <LinearGradient
                                style={s.banner}
                                colors={gb.gradient_blue}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <View>
                                    <Text style={s.bannerLabel}>Total materias primas</Text>
                                    <Text style={s.bannerCount}>{items.length}</Text>
                                </View>
                                <View style={s.bannerIcon}>
                                    <Ionicons name="cube-outline" size={normalize(32)} color="white" />
                                </View>
                            </LinearGradient>
                        </View>
                    }
                    ListEmptyComponent={
                        <View style={s.emptyContainer}>
                            <Ionicons name="cube-outline" size={normalize(60)} color={gb.gray300} />
                            <Text style={s.emptyText}>Sin materias primas registradas.</Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <MateriaPrimaCard item={item} onPress={() => setSeleccionado(item)} />
                    )}
                    ItemSeparatorComponent={() => <View style={{ height: normalize(10) }} />}
                />
            )}

            {/* Modal ajustar inventario */}
            <ModalAjustarInventario
                seleccionado={seleccionado}
                onClose={() => setSeleccionado(null)}
                onGuardar={handleGuardar}
            />

            {/* Footer */}
            <LinearGradient
                style={s.footer}
                colors={gb.gradient_blue}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
            >
                <Pressable
                    style={({ pressed }) => [s.footerBtn, { opacity: pressed ? 0.75 : 1 }]}
                    onPress={actualizar}
                    disabled={cargando || sincronizando}
                >
                    <Ionicons name="refresh-outline" size={normalize(20)} color={gb.gray50} />
                    <Text style={s.footerBtnText}>{cargando ? "Cargando..." : "Actualizar"}</Text>
                </Pressable>

                <Pressable
                    style={({ pressed }) => [s.footerBtn, { opacity: pressed ? 0.75 : 1 }]}
                    onPress={sincronizar}
                    disabled={cargando || sincronizando}
                >
                    <Ionicons name="sync" size={normalize(20)} color={gb.gray50} />
                    <Text style={s.footerBtnText}>{sincronizando ? "Sincronizando..." : "Sincronizar"}</Text>
                </Pressable>
            </LinearGradient>
        </SafeAreaView>
    );
};

export default Inventarios;
