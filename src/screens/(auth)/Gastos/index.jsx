import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  DeviceEventEmitter,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../../../components/atoms/Button/Button";
import EstatusSincronizado from "../../../components/atoms/EstatusSincronizado/EstatusSincronizado";
import NipModal from "../../../components/Molecules/NipModal/NipModal";
import RecoverButton from "../../../components/atoms/RecoverButton/RecoverButton";
import {
  MENSAJE_SIN_INTERNET,
  obtenerMensajeErrorRed,
  verificarConexionInternet,
} from "../../../utils/ConeccionAInternet/ConeccionAInternet";
import { useProteccionConfig } from "../../../utils/useProteccionConfig";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";
import { gb } from "../../globalStyles";
import { Database } from "./database";
import { GASTOS_REFRESH_EVENT } from "./events";
import { integracionGastos } from "./integracion";
import { s } from "./styles";

const formatearFechaCorta = (fechaIso) => {
  if (!fechaIso) return "—";
  const d = new Date(fechaIso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

/* ─── Gasto (registro) ─────────────────────────────────────────── */
const GastoRow = ({ registro, onEdit, onDelete }) => (
  <View style={s.gastoRow}>
    <Pressable style={s.gastoRowMain} onPress={() => onEdit(registro)}>
      <View style={{ flex: 1 }}>
        <Text style={s.gastoFecha}>{formatearFechaCorta(registro.FECHA)}</Text>
        {!!registro.NOTA && (
          <Text style={s.gastoNota} numberOfLines={2}>
            {registro.NOTA}
          </Text>
        )}
      </View>
      <Text style={s.gastoMonto}>${Number(registro.MONTO ?? 0).toFixed(2)}</Text>
      <EstatusSincronizado sincronizado={!!registro.SINCRONIZADO} />
    </Pressable>
    <Pressable
      style={s.conceptoDeleteBtn}
      onPress={() => onDelete(registro)}
      hitSlop={8}
      accessibilityLabel="Eliminar gasto"
    >
      <Ionicons name="trash-outline" size={normalize(16)} color={gb.red600} />
    </Pressable>
  </View>
);

/* ─── Concepto expandible ──────────────────────────────────────── */
const ConceptoAccordion = ({
  concepto,
  categoria,
  expandido,
  onToggle,
  onAddGasto,
  onEditGasto,
  onDeleteGasto,
}) => (
  <View style={s.conceptoAccordion}>
    <Pressable
      style={s.conceptoRow}
      onPress={onToggle}
      android_ripple={{ color: "#0001" }}
    >
      <Ionicons
        name={expandido ? "chevron-down" : "chevron-forward"}
        size={normalize(16)}
        color={gb.gray500}
      />
      <View style={s.conceptoRowInfo}>
        <View style={s.conceptoRowTopLine}>
          <Text style={s.conceptoRowNombre} numberOfLines={1}>
            {concepto.NOMBRE}
          </Text>
          <EstatusSincronizado sincronizado={!concepto.TIENE_PENDIENTES} />
        </View>
        {!!concepto.DESCRIPCION && (
          <Text style={s.conceptoRowPrecioBase} numberOfLines={1}>
            {concepto.DESCRIPCION}
          </Text>
        )}
      </View>
      <Text style={s.conceptoRowMonto}>
        ${Number(concepto.TOTAL ?? 0).toFixed(2)}
      </Text>
    </Pressable>

    {expandido && (
      <View style={s.gastosWrap}>
        <Pressable
          style={s.addGastoBtn}
          onPress={() => onAddGasto(concepto, categoria)}
        >
          <Ionicons
            name="add-circle-outline"
            size={normalize(16)}
            color={gb.blue550}
          />
          <Text style={s.addGastoBtnText}>Agregar gasto</Text>
        </Pressable>

        {(concepto.registros ?? []).length === 0 ? (
          <Text style={s.seccionVaciaText}>Sin gastos registrados</Text>
        ) : (
          (concepto.registros ?? []).map((r) => (
            <GastoRow
              key={String(r.ID)}
              registro={r}
              onEdit={onEditGasto}
              onDelete={onDeleteGasto}
            />
          ))
        )}
      </View>
    )}
  </View>
);

/* ─── Categoría expandible ─────────────────────────────────────── */
const CategoriaAccordion = ({
  categoria,
  expandida,
  conceptosExpandidos,
  onToggleCategoria,
  onToggleConcepto,
  onAddGasto,
  onEditGasto,
  onDeleteGasto,
}) => (
  <View style={s.seccion}>
    <Pressable onPress={onToggleCategoria}>
      <LinearGradient
        style={s.seccionHeader}
        colors={gb.gradient_blue}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Ionicons
          name={expandida ? "chevron-down" : "chevron-forward"}
          size={normalize(18)}
          color="white"
        />
        <Text style={s.seccionNombre} numberOfLines={1}>
          {categoria.NOMBRE}
        </Text>
        <Text style={s.seccionHeaderTotal}>
          ${Number(categoria.TOTAL ?? 0).toFixed(2)}
        </Text>
      </LinearGradient>
    </Pressable>

    {expandida && (
      <View style={s.conceptosWrap}>
        {(categoria.conceptos ?? []).length === 0 ? (
          <View style={s.seccionVacia}>
            <Text style={s.seccionVaciaText}>Sin conceptos</Text>
          </View>
        ) : (
          (categoria.conceptos ?? []).map((c) => (
            <ConceptoAccordion
              key={String(c.ID)}
              concepto={c}
              categoria={categoria}
              expandido={!!conceptosExpandidos[c.UUID]}
              onToggle={() => onToggleConcepto(c.UUID)}
              onAddGasto={onAddGasto}
              onEditGasto={onEditGasto}
              onDeleteGasto={onDeleteGasto}
            />
          ))
        )}
      </View>
    )}
  </View>
);

/* ─── Pantalla principal ───────────────────────────────────────── */
const Gastos = () => {
  const router = useRouter();
  const {
    accesoPermitido,
    modalAcceso,
    onAccesoCorrecto,
    onAccesoCancelado,
    tituloModal,
  } = useProteccionConfig({
    seccion: "gastos",
    configFlag: "MODO_RESTRICTIVO",
    tituloModal: "Gastos",
  });

  const [categorias, setCategorias] = useState([]);
  const [refrescando, setRefrescando] = useState(false);
  const [sincronizando, setSincronizando] = useState(false);
  const [catsExpandidas, setCatsExpandidas] = useState({});
  const [conceptosExpandidos, setConceptosExpandidos] = useState({});
  const [modalNipCrud, setModalNipCrud] = useState(false);
  const [accionPendiente, setAccionPendiente] = useState(null);
  // accionPendiente: { tipo: 'agregar'|'editar'|'eliminar', ...payload }

  const cargar = useCallback(async () => {
    try {
      const res = await Database.getGastosConConceptos();
      setCategorias(res ?? []);
    } catch (e) {
      console.error("Error al obtener gastos:", e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!accesoPermitido) return;
      cargar();
    }, [accesoPermitido, cargar]),
  );

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(GASTOS_REFRESH_EVENT, cargar);
    return () => sub.remove();
  }, [cargar]);

  const onRefresh = async () => {
    setRefrescando(true);
    await cargar();
    setRefrescando(false);
  };

  const totalGeneral = categorias.reduce(
    (sum, cat) => sum + Number(cat.TOTAL ?? 0),
    0,
  );

  const toggleCategoria = (uuid) =>
    setCatsExpandidas((prev) => ({ ...prev, [uuid]: !prev[uuid] }));

  const toggleConcepto = (uuid) =>
    setConceptosExpandidos((prev) => ({ ...prev, [uuid]: !prev[uuid] }));

  const irAAgregarGasto = (concepto, categoria) => {
    setAccionPendiente({
      tipo: "agregar",
      titulo: "Nuevo gasto",
      concepto,
      categoria,
    });
    setModalNipCrud(true);
  };

  const irAEditarGasto = (registro) => {
    setAccionPendiente({
      tipo: "editar",
      titulo: "Editar gasto",
      registro,
    });
    setModalNipCrud(true);
  };

  const eliminarGasto = (registro) => {
    setAccionPendiente({
      tipo: "eliminar",
      titulo: "Eliminar gasto",
      registro,
    });
    setModalNipCrud(true);
  };

  const onNipCrudCorrecto = async () => {
    const accion = accionPendiente;
    setModalNipCrud(false);
    setAccionPendiente(null);
    if (!accion) return;

    if (accion.tipo === "agregar") {
      router.push({
        pathname: "/Gastos/AsignarGasto",
        params: {
          idConcepto: accion.concepto.UUID,
          nombreConcepto: accion.concepto.NOMBRE,
          nombreCategoria: accion.categoria.NOMBRE,
        },
      });
      return;
    }

    if (accion.tipo === "editar") {
      router.push({
        pathname: "/Gastos/AsignarGasto",
        params: { idRegistro: String(accion.registro.ID) },
      });
      return;
    }

    if (accion.tipo === "eliminar") {
      Alert.alert(
        "Eliminar gasto",
        `¿Eliminar el gasto de $${Number(accion.registro.MONTO ?? 0).toFixed(2)}?`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Eliminar",
            style: "destructive",
            onPress: async () => {
              try {
                await Database.deleteRegistro(accion.registro.ID);
                DeviceEventEmitter.emit(GASTOS_REFRESH_EVENT);
                await cargar();
              } catch (e) {
                console.error("Error al eliminar gasto:", e);
                Alert.alert("Error", "No se pudo eliminar el gasto.");
              }
            },
          },
        ],
      );
    }
  };

  const sincronizarGastos = async () => {
    const hayInternet = await verificarConexionInternet();
    if (!hayInternet) {
      Alert.alert("Sin conexión", MENSAJE_SIN_INTERNET);
      return;
    }

    try {
      setSincronizando(true);
      const { sincronizados } = await integracionGastos.sincronizarGastos();
      if (sincronizados === 0) {
        Alert.alert("Sin pendientes", "No hay gastos por sincronizar.");
      } else {
        Alert.alert("Listo", `${sincronizados} registro(s) sincronizado(s).`);
      }
      await cargar();
    } catch (e) {
      console.error("Error al sincronizar gastos:", e);
      Alert.alert(
        "Error",
        obtenerMensajeErrorRed(
          e,
          "No se pudo sincronizar con el servidor.",
        ),
      );
    } finally {
      setSincronizando(false);
    }
  };

  return (
    <SafeAreaView
      edges={["bottom"]}
      style={{ flex: 1, backgroundColor: "black" }}
    >
      <LinearGradient
        style={s.header}
        colors={gb.gradient_blue}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <RecoverButton />
        <Text style={s.headerTitle}>Gastos</Text>
        <View style={{ width: normalize(35) }} />
      </LinearGradient>

      <View style={s.body}>
        <View style={s.totalBanner}>
          <Text style={s.totalBannerLabel}>TOTAL DE GASTOS</Text>
          <Text style={s.totalBannerMonto}>${totalGeneral.toFixed(2)}</Text>
        </View>

        <FlatList
          style={{ flex: 1 }}
          data={categorias}
          keyExtractor={(item) => String(item.UUID ?? item.ID)}
          contentContainerStyle={[
            s.listContent,
            categorias.length === 0 && { flexGrow: 1 },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refrescando}
              onRefresh={onRefresh}
              colors={gb.gradient_blue}
            />
          }
          renderItem={({ item }) => (
            <CategoriaAccordion
              categoria={item}
              expandida={!!catsExpandidas[item.UUID]}
              conceptosExpandidos={conceptosExpandidos}
              onToggleCategoria={() => toggleCategoria(item.UUID)}
              onToggleConcepto={toggleConcepto}
              onAddGasto={irAAgregarGasto}
              onEditGasto={irAEditarGasto}
              onDeleteGasto={eliminarGasto}
            />
          )}
          ListEmptyComponent={
            <View style={s.emptyContainer}>
              <Ionicons
                name="wallet-outline"
                size={normalize(52)}
                color={gb.gray300}
              />
              <Text style={s.emptyText}>
                Sin categorías. Sincroniza al iniciar sesión.
              </Text>
            </View>
          }
        />
      </View>

      <LinearGradient
        style={s.footer}
        colors={gb.gradient_blue}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Button style={s.btnSync} onPress={onRefresh}>
          <Ionicons name="refresh-outline" size={normalize(20)} color="white" />
          <Text style={s.btnSyncText}>Actualizar</Text>
        </Button>
        <Button
          style={s.btnSync}
          onPress={sincronizarGastos}
          disabled={sincronizando}
        >
          <Ionicons name="sync-outline" size={normalize(20)} color="white" />
          <Text style={s.btnSyncText}>
            {sincronizando ? "..." : "Sincronizar"}
          </Text>
        </Button>
      </LinearGradient>

      <NipModal
        visible={modalAcceso}
        titulo={tituloModal}
        modo="acceso"
        keywords={["expenses"]}
        onSubmit={onAccesoCorrecto}
        onClose={onAccesoCancelado}
      />

      <NipModal
        visible={modalNipCrud}
        modo="acceso"
        keywords={["expenses"]}
        titulo={accionPendiente?.titulo ?? "Gastos"}
        onClose={() => {
          setModalNipCrud(false);
          setAccionPendiente(null);
        }}
        onSubmit={onNipCrudCorrecto}
      />
    </SafeAreaView>
  );
};

export default Gastos;
