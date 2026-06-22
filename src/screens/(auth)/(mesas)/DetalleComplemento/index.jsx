import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../../../../components/atoms/Button/Button";
import InputCantidad from "../../../../components/atoms/InputCantidad/InputCantidad";
import RecoverButton from "../../../../components/atoms/RecoverButton/RecoverButton";
import { gb } from "../../../globalStyles";
import { ComplementosStore } from "../complementosStore";
import { s } from "./styles";

const DetalleComplemento = () => {
    const { articulo: articuloRaw, gruposComplementos: gruposRaw } = useLocalSearchParams();
    const articulo = articuloRaw ? JSON.parse(articuloRaw) : null;
    const gruposComplementos = gruposRaw ? JSON.parse(gruposRaw) : [];
    const router = useRouter();

    // { [uuid]: cantidad } — 0 = no seleccionado
    const [seleccion, setSeleccion] = useState({});

    const getCantidad = (uuid) => seleccion[uuid] || 0;

    const setCantidad = (uuid, val) => {
        setSeleccion(prev => ({ ...prev, [uuid]: val }));
    };

    const totalCount = useMemo(
        () => Object.values(seleccion).reduce((acc, v) => acc + v, 0),
        [seleccion]
    );

    const handleAnadir = () => {
        const complementosSeleccionados = [];
        gruposComplementos.forEach(grupo => {
            (grupo.complementos || []).forEach(comp => {
                const qty = seleccion[comp.UUID] || 0;
                if (qty > 0) {
                    complementosSeleccionados.push({
                        ...comp,
                        cantidad: qty,
                        nombreGrupo: grupo.NOMBRE,
                    });
                }
            });
        });
        ComplementosStore.setSeleccion(complementosSeleccionados);
        router.back();
    };

    return (
        <SafeAreaView edges={["bottom"]} style={s.safeArea}>

            {/* ── Header ── */}
            <LinearGradient
                colors={gb.gradient_blue}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.header}
            >
                <RecoverButton />
                <Text style={s.headerNombre}>{articulo?.NOMBRE}</Text>
                <Text style={s.headerSubtitulo}>Selecciona complementos</Text>
            </LinearGradient>

            <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
                {gruposComplementos.map(grupo => (
                    <View key={grupo.UUID} style={s.seccion}>
                        <Text style={s.seccionTitulo}>{grupo.NOMBRE}</Text>
                        {(grupo.complementos || []).map((comp, idx) => {
                            const esUltimo = idx === grupo.complementos.length - 1;
                            return (
                                <View
                                    key={comp.UUID}
                                    style={[s.complementoRow, esUltimo && s.complementoRowUltimo]}
                                >
                                    <View style={s.complementoInfo}>
                                        <Text style={s.complementoNombre}>{comp.NOMBRE}</Text>
                                        {comp.PRECIO > 0 && (
                                            <Text style={s.complementoPrecio}>
                                                +${Number(comp.PRECIO).toFixed(2)}
                                            </Text>
                                        )}
                                    </View>
                                    <InputCantidad
                                        value={getCantidad(comp.UUID)}
                                        onChange={(val) => setCantidad(comp.UUID, val)}
                                        min={0}
                                        style={s.inputCantidad}
                                    />
                                </View>
                            );
                        })}
                    </View>
                ))}
            </ScrollView>

            {/* ── Footer ── */}
            <View style={s.footer}>
                <Button
                    gradient={[gb.green500, gb.green400]}
                    onPress={handleAnadir}
                    styleContainer={s.botonAnadir}
                >
                    <Text style={s.botonAnadirTexto}>
                        Añadir {totalCount} complemento{totalCount !== 1 ? "s" : ""}
                    </Text>
                </Button>
            </View>

        </SafeAreaView>
    );
};

export default DetalleComplemento;