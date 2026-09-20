import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  DeviceEventEmitter,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Input from "../../../components/atoms/Input/Input";
import RecoverButton from "../../../components/atoms/RecoverButton/RecoverButton";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";
import { gb } from "../../globalStyles";
import { Database } from "./database";
import { GASTOS_REFRESH_EVENT } from "./events";
import { s } from "./styles";

const paramStr = (value) => {
  if (Array.isArray(value)) return value[0] ? String(value[0]) : "";
  return value != null ? String(value) : "";
};

const formatearFecha = (date) =>
  date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const hoyMediodia = () => {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  return d;
};

/** CRUD de un gasto (REGISTRO_GASTO) sobre un concepto */
const AsignarGasto = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const idRegistro = paramStr(params.idRegistro);
  const idConceptoParam = paramStr(params.idConcepto);
  const nombreConceptoParam = paramStr(params.nombreConcepto);
  const nombreCategoriaParam = paramStr(params.nombreCategoria);
  const esEdicion = !!idRegistro;

  const [idConcepto, setIdConcepto] = useState(idConceptoParam);
  const [nombreConcepto, setNombreConcepto] = useState(nombreConceptoParam);
  const [nombreCategoria, setNombreCategoria] = useState(nombreCategoriaParam);
  const [monto, setMonto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState(hoyMediodia);
  const [mostrarPicker, setMostrarPicker] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(esEdicion);

  useEffect(() => {
    if (!esEdicion) return;
    let activo = true;
    (async () => {
      try {
        const reg = await Database.getRegistroById(Number(idRegistro));
        if (!activo || !reg) {
          if (activo) {
            Alert.alert("Error", "No se encontró el gasto.");
            router.back();
          }
          return;
        }
        setIdConcepto(reg.ID_CONCEPTO);
        setNombreConcepto(reg.NOMBRE_CONCEPTO ?? "");
        setNombreCategoria(reg.NOMBRE_CATEGORIA ?? "");
        setMonto(String(reg.MONTO ?? ""));
        setDescripcion(reg.NOTA ?? "");
        if (reg.FECHA) {
          const d = new Date(reg.FECHA);
          if (!Number.isNaN(d.getTime())) {
            d.setHours(12, 0, 0, 0);
            setFecha(d);
          }
        }
      } catch (e) {
        console.error("Error al cargar gasto:", e);
        Alert.alert("Error", "No se pudo cargar el gasto.");
        router.back();
      } finally {
        if (activo) setCargando(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, [esEdicion, idRegistro, router]);

  const fechaLabel = useMemo(() => formatearFecha(fecha), [fecha]);

  const onChangeFecha = (_event, selected) => {
    if (Platform.OS === "android") setMostrarPicker(false);
    if (selected) {
      const d = new Date(selected);
      d.setHours(12, 0, 0, 0);
      setFecha(d);
    }
  };

  const guardar = async () => {
    if (!idConcepto && !esEdicion) {
      Alert.alert("Error", "No se encontró el concepto.");
      return;
    }
    const montoNum = parseFloat(String(monto).replace(",", "."));
    if (!monto.trim() || !Number.isFinite(montoNum) || montoNum <= 0) {
      Alert.alert("Monto requerido", "Ingresa un monto válido mayor a cero.");
      return;
    }
    try {
      setGuardando(true);
      if (esEdicion) {
        await Database.updateRegistro({
          id: Number(idRegistro),
          monto: montoNum,
          nota: descripcion.trim(),
          fecha,
        });
      } else {
        await Database.insertRegistro({
          idConcepto,
          monto: montoNum,
          nota: descripcion.trim(),
          fecha,
        });
      }
      DeviceEventEmitter.emit(GASTOS_REFRESH_EVENT);
      router.back();
    } catch (e) {
      console.error("Error al guardar gasto:", e);
      Alert.alert("Error", "No se pudo guardar el gasto.");
    } finally {
      setGuardando(false);
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
        <Text style={s.headerTitle}>
          {esEdicion ? "Editar gasto" : "Nuevo gasto"}
        </Text>
        <View style={{ width: normalize(35) }} />
      </LinearGradient>

      <View style={s.body}>
        {cargando ? (
          <ActivityIndicator
            style={{ marginTop: normalize(40) }}
            color={gb.blue500}
          />
        ) : (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={s.formScroll}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={s.sectionLabel}>Datos del gasto</Text>

            <View style={s.infoBlock}>
              <View style={s.infoRow}>
                <Ionicons
                  name="folder-outline"
                  size={normalize(16)}
                  color={gb.purple800}
                />
                <View style={{ flex: 1 }}>
                  <Text style={s.infoLabel}>Categoría</Text>
                  <Text style={s.infoValue} numberOfLines={1}>
                    {nombreCategoria || "—"}
                  </Text>
                </View>
              </View>
              <View style={s.infoDivider} />
              <View style={s.infoRow}>
                <Ionicons
                  name="pricetag-outline"
                  size={normalize(16)}
                  color={gb.purple800}
                />
                <View style={{ flex: 1 }}>
                  <Text style={s.infoLabel}>Concepto</Text>
                  <Text style={s.infoValue} numberOfLines={1}>
                    {nombreConcepto || "—"}
                  </Text>
                </View>
              </View>
            </View>

            <Input
              label="Monto *"
              placeholder="0.00"
              icon="cash-outline"
              iconColor={gb.green600}
              value={monto}
              onChange={setMonto}
              keyboardType="decimal-pad"
            />

            <Input
              label="Descripción"
              placeholder="Detalle del gasto (opcional)"
              icon="document-text-outline"
              value={descripcion}
              onChange={setDescripcion}
            />

            <Text style={s.fieldLabel}>Fecha *</Text>
            <Pressable
              style={s.fechaBtn}
              onPress={() => setMostrarPicker(true)}
            >
              <Ionicons
                name="calendar-outline"
                size={normalize(18)}
                color={gb.purple800}
              />
              <Text style={s.fechaBtnText}>{fechaLabel}</Text>
              <Ionicons
                name="create-outline"
                size={normalize(16)}
                color={gb.gray400}
              />
            </Pressable>
            <Text style={s.fechaHint}>
              Por defecto es hoy. Toca para cambiarla.
            </Text>

            {mostrarPicker && (
              <DateTimePicker
                value={fecha}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onChangeFecha}
                maximumDate={new Date(2100, 11, 31)}
                locale="es-MX"
              />
            )}

            {Platform.OS === "ios" && mostrarPicker && (
              <Pressable
                style={s.fechaCerrarBtn}
                onPress={() => setMostrarPicker(false)}
              >
                <Text style={s.fechaCerrarText}>Listo</Text>
              </Pressable>
            )}

            <View style={s.saveBtn}>
              <LinearGradient
                colors={gb.gradient_blue}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <TouchableOpacity
                  style={s.saveBtnInner}
                  onPress={guardar}
                  disabled={guardando}
                >
                  <Ionicons
                    name={
                      guardando
                        ? "hourglass-outline"
                        : "checkmark-circle-outline"
                    }
                    size={normalize(20)}
                    color="white"
                  />
                  <Text style={s.saveBtnText}>
                    {guardando
                      ? "Guardando…"
                      : esEdicion
                        ? "Guardar cambios"
                        : "Registrar gasto"}
                  </Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

export default AsignarGasto;
