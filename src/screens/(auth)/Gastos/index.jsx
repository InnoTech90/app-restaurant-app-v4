import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../../../components/atoms/Button/Button";
import EstatusSincronizado from "../../../components/atoms/EstatusSincronizado/EstatusSincronizado";
import RecoverButton from "../../../components/atoms/RecoverButton/RecoverButton";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";
import { gb } from "../../globalStyles";
import { Database } from "./database";
import { integracionGastos } from "./integracion";
import { s } from "./styles";

/* ─── Fila de un concepto ──────────────────────────────────────── */
const ConceptoRow = ({ concepto, onPress }) => (
  <Pressable
    style={s.conceptoRow}
    onPress={() => onPress(concepto)}
    android_ripple={{ color: "#0001" }}
  >
    <View style={s.conceptoRowInfo}>
      <View style={s.conceptoRowTopLine}>
        <Text style={s.conceptoRowNombre} numberOfLines={1}>
          {concepto.NOMBRE}
        </Text>
        <EstatusSincronizado sincronizado={!concepto.TIENE_PENDIENTES} />
      </View>
      {(concepto.PRECIO ?? 0) > 0 && (
        <Text style={s.conceptoRowPrecioBase}>
          Precio: ${Number(concepto.PRECIO).toFixed(2)}
        </Text>
      )}
    </View>
    <Text style={s.conceptoRowMonto}>
      ${Number(concepto.TOTAL ?? 0).toFixed(2)}
    </Text>
  </Pressable>
);

/* ─── Sección de una categoría ─────────────────────────────────── */
const CategoriaSection = ({ categoria, onConceptoPress }) => {
  const totalCat = (categoria.conceptos ?? []).reduce(
    (sum, c) => sum + (c.TOTAL ?? 0),
    0,
  );
  return (
    <View style={s.seccion}>
      {/* Header degradado de categoría */}
      <LinearGradient
        style={s.seccionHeader}
        colors={gb.gradient_blue}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={s.seccionNombre}>{categoria.NOMBRE}</Text>
      </LinearGradient>

      {/* Lista de conceptos */}
      {(categoria.conceptos ?? []).length === 0 ? (
        <View style={s.seccionVacia}>
          <Text style={s.seccionVaciaText}>Sin conceptos</Text>
        </View>
      ) : (
        (categoria.conceptos ?? []).map((c, i) => (
          <View key={String(c.ID)}>
            <ConceptoRow concepto={c} onPress={onConceptoPress} />
            {i < categoria.conceptos.length - 1 && (
              <View style={s.conceptoDivider} />
            )}
          </View>
        ))
      )}

      {/* Total de categoría */}
      <View style={s.seccionTotalRow}>
        <Text style={s.seccionTotalLabel}>TOTAL:</Text>
        <Text style={s.seccionTotalMonto}>${totalCat.toFixed(2)}</Text>
      </View>
    </View>
  );
};

