import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "expo-router";
import { useLocalSearchParams } from "expo-router/build/hooks";
import { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import RecoverButton from "../../../components/atoms/RecoverButton/RecoverButton";
import CardProductoVenta from "../../../components/Molecules/CardProductoVenta/CardProductoVenta";
import InformacionOrden from "../../../components/Molecules/InformacionOrden/InformacionOrden";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";
import { gb } from "../../globalStyles";
import VentasDatabase from "./database";
import { s } from "./styles";

const estatusTexto = (estatus) => {
    if (estatus === 1) return "Pagado";
    if (estatus === 2) return "Pendiente";
    if (estatus === 3) return "Cancelado";
    return "Desconocido";
};

const estatusColor = (estatus) => {
    if (estatus === 1) return "#4CAF50";
    if (estatus === 2) return "#FF9800";
    return "#F44336";
};

const DetalleVentas = () => {
    const { id } = useLocalSearchParams();
    const [cargando, setCargando] = useState(true);
    const [detalle, setDetalle] = useState(null);

    useFocusEffect(
        useCallback(() => {
            let activo = true;
            const cargar = async () => {
                try {
                    setCargando(true);
                    const data = await VentasDatabase.getDetalleVenta(id);
                    if (activo) setDetalle(data);
                } catch (e) {
                    console.error("Error cargando detalle venta:", e);
                } finally {
                    if (activo) setCargando(false);
                }
            };
            cargar();
            return () => { activo = false; };
        }, [id])
    );

    const comanda = detalle?.comanda;
    const articulos = detalle?.articulos ?? [];

    return (
        <SafeAreaView edges={["bottom"]} style={{ flex: 1, backgroundColor: "black" }}>
            {/* header */}
            <LinearGradient
                style={s.header}
                colors={gb.gradient_blue}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
            >
                <RecoverButton href="/Ventas" />
                <View style={{ alignItems: "center" }}>
                    <Text style={s.titleDetalleVenta}>Venta</Text>
                    <Text style={s.venta}>Folio #{comanda?.FICHA ?? id}</Text>
                </View>
                {comanda && (
                    <View style={{
                        paddingHorizontal: normalize(8),
                        paddingVertical: normalize(4),
                        borderRadius: normalize(10),
                        backgroundColor: estatusColor(comanda.ESTATUS),
                    }}>
                        <Text style={{ color: "white", fontSize: normalize(11), fontWeight: "600" }}>
                            {estatusTexto(comanda.ESTATUS)}
                        </Text>
                    </View>
                )}
            </LinearGradient>

            {cargando ? (
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: gb.gray50 }}>
                    <ActivityIndicator size="large" color={gb.purple550} />
                </View>
            ) : !comanda ? (
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: gb.gray50 }}>
                    <Ionicons name="alert-circle-outline" size={normalize(50)} color={gb.gray300} />
                    <Text style={{ color: gb.gray400, marginTop: normalize(12) }}>Venta no encontrada.</Text>
                </View>
            ) : (
                <>
                    {/* Info general */}
                    <View style={s.contenidoDetalle}>
                        <InformacionOrden
                            montoTotal={(comanda.TOTAL ?? 0).toFixed(2)}
                            productosLength={articulos.length}
                        />
                        {/* Fila de datos */}
                        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: normalize(8), marginTop: normalize(8) }}>
                            <_InfoChip icono="grid" texto={comanda.MESA_NOMBRE ?? "Sin mesa"} />
                            <_InfoChip icono="person" texto={comanda.CLIENTE_NOMBRE ?? "Sin cliente"} />
                            <_InfoChip icono="wallet-outline" texto={comanda.FORMATO_PAGO ?? "Sin método"} />
                            {comanda.NOTA ? <_InfoChip icono="document-text-outline" texto={comanda.NOTA} /> : null}
                        </View>
                        {/* Desglose */}
                        <View style={{ marginTop: normalize(10), gap: normalize(4) }}>
                            <_FilaDesglose label="Subtotal"     valor={comanda.SUBTOTAL}    />
                            <_FilaDesglose label="Descuento"    valor={comanda.DESCUENTO}   resta />
                            <_FilaDesglose label="Propina"      valor={comanda.PROPINA}     />
                            <_FilaDesglose label="Costo envío"  valor={comanda.COSTO_ENVIO} />
                            <View style={{ borderTopWidth: 1, borderTopColor: gb.gray200, paddingTop: normalize(4) }}>
                                <_FilaDesglose label="TOTAL" valor={comanda.TOTAL} bold />
                            </View>
                        </View>
                    </View>

                    {/* Artículos */}
                    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                        <View style={s.contenidoProductos}>
                            {articulos.map((art) => (
                                <CardProductoVenta
                                    key={art.ID}
                                    producto={art.ARTICULO_NOMBRE ?? "Artículo"}
                                    cantidad={art.CANTIDAD}
                                    precioUnitario={art.PRECIO_VENTA ?? art.ARTICULO_PRECIO ?? 0}
                                    complementos={(art.complementos ?? []).map((c) => ({
                                        id: c.ID,
                                        nombre: c.COMP_NOMBRE ?? "Complemento",
                                        precio: c.COMP_PRECIO ?? 0,
                                    }))}
                                />
                            ))}
                        </View>
                    </ScrollView>
                </>
            )}
        </SafeAreaView>
    );
};

// ── Subcomponentes internos ───────────────────────────────────────────────────
const _InfoChip = ({ icono, texto }) => (
    <View style={{
        flexDirection: "row", alignItems: "center", gap: normalize(4),
        backgroundColor: gb.gray100, borderRadius: normalize(8),
        paddingHorizontal: normalize(8), paddingVertical: normalize(4),
    }}>
        <Ionicons name={icono} size={normalize(13)} color={gb.gray500} />
        <Text style={{ fontSize: normalize(12), color: gb.gray600 }}>{texto}</Text>
    </View>
);

const _FilaDesglose = ({ label, valor, resta, bold }) => {
    if (!valor && valor !== 0) return null;
    const num = parseFloat(valor) || 0;
    if (num === 0) return null;
    return (
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontSize: normalize(12), color: gb.gray500, fontWeight: bold ? "700" : "400" }}>
                {label}
            </Text>
            <Text style={{ fontSize: normalize(12), color: resta ? "#F44336" : gb.gray700, fontWeight: bold ? "700" : "400" }}>
                {resta ? "- " : ""}${num.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
            </Text>
        </View>
    );
};

export default DetalleVentas;
