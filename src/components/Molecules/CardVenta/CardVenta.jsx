import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { gb } from '../../../screens/globalStyles';
import EstatusSincronizado from '../../atoms/EstatusSincronizado/EstatusSincronizado';
import { s } from './styles';

const GRADIENTE_PENDIENTE_SYNC = ["#F6C9A4", "#FBE6D4"];

const CardVenta = ({
    ficha = '34GGGDFDD',
    mesa = 'Mesa 2',
    total = '$1,000.00',
    productos = 4,
    fecha = '06/03/2026 15:45',
    status = 'Pagado',
    sincronizado = true,
    seleccionado = false,
    onSeleccionar,
    idComanda,
    descuento = 0,
    cuentaDividida = false,
}) => {
    const router = useRouter();

    const toggleCheck = () => {
        onSeleccionar?.(!seleccionado);
    };
    const onVer = () => {
        router.push(`Ventas/DetalleVentas?id=${idComanda ?? ficha}`);
    };

    const coloresHeader = !sincronizado
        ? GRADIENTE_PENDIENTE_SYNC
        : status === 'Terminado' || status === 'Pagado'
            ? ['#E8F5E8', '#F1F8E9']
            : status === 'Pendiente'
                ? ['#FFF3E0', '#FFECB3']
                : ['#FFEBEE', '#FFCDD2'];

    return (
        <View style={[s.shadow, !sincronizado && s.shadowPendiente]}>
            <View style={s.container}>
                {/* HEADER */}
                <LinearGradient style={s.header} colors={coloresHeader}>
                    <View style={s.fichaContainer}>

                        {/* Checkbox */}
                        <Pressable onPress={toggleCheck} style={s.checkbox}>
                            <Ionicons
                                name={seleccionado ? "checkbox" : "square-outline"}
                                size={22}
                                color={seleccionado ? gb.purple550 : gb.gray400}
                            />
                        </Pressable>

                        {/* Ficha */}
                        <View style={s.ficha}>
                            <Text style={s.fichaText}>Ficha</Text>
                            <Text style={s.fichaNumber} numberOfLines={1}>{ficha}</Text>
                        </View>

                        {/* Estatus sincronización */}
                        <EstatusSincronizado sincronizado={sincronizado} />

                        {!sincronizado ? (
                            <View style={[s.status, { backgroundColor: '#E65100' }]}>
                                <Ionicons name="cloud-upload-outline" size={14} color="white" />
                                <Text style={s.statusText}>Por sincronizar</Text>
                            </View>
                        ) : status === 'Terminado' || status === 'Pagado' ? (
                            <View style={[s.status, { backgroundColor: '#4CAF50' }]}>
                                <Ionicons name="checkmark-circle" size={14} color="white" />
                                <Text style={s.statusText}>{status}</Text>
                            </View>
                        ) : status === 'Pendiente' ? (
                            <View style={[s.status, { backgroundColor: '#FF9800' }]}>
                                <Ionicons name="time" size={14} color="white" />
                                <Text style={s.statusText}>{status}</Text>
                            </View>
                        ) : (
                            <View style={[s.status, { backgroundColor: '#F44336' }]}>
                                <Ionicons name="alert-circle" size={14} color="white" />
                                <Text style={s.statusText}>{status}</Text>
                            </View>
                        )}

                    </View>
                </LinearGradient>

                {/* BODY */}
                <View style={s.body}>

                    {/* Mesa y Total */}
                    <View style={s.rowSpaceBetween}>
                        <View style={s.mesaContainer}>
                            <Ionicons name="grid" size={14} color={gb.purple550} style={{ marginRight: 4 }} />
                            <Text style={s.mesa}>{mesa}</Text>
                        </View>
                        <Text style={s.total}>{total}</Text>
                    </View>

                    <View style={s.lineaSeparadora} />

                    <View style={s.rowSpaceBetween}>
                        <View style={s.infoChip}>
                            <Ionicons name="fast-food" size={13} color={gb.gray400} />
                            <Text style={s.infoText}>{productos} productos</Text>
                        </View>
                        <View style={s.infoChip}>
                            <Ionicons name="time" size={13} color={gb.gray400} />
                            <Text style={s.infoText}>{fecha}</Text>
                        </View>
                    </View>

                    {(Number(descuento) > 0 || cuentaDividida) && (
                        <>
                            <View style={s.lineaSeparadora} />
                            <View style={s.badgesRow}>
                                {Number(descuento) > 0 && (
                                    <View style={s.badgeDescuento}>
                                        <Ionicons name="pricetag-outline" size={12} color="#C62828" />
                                        <Text style={s.badgeDescuentoText}>
                                            Desc. -${Number(descuento).toLocaleString("es-MX", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                        </Text>
                                    </View>
                                )}
                                {cuentaDividida && (
                                    <View style={s.badgeDividida}>
                                        <Ionicons name="people-outline" size={12} color={gb.blue550} />
                                        <Text style={s.badgeDivididaText}>Cuenta dividida</Text>
                                    </View>
                                )}
                            </View>
                        </>
                    )}

                    <View style={s.lineaSeparadora} />

                    <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                        <Pressable onPress={onVer} style={s.btnVer}>
                            <Ionicons name="eye-outline" size={15} color={gb.purple550} />
                            <Text style={s.btnVerText}>Ver detalle</Text>
                        </Pressable>
                    </View>

                </View>
            </View>
        </View>
    );
};

export default CardVenta;
