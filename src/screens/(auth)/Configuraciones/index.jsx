import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { ScrollView, Switch, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ConfigItem from "../../../components/atoms/ConfigItem/ConfigItem";
import InputToggle from "../../../components/atoms/InputToggle/InputToggle";
import Select from "../../../components/atoms/Select/Select";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";
import { gb } from "../../globalStyles";
import Database from "./database";
import { s } from "./styles";


// ─────────────────────────────────────────────────────────────────────────────
//  Encabezado de sección con degradado
// ─────────────────────────────────────────────────────────────────────────────
const SectionHeader = ({ titulo, iconName, color }) => (
    <LinearGradient
        colors={[color, color + "CC"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={s.seccionHeader}
    >
        <Ionicons name={iconName} size={normalize(15)} color={gb.gray50} />
        <Text style={s.seccionTitulo}>{titulo}</Text>
    </LinearGradient>
);

// ─────────────────────────────────────────────────────────────────────────────
//  Pantalla principal
// ─────────────────────────────────────────────────────────────────────────────
export default function Configuraciones() {
    const [cargando, setCargando] = useState(true);
    const [config, setConfig] = useState(null);
    const [formatosPago, setFormatosPago] = useState([]);
    const [tamañoFuentes, setTamañoFuentes] = useState([]);
    const debounceRef = useRef({});

    // ── Carga inicial ─────────────────────────────────────────────────────────
    useFocusEffect(
        useCallback(() => {
            async function cargar() {
                try {
                    await Database.runMigraciones();
                    const [cfg, fp, tf] = await Promise.all([
                        Database.getConfiguraciones(),
                        Database.getFormatosPago(),
                        Database.getTamañoFuentes(),
                    ]);
                    setConfig(cfg ?? {});
                    setFormatosPago(fp.map(f => ({ label: f.NOMBRE, value: f.ID })));
                    setTamañoFuentes(tf.map(f => ({ label: f.NOMBRE, value: f.ID })));
                } finally {
                    setCargando(false);
                }
            }
            cargar();
        }, [])
    );

    // ── Guardar inmediato (Switch, Select) ────────────────────────────────────
    const guardar = useCallback((campo, valor) => {
        setConfig(prev => ({ ...prev, [campo]: valor }));
        Database.updateConfiguracion(campo, valor).catch(console.error);
    }, []);

    // ── Guardar con debounce 600 ms (inputs numéricos) ────────────────────────
    const guardarDebounce = useCallback((campo, texto) => {
        setConfig(prev => ({ ...prev, [campo]: texto }));
        clearTimeout(debounceRef.current[campo]);
        debounceRef.current[campo] = setTimeout(() => {
            const valor = parseFloat(texto) || 0;
            Database.updateConfiguracion(campo, valor).catch(console.error);
        }, 600);
    }, []);

    if (cargando || !config) {
        return (
            <SafeAreaView style={s.root}>
                <LinearGradient
                    colors={gb.gradient_blue}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={s.header}
                >
                    <Text style={s.headerTitulo}>Configuraciones</Text>
                </LinearGradient>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={s.root} edges={['bottom']}>
            {/* Header */}
            <LinearGradient
                colors={gb.gradient_blue}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.header}
            >
                <Text style={s.headerTitulo}>Configuraciones</Text>
            </LinearGradient>

            <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>

                {/* ── General ───────────────────────────────────────────────── */}
                <View style={s.seccion}>
                    <SectionHeader titulo="General" iconName="settings-outline" color={gb.blue550} />

                    <ConfigItem
                        icon="phone-portrait-outline"
                        titulo="Nombre del dispositivo"
                        subtitulo="Registrado en tu red de sucursal"
                    >
                        <TextInput
                            value={config.NOMBRE_DISPOCITIVO ?? ""}
                            editable={false}
                            style={s.inputNombre}
                        />
                    </ConfigItem>

                    <ConfigItem
                        icon="storefront-outline"
                        titulo="Abierto a pedidos"
                        subtitulo="Permite recibir órdenes desde otros dispositivos"
                        border={false}
                    >
                        <Switch
                            value={!!config.ABIERTO_PEDIDOS}
                            onValueChange={v => guardar("ABIERTO_PEDIDOS", v ? 1 : 0)}
                            trackColor={{ false: gb.gray200, true: gb.blue550 }}
                            thumbColor={gb.gray50}
                        />
                    </ConfigItem>
                </View>

                {/* ── Impresión ─────────────────────────────────────────────── */}
                <View style={s.seccion}>
                    <SectionHeader titulo="Impresión" iconName="print-outline" color={gb.purple550} />

                    <ConfigItem
                        icon="receipt-outline"
                        iconColor={gb.purple550}
                        titulo="Imprimir ficha automáticamente"
                        subtitulo="Imprime al agregar un artículo nuevo"
                    >
                        <Switch
                            value={!!config.IMPRIMIR_FICHA}
                            onValueChange={v => guardar("IMPRIMIR_FICHA", v ? 1 : 0)}
                            trackColor={{ false: gb.gray200, true: gb.purple550 }}
                            thumbColor={gb.gray50}
                        />
                    </ConfigItem>

                    <ConfigItem
                        icon="refresh-outline"
                        iconColor={gb.purple550}
                        titulo="Solo productos nuevos"
                        subtitulo="Al reimprimir, solo incluye artículos no impresos aún"
                    >
                        <Switch
                            value={!!config.SOLO_PRODUCTOS_NUEVOS}
                            onValueChange={v => guardar("SOLO_PRODUCTOS_NUEVOS", v ? 1 : 0)}
                            trackColor={{ false: gb.gray200, true: gb.purple550 }}
                            thumbColor={gb.gray50}
                        />
                    </ConfigItem>

                    <ConfigItem
                        icon="text-outline"
                        iconColor={gb.purple550}
                        titulo="Tamaño de letra en ticket"
                        subtitulo="Ajusta el tamaño del texto impreso"
                        border={false}
                    >
                        <Select
                            options={tamañoFuentes}
                            value={config.ID_TAMAÑO_FUENTE}
                            onChange={v => guardar("ID_TAMAÑO_FUENTE", v)}
                            style={s.selectInline}
                        />
                    </ConfigItem>
                </View>

                {/* ── Finanzas ──────────────────────────────────────────────── */}
                <View style={s.seccion}>
                    <SectionHeader titulo="Finanzas" iconName="cash-outline" color={gb.green600} />

                    <ConfigItem
                        icon="car-outline"
                        iconColor={gb.green600}
                        titulo="Costo de envío"
                        subtitulo="Se aplica al total de la comanda"
                    >
                        <InputToggle
                            value={String(config.COSTO_ENVIO ?? "0")}
                            esPct={!!config.COSTO_ENVIO_ES_PCT}
                            onChangeValue={v => guardarDebounce("COSTO_ENVIO", v)}
                            onToggle={() => guardar("COSTO_ENVIO_ES_PCT", config.COSTO_ENVIO_ES_PCT ? 0 : 1)}
                        />
                    </ConfigItem>

                    <ConfigItem
                        icon="pie-chart-outline"
                        iconColor={gb.green600}
                        titulo="Impuestos"
                        subtitulo="Porcentaje o monto fijo por comanda"
                    >
                        <InputToggle
                            value={String(config.IMPUESTOS ?? "0")}
                            esPct={!!config.IMPUESTOS_ES_PCT}
                            onChangeValue={v => guardarDebounce("IMPUESTOS", v)}
                            onToggle={() => guardar("IMPUESTOS_ES_PCT", config.IMPUESTOS_ES_PCT ? 0 : 1)}
                        />
                    </ConfigItem>

                    <ConfigItem
                        icon="pricetag-outline"
                        iconColor={gb.green600}
                        titulo="Descuentos"
                        subtitulo="Descuento predeterminado al crear una comanda"
                    >
                        <InputToggle
                            value={String(config.DESCUENTOS ?? "0")}
                            esPct={!!config.DESCUENTOS_ES_PCT}
                            onChangeValue={v => guardarDebounce("DESCUENTOS", v)}
                            onToggle={() => guardar("DESCUENTOS_ES_PCT", config.DESCUENTOS_ES_PCT ? 0 : 1)}
                        />
                    </ConfigItem>

                    <ConfigItem
                        icon="card-outline"
                        iconColor={gb.green600}
                        titulo="Forma de pago predeterminada"
                        subtitulo="Método de cobro sugerido al cerrar comanda"
                        border={false}
                    >
                        <Select
                            options={formatosPago}
                            value={config.ID_FORMATO_PAGO}
                            onChange={v => guardar("ID_FORMATO_PAGO", v)}
                            style={s.selectInline}
                        />
                    </ConfigItem>
                </View>

                {/* ── Seguridad ─────────────────────────────────────────────── */}
                <View style={s.seccion}>
                    <SectionHeader titulo="Seguridad" iconName="lock-closed-outline" color={gb.red600} />

                    <ConfigItem
                        icon="eye-off-outline"
                        iconColor={gb.red600}
                        titulo="Proteger acceso a ventas"
                        subtitulo="Requiere NIP para ver el historial de ventas"
                    >
                        <Switch
                            value={!!config.PROTEGER_VENTAS}
                            onValueChange={v => guardar("PROTEGER_VENTAS", v ? 1 : 0)}
                            trackColor={{ false: gb.gray200, true: gb.red600 }}
                            thumbColor={gb.gray50}
                        />
                    </ConfigItem>

                    <ConfigItem
                        icon="keypad-outline"
                        iconColor={gb.red600}
                        titulo="NIP para finalizar ticket"
                        subtitulo="Solicita NIP antes de cobrar una comanda"
                    >
                        <Switch
                            value={!!config.NIP_FINALIZAR_TICKET}
                            onValueChange={v => guardar("NIP_FINALIZAR_TICKET", v ? 1 : 0)}
                            trackColor={{ false: gb.gray200, true: gb.red600 }}
                            thumbColor={gb.gray50}
                        />
                    </ConfigItem>

                    <ConfigItem
                        icon="shield-checkmark-outline"
                        iconColor={gb.red600}
                        titulo="Modo restrictivo"
                        subtitulo="Limita funciones avanzadas en este dispositivo"
                        border={false}
                    >
                        <Switch
                            value={!!config.MODO_RESTRICTIVO}
                            onValueChange={v => guardar("MODO_RESTRICTIVO", v ? 1 : 0)}
                            trackColor={{ false: gb.gray200, true: gb.red600 }}
                            thumbColor={gb.gray50}
                        />
                    </ConfigItem>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}
