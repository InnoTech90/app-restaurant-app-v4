import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Input from "../../../components/atoms/Input/Input";
import RecoverButton from "../../../components/atoms/RecoverButton/RecoverButton";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";
import { gb } from "../../globalStyles";
import { Database } from "./Database";
import { s } from "./styles";

const Agregar = () => {
    const router = useRouter();

    const [nombre, setNombre] = useState("");
    const [telefono, setTelefono] = useState("");
    const [correo, setCorreo] = useState("");
    const [direccion, setDireccion] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [notas, setNotas] = useState("");
    const [guardando, setGuardando] = useState(false);

    const guardar = async () => {
        try {
        if (!nombre.trim()) {
            Alert.alert("Campo requerido", "El nombre del cliente es obligatorio.");
            return;
        }
            setGuardando(true);
            await Database.insertCliente({ nombre, telefono, correo, direccion, descripcion, notas });
            setGuardando(false);
            router.back();
        } catch (e) {
            console.error("Error al guardar cliente:", e);
            setGuardando(false);
            Alert.alert("Error", "No se pudo guardar el cliente.");
        }
    };

    return (
        <SafeAreaView edges={["bottom"]} style={{ flex: 1, backgroundColor: "black" }}>
            {/* Header */}
            <LinearGradient style={s.header} colors={gb.gradient_blue} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <RecoverButton />
                <Text style={s.headerTitle}>Nuevo cliente</Text>
                <View style={{ width: normalize(35) }} />
            </LinearGradient>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={[s.formScroll, { backgroundColor: gb.gray100 }]} keyboardShouldPersistTaps="handled">

                <Text style={s.sectionLabel}>Información general</Text>
                <Input label="Nombre completo *" placeholder="Ej. Juan Pérez" icon="person-outline" value={nombre} onChange={setNombre} />
                <Input label="Teléfono" placeholder="Ej. 33 1234 5678" icon="call-outline" iconColor={gb.blue500} value={telefono} onChange={setTelefono} keyboardType="phone-pad" />
                <Input label="Correo electrónico" placeholder="Ej. correo@ejemplo.com" icon="mail-outline" iconColor={gb.purple550} value={correo} onChange={setCorreo} keyboardType="email-address" />

                <Text style={s.sectionLabel}>Ubicación</Text>
                <Input label="Dirección" placeholder="Ej. Calle Flores 12, Guadalajara" icon="location-outline" iconColor={gb.red400} value={direccion} onChange={setDireccion} />

                <Text style={s.sectionLabel}>Extras</Text>
                <Input label="Descripción" placeholder="Breve descripción del cliente" icon="document-text-outline" value={descripcion} onChange={setDescripcion} />
                <Input label="Notas" placeholder="Observaciones adicionales" icon="chatbubble-ellipses-outline" value={notas} onChange={setNotas} />

                <View style={s.saveBtn}>
                    <LinearGradient colors={gb.gradient_blue} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                        <TouchableOpacity style={s.saveBtnInner} onPress={() => guardar()} disabled={guardando}>
                            <Ionicons name={guardando ? "hourglass-outline" : "checkmark-circle-outline"} size={normalize(20)} color="white" />
                            <Text style={s.saveBtnText}>{guardando ? "Guardando…" : "Guardar cliente"}</Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};
export default Agregar;