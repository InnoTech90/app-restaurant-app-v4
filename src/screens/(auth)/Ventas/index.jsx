import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../../../components/atoms/Button/Button";
import GeneralModal from "../../../components/atoms/GeneralModal/GeneralModal";
import RecoverButton from "../../../components/atoms/RecoverButton/RecoverButton";
import CardVenta from "../../../components/Molecules/CardVenta/CardVenta";
import NipModal from "../../../components/Molecules/NipModal/NipModal";
import SincronizadoFooter from "../../../components/Molecules/SincronizadoFooter/SincronizadoFooter";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";
import { gb } from "../../globalStyles";
import VentasDatabase from "./database";
import { integracionVentas } from "./integracion";
import { s } from "./styles";
import { imprimirCorteGeneral, imprimirCorteResumen } from "./ticket";

// Convierte ESTATUS numérico a la cadena que muestra la UI
const estatusTexto = (estatus) => {
    if (estatus === 1) return "Pagado";
    if (estatus === 2) return "Pendiente";
    if (estatus === 3) return "Cancelado";
    return "Desconocido";
};

const formatFecha = (fechaStr) => {
    if (!fechaStr) return "—";
    const [datePart, timePart = ""] = fechaStr.split(" ");
    const [yyyy, mm, dd] = datePart.split("-");
    return `${dd}/${mm}/${yyyy} ${timePart.slice(0, 5)}`;
};

