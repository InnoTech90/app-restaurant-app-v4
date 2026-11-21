import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { color } from "../../../utils/theme";
import { s } from "./styles";

const ESTATUS = {
    Pagado: { fondo: color.successSoft, texto: "#117040", icono: "checkmark-circle" },
    Terminado: { fondo: color.successSoft, texto: "#117040", icono: "checkmark-circle" },
    Pendiente: { fondo: color.warningSoft, texto: "#A15C00", icono: "time" },
};
const ESTATUS_OTRO = { fondo: color.dangerSoft, texto: "#C93A3F", icono: "alert-circle" };

/**
 * Renglón compacto de venta (estilo moderno). Toda la tarjeta abre el
 * detalle; la casilla de la izquierda selecciona para limpiar/sincronizar.
 * `memo`: con listas de miles de ventas evita repintar renglones sin cambios.
 */
const CardVenta = ({
    ficha = "",
    mesa = "Mesa",
    total = "$0.00",
    productos = 0,
    fecha = "",
    status = "Pagado",
    sincronizado = true,
    seleccionado = false,
    onSeleccionar,
    idComanda,
    descuento = 0,
    cuentaDividida = false,
    esPedidoEnLinea = false,
}) => {
    const router = useRouter();
    const est = ESTATUS[status] ?? ESTATUS_OTRO;
    const hora = String(fecha).split(" ")[1] ?? fecha;
    const dia = String(fecha).split(" ")[0] ?? "";

    return (
        <Pressable
            onPress={() => router.push(`Ventas/DetalleVentas?id=${idComanda ?? ficha}`)}
            style={({ pressed }) => [
                s.card,
                !sincronizado && s.cardPendiente,
                seleccionado && s.cardSeleccionada,
                pressed && s.cardPresionada,
            ]}
        >
            <Pressable
                onPress={() => onSeleccionar?.(!seleccionado)}
                hitSlop={10}
                style={s.checkbox}
                accessibilityLabel="Seleccionar venta"
            >
                <Ionicons
                    name={seleccionado ? "checkbox" : "square-outline"}
                    size={22}
                    color={seleccionado ? color.primary : color.textMuted}
                />
            </Pressable>

            <View style={[s.ficha, !sincronizado && s.fichaPendiente]}>
                <Text style={[s.fichaTexto, !sincronizado && s.fichaTextoPendiente]} numberOfLines={1}>
                    #{ficha}
                </Text>
            </View>

            <View style={s.info}>
                <Text style={s.mesa} numberOfLines={1}>
                    {mesa}
                </Text>
                <Text style={[s.meta, !sincronizado && s.metaPendiente]} numberOfLines={1}>
                    {`${productos} ${Number(productos) === 1 ? "producto" : "productos"} · ${hora}`}
                </Text>
                {(Number(descuento) > 0 || cuentaDividida || esPedidoEnLinea) && (
                    <View style={s.badges}>
                        {esPedidoEnLinea && <Text style={s.badge}>En línea</Text>}
                        {Number(descuento) > 0 && (
                            <Text style={s.badge}>
                                Desc. -${Number(descuento).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                            </Text>
                        )}
                        {cuentaDividida && <Text style={s.badge}>Dividida</Text>}
                    </View>
                )}
            </View>

            <View style={s.derecha}>
                <Text style={s.total}>{total}</Text>
                <View style={[s.estatus, { backgroundColor: est.fondo }]}>
                    <Ionicons name={est.icono} size={11} color={est.texto} />
                    <Text style={[s.estatusTexto, { color: est.texto }]}>{status}</Text>
                </View>
                {/* Estado de sincronización, siempre visible */}
                <View style={[s.sync, sincronizado ? s.syncOk : s.syncPend]}>
                    <Ionicons
                        name={sincronizado ? "cloud-done-outline" : "cloud-upload-outline"}
                        size={12}
                        color={sincronizado ? color.success : "#C97700"}
                    />
                    <Text style={[s.syncTexto, { color: sincronizado ? color.success : "#C97700" }]}>
                        {sincronizado ? "Sincronizada" : "Por sincronizar"}
                    </Text>
                </View>
                {dia ? <Text style={s.dia}>{dia}</Text> : null}
            </View>
        </Pressable>
    );
};

export default memo(CardVenta);
