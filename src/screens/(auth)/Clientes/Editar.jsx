import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Input from "../../../components/atoms/Input/Input";
import ModalWarning from "../../../components/Molecules/ModalWarning/ModalWarning";
import RecoverButton from "../../../components/atoms/RecoverButton/RecoverButton";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";
import { gb } from "../../globalStyles";
import { Database } from "./Database";
import { s } from "./styles";

const Editar = () => {
  const router = useRouter();
  const scrollRef = useRef(null);
  const { data } = useLocalSearchParams();
  const cliente = data ? JSON.parse(data) : {};

  const [nombre, setNombre] = useState(cliente.NOMBRE ?? "");
  const [telefono, setTelefono] = useState(cliente.TELEFONO ?? "");
  const [correo, setCorreo] = useState(cliente.CORREO ?? "");
  const [direccion, setDireccion] = useState(cliente.DIRECCION ?? "");
  const [descripcion, setDescripcion] = useState(cliente.DESCRIPCION ?? "");
  const [notas, setNotas] = useState(cliente.NOTAS ?? "");
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [openConfirmEliminar, setOpenConfirmEliminar] = useState(false);

  const guardar = async () => {
    if (!nombre.trim()) {
      Alert.alert("Campo requerido", "El nombre del cliente es obligatorio.");
      return;
    }
    try {
      setGuardando(true);

      console.log("Data", {
        clienteId: cliente.ID,
        nombre,
        telefono,
        correo,
        direccion,
        descripcion,
        notas,
      });

      await Database.updateCliente(cliente.ID, {
        nombre,
        telefono,
        correo,
        direccion,
        descripcion,
        notas,
      });
      setGuardando(false);
      router.back();
    } catch (e) {
      console.error("Error al editar cliente:", e);
      setGuardando(false);
      Alert.alert("Error", "No se pudo actualizar el cliente.");
    }
  };

  const inactivar = async () => {
    if (!cliente?.ID || eliminando) return;
    try {
      setEliminando(true);
      setOpenConfirmEliminar(false);
      await Database.inactivarCliente(cliente.ID);
      router.back();
    } catch (e) {
      console.error("Error al inactivar cliente:", e);
      Alert.alert("Error", "No se pudo inactivar el cliente.");
    } finally {
      setEliminando(false);
    }
  };

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
        <Text style={s.headerTitle}>Editar cliente</Text>
        {Number(cliente.ACTIVO ?? 1) === 1 ? (
          <TouchableOpacity
            style={[s.btnHeaderDelete, eliminando && { opacity: 0.55 }]}
            onPress={() => setOpenConfirmEliminar(true)}
            disabled={guardando || eliminando}
          >
            <Ionicons
              name="person-remove-outline"
              size={normalize(18)}
              color="white"
            />
          </TouchableOpacity>
        ) : (
          <View style={{ width: normalize(35) }} />
        )}
      </LinearGradient>

      <KeyboardAvoidingView
        style={s.formBody}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={[
            s.formScroll,
            { backgroundColor: gb.gray100 },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <Text style={s.sectionLabel}>Información general</Text>
          <Input
            label="Nombre completo *"
            placeholder="Ej. Juan Pérez"
            icon="person-outline"
            value={nombre}
            onChange={setNombre}
          />
          <Input
            label="Teléfono"
            placeholder="Ej. 33 1234 5678"
            icon="call-outline"
            iconColor={gb.blue500}
            value={telefono}
            onChange={setTelefono}
            keyboardType="phone-pad"
          />
          <Input
            label="Correo electrónico"
            placeholder="Ej. correo@ejemplo.com"
            icon="mail-outline"
            iconColor={gb.purple550}
            value={correo}
            onChange={setCorreo}
            keyboardType="email-address"
          />

          <Text style={s.sectionLabel}>Ubicación</Text>
          <Input
            label="Dirección"
            placeholder="Ej. Calle Flores 12, Guadalajara"
            icon="location-outline"
            iconColor={gb.red400}
            value={direccion}
            onChange={setDireccion}
            onFocus={() => scrollRef.current?.scrollToEnd({ animated: true })}
          />

          <Text style={s.sectionLabel}>Extras</Text>
          <Input
            label="Descripción"
            placeholder="Breve descripción del cliente"
            icon="document-text-outline"
            value={descripcion}
            onChange={setDescripcion}
            onFocus={() => scrollRef.current?.scrollToEnd({ animated: true })}
          />
          {/* <Input
          label="Notas"
          placeholder="Observaciones adicionales"
          icon="chatbubble-ellipses-outline"
          value={notas}
          onChange={setNotas}
        /> */}

          <View style={s.saveBtn}>
            <LinearGradient
              colors={gb.gradient_blue}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <TouchableOpacity
                style={s.saveBtnInner}
                onPress={() => guardar()}
                disabled={guardando || eliminando}
              >
                <Ionicons
                  name={
                    guardando ? "hourglass-outline" : "checkmark-circle-outline"
                  }
                  size={normalize(20)}
                  color="white"
                />
                <Text style={s.saveBtnText}>
                  {guardando ? "Guardando…" : "Guardar cambios"}
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <ModalWarning
        visible={openConfirmEliminar}
        type="danger"
        title="Inactivar cliente"
        message={`¿Inactivar a "${cliente.NOMBRE ?? "este cliente"}"? Quedará pendiente de sincronizar.`}
        confirmText="Inactivar"
        cancelText="Cancelar"
        onCancel={() => setOpenConfirmEliminar(false)}
        onConfirm={inactivar}
      />
    </SafeAreaView>
  );
};

export default Editar;
