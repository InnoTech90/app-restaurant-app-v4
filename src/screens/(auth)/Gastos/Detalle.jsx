import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EstatusSincronizado from "../../../components/atoms/EstatusSincronizado/EstatusSincronizado";
import RecoverButton from "../../../components/atoms/RecoverButton/RecoverButton";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";
import { gb } from "../../globalStyles";
import { Database } from "./database";
import { s } from "./styles";

/* ─── Chip de un concepto ──────────────────────────────────────── */
const ConceptoItem = ({ concepto }) => (
    <View style={s.conceptoItem}>
        <LinearGradient
            style={s.conceptoAccent}
            colors={gb.gradient_blue}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
        />
        <View style={s.conceptoBody}>
            <Text style={s.conceptoNombre}>{concepto.NOMBRE}</Text>
            {!!concepto.DESCRIPCION && (
                <Text style={s.conceptoDesc}>{concepto.DESCRIPCION}</Text>
            )}
        </View>
    </View>
);

/* ─── Pantalla Detalle ─────────────────────────────────────────── */
const Detalle = () => {
    const { data } = useLocalSearchParams();
    const gasto = data ? JSON.parse(data) : {};

    const [conceptos, setConceptos]     = useState([]);
    const [cargando, setCargando]       = useState(true);

    useFocusEffect(
        useCallback(() => {
            let activo = true;
            const cargar = async () => {
                try {
                    setCargando(true);
                    const res = await Database.getConceptosByCategoria(gasto.UUID);
                    if (activo) setConceptos(res ?? []);
                } catch (e) {
                    console.error("Error al cargar conceptos:", e);
                } finally {
                    if (activo) setCargando(false);
                }
            };
            cargar();
            return () => { activo = false; };
        }, [gasto.UUID])
    );

    return (
        <SafeAreaView edges={["bottom"]} style={{ flex: 1, backgroundColor: "black" }}>
            {/* Header */}
            <LinearGradient
                style={s.header}
                colors={gb.gradient_blue}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
            >
                <RecoverButton />
                <Text style={s.headerTitle}>Detalle del gasto</Text>
                <View style={{ width: normalize(35) }} />
            </LinearGradient>

            <ScrollView
                style={{ flex: 1, backgroundColor: gb.gray100 }}
                contentContainerStyle={s.detalleScroll}
            >
                {/* ── Bloque: Categoría ── */}
                <Text style={s.sectionLabel}>Categoría</Text>
                <View style={s.detalleCard}>
                    <View style={s.detalleTopRow}>
                        <Text style={s.detalleNombre}>{gasto.NOMBRE ?? "Sin nombre"}</Text>
                        <EstatusSincronizado sincronizado={!!gasto.SINCRONIZADO} />
                    </View>
                    {!!gasto.DESCRIPCION && gasto.DESCRIPCION !== "." && (
                        <Text style={s.detalleDescripcion}>{gasto.DESCRIPCION}</Text>
                    )}
                </View>

                {/* ── Bloque: Conceptos ── */}
                <Text style={[s.sectionLabel, { marginTop: normalize(16) }]}>
                    Conceptos ({gasto.NUM_CONCEPTOS ?? 0})
                </Text>

                {cargando ? (
                    <ActivityIndicator
                        size="small"
                        color={gb.blue500}
                        style={{ marginTop: normalize(20) }}
                    />
                ) : conceptos.length === 0 ? (
                    <View style={s.conceptosEmpty}>
                        <Ionicons name="list-outline" size={normalize(36)} color={gb.gray300} />
                        <Text style={s.conceptosEmptyText}>Sin conceptos registrados</Text>
                    </View>
                ) : (
                    <View style={s.conceptosList}>
                        {conceptos.map((c) => (
                            <ConceptoItem key={String(c.ID)} concepto={c} />
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default Detalle;
