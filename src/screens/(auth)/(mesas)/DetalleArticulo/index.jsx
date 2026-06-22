import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../../../../components/atoms/Button/Button";
import InputCantidad from "../../../../components/atoms/InputCantidad/InputCantidad";
import RecoverButton from "../../../../components/atoms/RecoverButton/RecoverButton";
import { normalize } from "../../../../utils/funcionesMaquetado/responsiveWH";
import { gb } from "../../../globalStyles";
import { ComplementosStore } from "../complementosStore";
import { Database } from "./database";
import { s } from "./styles";

const DetalleArticulo = () => {
    const { articulo: articuloRaw, id_mesa: idMesa } = useLocalSearchParams();
    const articulo = articuloRaw ? JSON.parse(articuloRaw) : null;
    const router = useRouter();

    const precioBase = articulo?.PRECIO ?? 0;

    const [cantidad, setCantidad] = useState(1);
    const [notas, setNotas] = useState("");
    const [descuentoPct, setDescuentoPct] = useState("");
    const [descuentoMonto, setDescuentoMonto] = useState("");
    const [gruposComplementos, setGruposComplementos] = useState([]);
    const [complementosSeleccionados, setComplementosSeleccionados] = useState([]);
    const [guardando, setGuardando] = useState(false);
        
    // Al volver de DetalleComplemento, leer la selección del store
    useFocusEffect(
        useCallback(() => {
            const seleccion = ComplementosStore.getSeleccion();
            if (seleccion !== null) {
                setComplementosSeleccionados(seleccion);
                ComplementosStore.clear();
            }
        }, [])
    );

    useEffect(() => {
        if (articulo?.UUID) {
            Database.getComplementos(articulo.UUID)
                .then(setGruposComplementos)
                .catch(console.error);
        }
    }, []);

    const totalBruto = precioBase * cantidad;

    // Descuento sobre el TOTAL (precio × cantidad)
    const onChangePct = (val) => {
        const num = val.replace(/[^0-9.]/g, "");
        setDescuentoPct(num);
        if (num === "" || isNaN(parseFloat(num))) {
            setDescuentoMonto("");
        } else {
            const monto = (totalBruto * parseFloat(num)) / 100;
            setDescuentoMonto(monto.toFixed(2));
        }
    };

    const onChangeMonto = (val) => {
        const num = val.replace(/[^0-9.]/g, "");
        setDescuentoMonto(num);
        if (num === "" || isNaN(parseFloat(num))) {
            setDescuentoPct("");
        } else {
            const pct = (parseFloat(num) / totalBruto) * 100;
            setDescuentoPct(pct.toFixed(2));
        }
    };

    const descuento = useMemo(() => {
        const d = parseFloat(descuentoMonto);
        return isNaN(d) ? 0 : Math.min(d, totalBruto);
    }, [descuentoMonto, totalBruto]);

    const costoComplementos = useMemo(
        () => complementosSeleccionados.reduce((acc, c) => acc + (c.PRECIO || 0) * c.cantidad, 0),
        [complementosSeleccionados]
    );
    
    const total = totalBruto - descuento + costoComplementos;

    const handleAgregar = async () => {
        if (guardando) return;
        setGuardando(true);
        try {
            await Database.insertComanda({
                id_mesa: idMesa,
                nota: "",
                articulos: [{
                    ID_ARTICULO: articulo.UUID,
                    CANTIDAD: cantidad,
                    PRECIO_VENTA: precioBase,
                    NOTA: notas,
                    SUBTOTAL: totalBruto,
                    TOTAL: total,
                    complementos: complementosSeleccionados.map(c => ({
                        ID_COMPLEMENTO: c.UUID,
                        CANTIDAD: c.cantidad,
                        PRECIO_VENTA: c.PRECIO || 0,
                        NOTA: "",
                        SUBTOTAL: (c.PRECIO || 0) * c.cantidad,
                        TOTAL: (c.PRECIO || 0) * c.cantidad,
                    })),
                }],
            });
            router.back();
        } catch (err) {
            console.error("Error guardando comanda:", err);
        } finally {
            setGuardando(false);
        }
    };

    if (!articulo) {
        return (
            <SafeAreaView edges={["bottom"]} style={{ flex: 1, backgroundColor: "black" }}>
                <Text>Sin artículo</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView edges={["bottom"]} style={{ flex: 1, backgroundColor: "black" }}>

            {/* ── Header con gradiente ── */}
            <LinearGradient
                colors={gb.gradient_blue}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.header}
            >
                <RecoverButton />

                <Text style={s.headerNombre}>{articulo.NOMBRE}</Text>
                <Text style={s.headerPrecioBase}>${Number(precioBase).toFixed(2)} por unidad</Text>
            </LinearGradient>

            <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">

                {/* ── Notas de cocina ── */}
                <View style={s.seccion}>
                    <Text style={s.seccionTitulo}>Notas de cocina</Text>
                    <TextInput
                        style={s.textArea}
                        placeholder="Ej: sin sal, término medio..."
                        placeholderTextColor={gb.gray400}
                        value={notas}
                        onChangeText={setNotas}
                        multiline
                        numberOfLines={3}
                    />
                </View>

                {/* ── Complementos ── */}
                {gruposComplementos.length > 0 && (
                    <View style={s.seccion}>
                        <Text style={s.seccionTitulo}>Complementos</Text>
                        <Pressable
                            style={s.botonComplementos}
                            onPress={() => router.push({
                                pathname: "/DetalleComplemento",
                                params: {
                                    articulo: articuloRaw,
                                    gruposComplementos: JSON.stringify(gruposComplementos),
                                },
                            })}
                        >
                            <Ionicons name="add-circle-outline" size={normalize(20)} color={gb.blue550} />
                            <Text style={s.botonComplementosTexto}>
                                {complementosSeleccionados.length > 0
                                    ? `${complementosSeleccionados.length} complemento${complementosSeleccionados.length !== 1 ? "s" : ""} seleccionado${complementosSeleccionados.length !== 1 ? "s" : ""} ✓`
                                    : `+ Agregar complementos (${gruposComplementos.length} grupo${gruposComplementos.length !== 1 ? "s" : ""})`
                                }
                            </Text>
                        </Pressable>
                    </View>
                )}

                {/* ── Cantidad ── */}
                <View style={s.seccion}>
                    <Text style={s.seccionTitulo}>Cantidad</Text>
                    <View style={s.cantidadRow}>
                        <Text style={s.cantidadLabel}>Unidades</Text>
                        <InputCantidad
                            value={cantidad}
                            onChange={setCantidad}
                            style={s.inputCantidad}
                        />
                    </View>
                </View>

                {/* ── Descuento ── */}
                <View style={s.seccion}>
                    <Text style={s.seccionTitulo}>Descuento</Text>
                    <View style={s.descuentoRow}>
                        <View style={s.descuentoItem}>
                            <Text style={s.descuentoLabel}>Porcentaje (%)</Text>
                            <TextInput
                                style={s.descuentoInput}
                                placeholder="0.00"
                                placeholderTextColor={gb.gray400}
                                value={descuentoPct}
                                onChangeText={onChangePct}
                                keyboardType="decimal-pad"
                            />
                        </View>
                        <View style={s.descuentoItem}>
                            <Text style={s.descuentoLabel}>Monto ($)</Text>
                            <TextInput
                                style={s.descuentoInput}
                                placeholder="0.00"
                                placeholderTextColor={gb.gray400}
                                value={descuentoMonto}
                                onChangeText={onChangeMonto}
                                keyboardType="decimal-pad"
                            />
                        </View>
                    </View>
                </View>

                {/* ── Total ── */}
                <View style={s.seccion}>
                    <Text style={s.seccionTitulo}>Resumen</Text>

                    {/* Subtotal artículo */}
                    <View style={s.resumenFila}>
                        <Text style={s.resumenTextoIzq}>{articulo.NOMBRE} ×{cantidad}</Text>
                        <Text style={s.resumenTextoDer}>${totalBruto.toFixed(2)}</Text>
                    </View>

                    {/* Complementos seleccionados */}
                    {complementosSeleccionados.map((comp, idx) => (
                        <View key={idx} style={s.resumenFila}>
                            <Text style={s.resumenTextoIzq}>{comp.NOMBRE} ×{comp.cantidad}</Text>
                            <Text style={[s.resumenTextoDer, { color: gb.green600 }]}>
                                +${((comp.PRECIO || 0) * comp.cantidad).toFixed(2)}
                            </Text>
                        </View>
                    ))}

                    {/* Descuento */}
                    {descuento > 0 && (
                        <View style={s.resumenFila}>
                            <Text style={s.resumenTextoIzq}>Descuento</Text>
                            <Text style={[s.resumenTextoDer, { color: gb.red600 }]}>-${descuento.toFixed(2)}</Text>
                        </View>
                    )}

                    <View style={s.resumenDivider} />

                    <View style={s.totalRow}>
                        <Text style={s.totalLabel}>Total</Text>
                        <Text style={s.totalValor}>${total.toFixed(2)}</Text>
                    </View>
                </View>

            </ScrollView>

            {/* ── Botón fijo agregar ── */}
            <View style={s.footer}>
                <Button
                    gradient={guardando ? [gb.gray300, gb.gray400] : gb.gradient_blue}
                    onPress={handleAgregar}
                    styleContainer={s.botonAgregar}
                    disabled={guardando}
                >
                    <Text style={s.botonAgregarTexto}>
                        {guardando ? "Guardando..." : `Agregar al pedido · $${total.toFixed(2)}`}
                    </Text>
                </Button>
            </View>

        </SafeAreaView>
    );
};

export default DetalleArticulo;
