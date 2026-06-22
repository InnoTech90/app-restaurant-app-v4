import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { gb } from '../../../screens/globalStyles';
import EstatusSincronizado from '../../atoms/EstatusSincronizado/EstatusSincronizado';
import { s } from './styles';

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
}) => {
    const router = useRouter();

    const toggleCheck = () => {
        onSeleccionar?.(!seleccionado);
    };
    const onVer = () => {
        router.push(`Ventas/DetalleVentas?id=${idComanda ?? ficha}`);
    };

    return (
        <View style={s.shadow}>
            <View style={s.container}>
                {/* HEADER */}
                <LinearGradient style={s.header}
                    colors={
                        status === 'Terminado' || status === 'Pagado'
                            ? ['#E8F5E8', '#F1F8E9']
                            : status === 'Pendiente'
                                ? ['#FFF3E0', '#FFECB3']
                                : ['#FFEBEE', '#FFCDD2']
                    }>
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

                        {/* Status badge */}
                        {
                            status === 'Terminado' || status === 'Pagado' ? (
                                <View style={[s.status, { backgroundColor: '#4CAF50' }]}>
                                    <Ionicons name="checkmark-circle" size={14} color="white" />
                                    <Text style={s.statusText}>{status}</Text>
                                </View>
                            )
                                :
                                status === 'Pendiente' ? (
                                    <View style={[s.status, { backgroundColor: '#FF9800' }]}>
                                        <Ionicons name="time" size={14} color="white" />
                                        <Text style={s.statusText}>{status}</Text>
                                    </View>
                                ) :
                                    <View style={[s.status, { backgroundColor: '#F44336' }]}>
                                        <Ionicons name="alert-circle" size={14} color="white" />
                                        <Text style={s.statusText}>{status}</Text>
                                    </View>

                        }

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

                    {/* Productos y Fecha */}
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

                    <View style={s.lineaSeparadora} />

                    {/* Botón Ver */}
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