/* ─── Modal de registro de pago ─────────────────────────────────── */
const ModalRegistro = ({
  visible,
  concepto,
  registros,
  monto,
  onMontoChange,
  nota,
  onNotaChange,
  onCancel,
  onGuardar,
  guardando,
}) => {
  if (!concepto) return null;

  const hoy = new Date();
  const fechaTexto = `${hoy.getDate().toString().padStart(2, "0")} / ${(
    hoy.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")} / ${hoy.getFullYear()}`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <KeyboardAvoidingView
        style={s.modalOverlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Tap fuera cierra */}
        <Pressable style={s.modalTapZone} onPress={onCancel} />

        <View style={s.modalCard}>
          {/* Franja superior degradada */}
          <LinearGradient
            colors={gb.gradient_blue}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={s.modalAccent}
          />

          {/* Título y fecha */}
          <Text style={s.modalTitle}>{concepto.NOMBRE}</Text>
          <Text style={s.modalFecha}>{fechaTexto}</Text>

          {/* Input de monto */}
          <View style={s.modalMontoWrap}>
            <Text style={s.modalSigPeso}>$</Text>
            <TextInput
              style={s.modalMontoInput}
              value={monto}
              onChangeText={onMontoChange}
              placeholder="0.00"
              placeholderTextColor={gb.gray300}
              keyboardType="decimal-pad"
              returnKeyType="done"
            />
          </View>

          {/* Nota */}
          <Text style={s.modalLabel}>NOTA:</Text>
          <TextInput
            style={s.modalNotaInput}
            value={nota}
            onChangeText={onNotaChange}
            placeholder="Comentario opcional"
            placeholderTextColor={gb.gray400}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          {/* Historial */}
          {registros.length > 0 && (
            <View style={s.modalHistorialWrap}>
              <Text style={s.modalHistorialLabel}>
                HISTORIAL ({registros.length})
              </Text>
              <ScrollView
                style={s.modalHistorialScroll}
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
              >
                {registros.map((r) => (
                  <View key={String(r.ID)} style={s.modalHistorialItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.modalHistorialFecha}>
                        {r.FECHA
                          ? new Date(r.FECHA).toLocaleDateString("es-MX", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })
                          : "—"}
                      </Text>
                      {!!r.NOTA && (
                        <Text style={s.modalHistorialNota} numberOfLines={1}>
                          {r.NOTA}
                        </Text>
                      )}
                    </View>
                    <Text style={s.modalHistorialMonto}>
                      ${Number(r.MONTO).toFixed(2)}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Botones */}
          <View style={s.modalButtons}>
            <Pressable
              style={({ pressed }) => [
                s.modalBtnCancel,
                { opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={onCancel}
            >
              <Text style={s.modalBtnCancelText}>CANCELAR</Text>
            </Pressable>
            <LinearGradient
              colors={gb.gradient_blue}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.modalBtnGuardar}
            >
              <Pressable
                style={({ pressed }) => [
                  s.modalBtnGuardarInner,
                  { opacity: pressed ? 0.85 : 1 },
                ]}
                onPress={onGuardar}
                disabled={guardando}
              >
                <Text style={s.modalBtnGuardarText}>
                  {guardando ? "..." : "GUARDAR"}
                </Text>
              </Pressable>
            </LinearGradient>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

/* ─── Pantalla principal ───────────────────────────────────────── */
const Gastos = () => {
  const router = useRouter();
  const [categorias, setCategorias] = useState([]);
  const [refrescando, setRefrescando] = useState(false);

  /* modal */
  const [modalVisible, setModalVisible] = useState(false);
  const [conceptoSelec, setConceptoSelec] = useState(null);
  const [registros, setRegistros] = useState([]);
  const [nota, setNota] = useState("");
  const [monto, setMonto] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [sincronizando, setSincronizando] = useState(false);

  const cargar = async () => {
    try {
      const res = await Database.getGastosConConceptos();
      setCategorias(res ?? []);
    } catch (e) {
      console.error("Error al obtener gastos:", e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, []),
  );

  const onRefresh = async () => {
    setRefrescando(true);
    await cargar();
    setRefrescando(false);
  };

  const totalGeneral = categorias.reduce(
    (sum, cat) =>
      sum + (cat.conceptos ?? []).reduce((s, c) => s + (c.TOTAL ?? 0), 0),
    0,
  );

  const abrirModal = async (concepto) => {
    setConceptoSelec(concepto);
    try {
      const regs = await Database.getRegistrosByConcepto(concepto.UUID);
      setRegistros(regs ?? []);
    } catch {
      setRegistros([]);
    }
    setNota("");
    setMonto(concepto.PRECIO > 0 ? String(concepto.PRECIO) : "");
    setModalVisible(true);
  };

  const guardarRegistro = async () => {
    const montoNum = parseFloat(monto.replace(",", "."));
    if (!montoNum || montoNum <= 0 || isNaN(montoNum)) {
      Alert.alert("Monto requerido", "Ingresa un monto válido mayor a cero.");
      return;
    }
    try {
      setGuardando(true);
      await Database.insertRegistro({
        idConcepto: conceptoSelec.UUID,
        monto: montoNum,
        nota: nota.trim(),
      });
      setModalVisible(false);
      await cargar();
    } catch (e) {
      console.error("Error al guardar registro:", e);
      Alert.alert("Error", "No se pudo guardar el registro.");
    } finally {
      setGuardando(false);
    }
  };

  const sincronizarGastos = async () => {
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
      Alert.alert("Error", "No se pudo sincronizar con el servidor.");
    } finally {
      setSincronizando(false);
    }
  };

  const irAAgregar = () => router.push({ pathname: "/Gastos/Agregar" });

  return (
    <SafeAreaView
      edges={["bottom"]}
      style={{ flex: 1, backgroundColor: "black" }}
    >
      {/* Header */}
      <LinearGradient
        style={s.header}
        colors={gb.gradient_blue}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <RecoverButton />
        <Text style={s.headerTitle}>Gastos</Text>
        <Button style={s.btnAdd} onPress={irAAgregar}>
          <Ionicons name="add" size={normalize(20)} color="white" />
        </Button>
      </LinearGradient>

      {/* Banner total general */}
      <View style={s.totalBanner}>
        <Text style={s.totalBannerLabel}>TOTAL DE GASTOS</Text>
        <Text style={s.totalBannerMonto}>${totalGeneral.toFixed(2)}</Text>
      </View>

      {/* Lista de categorías expandidas */}
      <FlatList
        data={categorias}
        keyExtractor={(item) => String(item.ID)}
        contentContainerStyle={[
          s.listContent,
          categorias.length === 0 && { flex: 1 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={onRefresh}
            colors={gb.gradient_blue}
          />
        }
        renderItem={({ item }) => (
          <CategoriaSection categoria={item} onConceptoPress={abrirModal} />
        )}
        ListEmptyComponent={
          <View style={s.emptyContainer}>
            <Ionicons
              name="wallet-outline"
              size={normalize(52)}
              color={gb.gray300}
            />
            <Text style={s.emptyText}>Sin gastos registrados</Text>
          </View>
        }
      />

      {/* Footer */}
      <LinearGradient
        style={s.footer}
        colors={gb.gradient_blue}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Button style={s.btnSync} onPress={onRefresh}>
          <Ionicons name="refresh-outline" size={normalize(20)} color="white" />
          <Text style={s.btnSyncText}>Actualizar Gastos</Text>
        </Button>
        <Button
          style={s.btnSync}
          onPress={sincronizarGastos}
          disabled={sincronizando}
        >
          <Ionicons name="sync-outline" size={normalize(20)} color="white" />
          <Text style={s.btnSyncText}>
            {sincronizando ? "..." : "Sincronizar Gastos"}
          </Text>
        </Button>
      </LinearGradient>

      {/* Modal de registro */}
      <ModalRegistro
        visible={modalVisible}
        concepto={conceptoSelec}
        registros={registros}
        monto={monto}
        onMontoChange={setMonto}
        nota={nota}
        onNotaChange={setNota}
        onCancel={() => setModalVisible(false)}
        onGuardar={guardarRegistro}
        guardando={guardando}
      />
    </SafeAreaView>
  );
};

export default Gastos;