const formatTotal = (total) =>
    `$${(total ?? 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;

const Ventas = () => {
    const [filtroSeleccionado, setFiltroSeleccionado] = useState("Todas");
    const [modalNip, setModalNip] = useState(false);
    const [modalNoBorrar, setModalNoBorrar] = useState(false);
    const [modalCorte, setModalCorte] = useState(false);
    const [imprimiendoCorte, setImprimiendoCorte] = useState(false);
    const [cargando, setCargando] = useState(true);    const [errorCarga, setErrorCarga] = useState(null);    const [ventas, setVentas] = useState([]);
    const [sincronizando, setSincronizando] = useState(false);

    // ── Cargar ventas al enfocar pantalla ──────────────────────────────────
    useFocusEffect(
        useCallback(() => {
            let activo = true;
            const cargar = async () => {
                try {
                    setCargando(true);
                    const data = await VentasDatabase.getVentas();
                    if (activo) {
                        // Agregar campo seleccionado para el checkbox de limpiar
                        setVentas(data.map((v) => ({ ...v, seleccionado: false })));
                    }
                } catch (e) {
                    console.error("Error cargando ventas:", e);
                    if (activo) setErrorCarga(String(e?.message ?? e));
                } finally {
                    if (activo) setCargando(false);
                }
            };
            cargar();
            return () => { activo = false; };
        }, [])
    );

    // ── Filtrado ───────────────────────────────────────────────────────────
    const ventasFiltradasState = useMemo(() => {
        if (filtroSeleccionado === "Pendientes") return ventas.filter((v) => v.ESTATUS === 2);
        if (filtroSeleccionado === "Canceladas") return ventas.filter((v) => v.ESTATUS === 3);
        return ventas;
    }, [ventas, filtroSeleccionado]);

    // ── Totales ────────────────────────────────────────────────────────────
    // "Total filtrado" = ventas pagadas EN EFECTIVO (ESTATUS=1, FORMATO_PAGO contiene "efectivo")
    const totalFiltrado = useMemo(() =>
        ventas
            .filter((v) => v.ESTATUS === 1 && (v.FORMATO_PAGO ?? "").toLowerCase().includes("efectivo"))
            .reduce((sum, v) => sum + (v.TOTAL ?? 0), 0),
        [ventas]
    );
    // "Total general" = todas las ventas pagadas (ESTATUS=1), sin pendientes ni canceladas
    const totalGeneral = useMemo(() =>
        ventas
            .filter((v) => v.ESTATUS === 1)
            .reduce((sum, v) => sum + (v.TOTAL ?? 0), 0),
        [ventas]
    );

    // ── Imprimir corte ─────────────────────────────────────────────────────
    const imprimirCorte = async (tipo) => {
        setModalCorte(false);
        setImprimiendoCorte(true);
        try {
            const datos = await VentasDatabase.getDatosCorte();
            if (tipo === 'RESUMEN') {
                await imprimirCorteResumen(datos);
            } else {
                await imprimirCorteGeneral(datos);
            }
        } catch (e) {
            console.error('Error al imprimir corte:', e);
            Alert.alert('Error', 'No se pudo imprimir el corte.');
        } finally {
            setImprimiendoCorte(false);
        }
    };

    // ── Seleccionar todo / ninguno ────────────────────────────────────────
    const todoSeleccionado = ventasFiltradasState.length > 0 &&
        ventasFiltradasState.every((v) => v.seleccionado);

    const toggleSeleccionarTodo = () => {
        const nuevoValor = !todoSeleccionado;
        const idsVistual = new Set(ventasFiltradasState.map((v) => v.ID));
        setVentas((prev) =>
            prev.map((v) => idsVistual.has(v.ID) ? { ...v, seleccionado: nuevoValor } : v)
        );
    };

    // ── Limpiar ventas ────────────────────────────────────────────────────
    const limpiarVentas = () => {
        // Solo se eliminan las seleccionadas que además estén sincronizadas y no sean pendientes.
        // Las seleccionadas no sincronizadas simplemente se ignoran (no se eliminan).
        const hayElegibles = ventasFiltradasState.some(
            (v) => v.seleccionado && !!v.SINCRONIZADO && v.ESTATUS !== 2
        );
        if (!hayElegibles) {
            setModalNoBorrar(true);
            setModalNip(false);
            return;
        }
        const idsAEliminar = new Set(
            ventasFiltradasState
                .filter((v) => v.seleccionado && !!v.SINCRONIZADO && v.ESTATUS !== 2)
                .map((v) => v.ID)
        );
        setVentas((prev) => prev.filter((v) => !idsAEliminar.has(v.ID)));
        setModalNip(false);
    };

    return (
        <SafeAreaView edges={["bottom"]} style={{ flex: 1, backgroundColor: "black" }}>
            {/* ----------- header ----------- */}
            <LinearGradient
                style={s.header}
                colors={gb.gradient_blue}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
            >
                <RecoverButton />
                 {/* ----------- seleccionar todo ----------- */}
                {ventasFiltradasState.length > 0 && (
                    <View style={{ }}>
                        <Button
                            style={[
                                s.ButtonFiltro,
                                
                                todoSeleccionado && { flex: undefined, borderColor: gb.purple500, backgroundColor: gb.purple550 },
                            ]}
                            styleContainer={{ height: normalize(32), paddingHorizontal: 0, flex: undefined }}
                            onPress={toggleSeleccionarTodo}
                        >
                            <View style={[s.buttonContent, { paddingHorizontal: normalize(4) }]}>
                                <Ionicons
                                    name={todoSeleccionado ? "checkbox" : "square-outline"}
                                    size={normalize(14)}
                                    color={todoSeleccionado ? gb.gray50 : gb.purple100}
                                />
                                <Text style={{ color: todoSeleccionado ? gb.gray50 : gb.gray50, fontSize: normalize(12) }}>
                                    {todoSeleccionado ? "Deseleccionar todo" : "Seleccionar todo"}
                                </Text>
                            </View>
                        </Button>
                    </View>
                )}

                <Button style={s.btnLimpiar} onPress={() => setModalNip(true)}>
                    <Ionicons name="trash" size={normalize(14)} color={gb.gray50} />
                    <Text style={s.btnLimpiarText}>Limpiar Ventas</Text>
                </Button>
            </LinearGradient>

            {/* ----------- filtros ----------- */}
            <View style={{ shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 }}>
                <View style={s.filtros}>
                    {[
                        { label: "Todas",      icono: "list" },
                        { label: "Pendientes", icono: "wallet-outline" },
                        { label: "Canceladas", icono: "close-circle-outline" },
                    ].map(({ label, icono }) => {
                        const activo = filtroSeleccionado === label;
                        return (
                            <Button
                                key={label}
                                style={[s.ButtonFiltro, activo && s.botonFiltroSeleccionado]}
                                styleText={activo ? { color: gb.gray50 } : {}}
                                styleContainer={s.buttonCOntainer}
                                onPress={() => setFiltroSeleccionado(label)}
                            >
                                <View style={s.buttonContent}>
                                    <Ionicons name={icono} size={normalize(14)} color={activo ? gb.gray50 : gb.purple550} />
                                    <Text style={{ color: activo ? gb.gray50 : gb.gray400 }}>{label}</Text>
                                </View>
                            </Button>
                        );
                    })}
                </View>

               
                {/* ----------- totales ----------- */}
                <View style={s.totalesContainer}>
                    <LinearGradient colors={["#2196F3", "#42A5F5"]} style={s.totalFiltrado}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <Ionicons name="cash" size={normalize(18)} color={gb.gray50} style={{ marginRight: normalize(5) }} />
                            <Text style={s.precio}>{formatTotal(totalFiltrado)}</Text>
                        </View>
                        <Text style={s.descripcion}>Total efectivo</Text>
                    </LinearGradient>
                    <LinearGradient colors={["#FF9800", "#FFB74D"]} style={s.totalFiltrado}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <Ionicons name="trending-up" size={normalize(18)} color={gb.gray50} style={{ marginRight: normalize(5) }} />
                            <Text style={s.precio}>{formatTotal(totalGeneral)}</Text>
                        </View>
                        <Text style={s.descripcion}>Total general</Text>
                    </LinearGradient>
                </View>
            </View>

            {/* ----------- lista de ventas ----------- */}
            <ScrollView
                contentContainerStyle={{ flexGrow: 1, backgroundColor: gb.gray50 }}
                style={s.scroll}
            >
                <View style={s.container}>
                    {cargando ? (
                        <ActivityIndicator size="large" color={gb.purple550} style={{ marginTop: normalize(40) }} />
                    ) : errorCarga ? (
                        <View style={{ alignItems: "center", marginTop: normalize(40), paddingHorizontal: normalize(20) }}>
                            <Ionicons name="alert-circle-outline" size={normalize(50)} color="#F44336" />
                            <Text style={{ color: "#F44336", marginTop: normalize(12), fontSize: normalize(12), textAlign: "center" }}>
                                {errorCarga}
                            </Text>
                        </View>
                    ) : ventasFiltradasState.length === 0 ? (
                        <View style={{ alignItems: "center", marginTop: normalize(40) }}>
                            <Ionicons name="receipt-outline" size={normalize(60)} color={gb.gray300} />
                            <Text style={{ color: gb.gray400, marginTop: normalize(12), fontSize: normalize(14) }}>
                                No hay ventas{filtroSeleccionado !== "Todas" ? ` ${filtroSeleccionado.toLowerCase()}` : ""}.
                            </Text>
                        </View>
                    ) : (
                        <ScrollView
                            style={s.ventasContainer}
                            contentContainerStyle={{ gap: normalize(10), paddingBottom: normalize(20) }}
                        >
                            {ventasFiltradasState.map((venta) => (
                                <CardVenta
                                    key={venta.ID}
                                    ficha={String(venta.FICHA ?? venta.ID)}
                                    mesa={venta.MESA_NOMBRE ?? "Mesa"}
                                    total={formatTotal(venta.TOTAL)}
                                    productos={venta.NUM_ARTICULOS ?? 0}
                                    fecha={formatFecha(venta.FECHA)}
                                    status={estatusTexto(venta.ESTATUS)}
                                    sincronizado={!!venta.SINCRONIZADO}
                                    seleccionado={venta.seleccionado}
                                    idComanda={venta.ID}
                                    onSeleccionar={(valor) => {
                                        setVentas((prev) =>
                                            prev.map((v) =>
                                                v.ID === venta.ID ? { ...v, seleccionado: valor } : v
                                            )
                                        );
                                    }}
                                />
                            ))}
                        </ScrollView>
                    )}
                </View>
            </ScrollView>

            {/* ----------- footer ----------- */}
            <SincronizadoFooter
                onSincronizar={async () => {
                    if (sincronizando) return;

                    const idsSeleccionados = ventas
                        .filter((v) => v.seleccionado)
                        .map((v) => v.ID);

                    if (idsSeleccionados.length === 0) {
                        Alert.alert("Sincronización", "Selecciona al menos una venta para sincronizar.");
                        return;
                    }

                    setSincronizando(true);
                    try {
                        const { sincronizadas, ventas: ventasActualizadas } =
                            await integracionVentas.sincronizarVentas(idsSeleccionados);
                        setVentas(ventasActualizadas.map((v) => ({ ...v, seleccionado: false })));
                        if (sincronizadas === 0) {
                            Alert.alert("Sincronización", "Las ventas seleccionadas no están pendientes de sincronizar.");
                        }
                    } catch (e) {
                        console.error("Error sincronizando ventas:", e);
                        Alert.alert("Error", "No se pudieron sincronizar las ventas. Intenta de nuevo.");
                    } finally {
                        setSincronizando(false);
                    }
                }}
                sincronizando={sincronizando}
                onActualizar={() => setModalCorte(true)}
            />

            {/* ----------- modal tipo de corte ----------- */}
            <GeneralModal visible={modalCorte} onRequestClose={() => setModalCorte(false)}>
                <View style={s.modalContainer}>
                    <LinearGradient style={s.modalIconContainer} colors={[gb.blue550, gb.blue400]}>
                        <Ionicons name="print" size={normalize(40)} color={gb.gray50} />
                    </LinearGradient>
                    <Text style={s.modalTitle}>¿Qué desea imprimir?</Text>
                    <View style={{ flexDirection: 'row', gap: normalize(10), width: '100%', justifyContent: 'center' }}>
                        <Button
                            onPress={() => imprimirCorte('RESUMEN')}
                            style={[s.modalButton, { flex: 1, backgroundColor: gb.blue550 }]}
                        >
                            <Text style={[s.modalButtonText, { color: gb.gray50 }]}>Resumen</Text>
                        </Button>
                        <Button
                            onPress={() => imprimirCorte('GENERAL')}
                            style={[s.modalButton, { flex: 1, backgroundColor: gb.purple550 }]}
                        >
                            <Text style={[s.modalButtonText, { color: gb.gray50 }]}>General</Text>
                        </Button>
                    </View>
                </View>
            </GeneralModal>

            {/* ----------- nip modal ----------- */}
            
            <NipModal
                visible={modalNip}
                titulo="Limpiar Ventas"
                onSubmit={limpiarVentas}
                onClose={() => setModalNip(false)}
            />

            {/* ----------- modal no borrar ----------- */}
            <GeneralModal visible={modalNoBorrar} onRequestClose={() => setModalNoBorrar(false)}>
                <View style={s.modalContainer}>
                    <LinearGradient style={s.modalIconContainer} colors={[gb.yellow500, gb.yellow300]}>
                        <Ionicons name="warning" size={normalize(40)} color={gb.gray50} />
                    </LinearGradient>
                    <Text style={s.modalTitle}>
                        Solo se pueden limpiar ventas sincronizadas que estén pagadas o canceladas
                    </Text>
                    <Button onPress={() => setModalNoBorrar(false)} style={s.modalButton}>
                        <Text style={s.modalButtonText}>Aceptar</Text>
                    </Button>
                </View>
            </GeneralModal>
        </SafeAreaView>
    );
};

export default Ventas;


// const Ventas = () => {
//     const [filtroSeleccionado, setFiltroSeleccionado] = useState("Todas");
//     const [modalNip, setModalNip] = useState(false);
//     const [modalNoBorrar, setModalNoBorrar] = useState(false);
    

//     const limpiarVentas = async () => {

//         //    Aquí iría la lógica para limpiar las ventas en la base de datos o estado global 
//         // solo se podran limpiar ventas si estan sincronizadas, por lo que se eliminarán las ventas que tengan sincronizado en true
//         // solo se podran eliminar ventas pagadas o canceladas, no se podran eliminar ventas pendientes
//         // se eliminaran las ventas del estado global para que se refleje el cambio en la interfaz
//         // solo se eliminan las ventas que esten seleccionadas
//         if (!ventasFiltradasState.some(v => v.sincronizado && (v.status === "Pagado" || v.status === "Cancelado") && v.seleccionado )) {
//             setModalNoBorrar(true);
//             setModalNip(false);
//             return;
//         }
//         // solo tomara en cuenta las filtradas
//         const idsAEliminar = new Set(
//             ventasFiltradasState
//                 .filter(v => v.sincronizado && (v.status === "Pagado" || v.status === "Cancelado") && v.seleccionado)
//                 .map(v => v.id)
//         );
//         setVentas(prev => prev.filter(v => !idsAEliminar.has(v.id)));
//         setModalNip(false);
//     }

//     const ventasGenerales = 1000000;
//     const ventasFiltradas = 200;


//     const [ventas, setVentas] = useState([
//         {
//             id: 1,
//             ficha: '34GGGDFDD',
//             mesa: 'Mesa 2',
//             total: '$1,000.00',
//             productos: 4,
//             fecha: '06/03/2026 15:45',
//             status: 'Pagado',
//             sincronizado: true,
//             seleccionado: false,
//         },
//         {
//             id: 2,
//             ficha: '34GGGDFDD',
//             mesa: 'Mesa 3',
//             total: '$1,000.00',
//             productos: 12,
//             fecha: '06/03/2026 15:45',
//             status: 'Pendiente',
//             sincronizado: false,
//             seleccionado: false,
//         },
//         {
//             id: 3,
//             ficha: '34GGGDFDD',
//             mesa: 'Mesa 3',
//             total: '$1,000.00',
//             productos: 12,
//             fecha: '06/03/2026 15:45',
//             status: 'Cancelado',
//             sincronizado: false,
//             seleccionado: false,
//         }
//     ]);
//     const ventasFiltradasState = useMemo(() => {
//         if (filtroSeleccionado === "Pendientes") return ventas.filter(v => v.status === "Pendiente");
//         if (filtroSeleccionado === "Canceladas") return ventas.filter(v => v.status === "Cancelado");
//         return ventas;
//     }, [ventas, filtroSeleccionado]);

//     return (
//         <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: "black" }} >
//             {/* ----------- header ----------- */}
//             <LinearGradient
//                 style={s.header}
//                 colors={gb.gradient_blue}
//                 start={{ x: 0, y: 0 }}
//                 end={{ x: 1, y: 0 }}
//             >
//                 <RecoverButton></RecoverButton>
//                 <Button style={s.btnLimpiar} onPress={() => setModalNip(true)}>
//                     <Ionicons name="trash" size={normalize(14)} color={gb.gray50} />
//                     <Text style={s.btnLimpiarText}>Limpiar Ventas</Text>
//                 </Button>

//             </LinearGradient>
//             {/* ----------- filtros ----------- */}
//             <View style={{
//                 shadowColor: "#000",
//                 shadowOpacity: 0.25,
//                 shadowRadius: 3.84,
//                 elevation: 5,
//             }}>

//                 <View style={s.filtros} >
//                     <Button
//                         style={[s.ButtonFiltro, filtroSeleccionado === "Todas" ? s.botonFiltroSeleccionado : {}]}
//                         styleText={filtroSeleccionado === "Todas" ? { color: gb.gray50 } : {}}
//                         styleContainer={s.buttonCOntainer}
//                         onPress={() => setFiltroSeleccionado("Todas")}
//                     >
//                         <View style={s.buttonContent}>
//                             <Ionicons name="list" size={normalize(14)} color={filtroSeleccionado === "Todas" ? gb.gray50 : gb.purple550} />
//                             <Text style={{ color: filtroSeleccionado === "Todas" ? gb.gray50 : gb.gray400 }}>Todas</Text>
//                         </View>
//                     </Button>
//                     <Button
//                         style={[s.ButtonFiltro, filtroSeleccionado === "Pendientes" ? s.botonFiltroSeleccionado : {}]}
//                         styleText={filtroSeleccionado === "Pendientes" ? { color: gb.gray50 } : {}}
//                         styleContainer={s.buttonCOntainer}
//                         onPress={() => setFiltroSeleccionado("Pendientes")}
//                     >
//                         <View style={s.buttonContent}>
//                             <Ionicons name="wallet-outline" size={normalize(14)} color={filtroSeleccionado === "Pendientes" ? gb.gray50 : gb.purple550} />
//                             <Text style={{ color: filtroSeleccionado === "Pendientes" ? gb.gray50 : gb.gray400 }}>Pendientes</Text>
//                         </View>
//                     </Button>
//                     <Button
//                         style={[s.ButtonFiltro, filtroSeleccionado === "Canceladas" ? s.botonFiltroSeleccionado : {}]}
//                         styleText={filtroSeleccionado === "Canceladas" ? { color: gb.gray50 } : {}}
//                         styleContainer={s.buttonCOntainer}
//                         onPress={() => setFiltroSeleccionado("Canceladas")}
//                     >

//                         <View style={s.buttonContent}>
//                             <Ionicons name="close-circle-outline" size={normalize(14)} color={filtroSeleccionado === "Canceladas" ? gb.gray50 : gb.purple550} />
//                             <Text style={{ color: filtroSeleccionado === "Canceladas" ? gb.gray50 : gb.gray400 }}>Canceladas</Text>
//                         </View>
//                     </Button>

//                 </View>
//                 {/* ----------- precios ----------- */}
//                 <View style={s.totalesContainer}>

//                     <LinearGradient
//                         colors={['#2196F3', '#42A5F5']}
//                         style={s.totalFiltrado}
//                     >
//                         <View style={{ flexDirection: "row", alignItems: "center" }}>
//                             <Ionicons name="cash" size={normalize(18)} color={gb.gray50} style={{ marginRight: normalize(5) }} />
//                             <Text style={s.precio}>${ventasFiltradas}</Text>
//                         </View>
//                         <Text style={s.descripcion}>Total filtrado</Text>

//                     </LinearGradient>
//                     <LinearGradient
//                         colors={['#FF9800', '#FFB74D']}
//                         style={s.totalFiltrado}
//                     >
//                         <View style={{ flexDirection: "row", alignItems: "center" }}>
//                             <Ionicons name="trending-up" size={normalize(18)} color={gb.gray50} style={{ marginRight: normalize(5) }} />
//                             <Text style={s.precio}>${ventasGenerales}</Text>
//                         </View>
//                         <Text style={s.descripcion}>Total general</Text>

//                     </LinearGradient>


//                 </View>
//             </View>
//             <ScrollView contentContainerStyle={{ flexGrow: 1, backgroundColor: gb.gray50 }} style={s.scroll}>
//                 {/* ----------- contenido ----------- */}
//                 <View style={s.container}>
//                     {/* ventas */}
//                     <ScrollView
//                         style={s.ventasContainer}
//                         contentContainerStyle={{ gap: normalize(10), paddingBottom: normalize(20) }}>
//                         {
//                             ventasFiltradasState.map((venta) => (
//                                 <CardVenta
//                                     key={venta.id}
//                                     ficha={venta.ficha}
//                                     mesa={venta.mesa}
//                                     total={venta.total}
//                                     productos={venta.productos}
//                                     fecha={venta.fecha}
//                                     status={venta.status}
//                                     sincronizado={venta.sincronizado}
//                                     seleccionado={venta.seleccionado}
//                                     onSeleccionar={(valor) => {
//                                         setVentas(prev => prev.map(v =>
//                                             v.id === venta.id ? { ...v, seleccionado: valor } : v
//                                         ));
//                                     }}
//                                 />
//                             ))
//                         }

//                     </ScrollView>
//                 </View>


//             </ScrollView>
//             {/* ----------- footer ----------- */}
//             <SincronizadoFooter onSincronizar={() => { /* lógica de sincronización */ }} onActualizar={() => { /* lógica de actualización */ }}></SincronizadoFooter>
//             {/* ----------- nip modal ----------- */}
//             <NipModal
//                 visible={modalNip}
//                 titulo={'Limpiar Ventas'}
//                 onSubmit={() => { limpiarVentas() }}
//                 onClose={() => { setModalNip(false) }}
//             ></NipModal>
//             {/* ----------- modal no borrar ----------- */}
//             <GeneralModal visible={modalNoBorrar} onRequestClose={() => setModalNoBorrar(false)}>
//                 <View style={s.modalContainer}>
//                     <LinearGradient style={s.modalIconContainer} colors={[gb.yellow500, gb.yellow300]}>
//                         <Ionicons name="warning" size={normalize(40)} color={gb.gray50} />
//                     </LinearGradient>
//                     <Text style={s.modalTitle}>Solo se pueden limpiar ventas sincronizadas que estén pagadas o canceladas</Text>
//                     <Button onPress={() => setModalNoBorrar(false)} style={s.modalButton}>
//                         <Text style={s.modalButtonText}>Aceptar</Text>
//                     </Button>
//                 </View>
//             </GeneralModal>
//         </SafeAreaView >
//     )

// }

// export default Ventas;