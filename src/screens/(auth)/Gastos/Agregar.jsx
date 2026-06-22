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
import { Database } from "./database";
import { s } from "./styles";

const AgregarGasto = () => {
    const router = useRouter();

    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [guardando, setGuardando] = useState(false);

    const guardar = async () => {
        if (!nombre.trim()) {
            Alert.alert("Campo requerido", "Ingresa el nombre del gasto.");
            return;
        }
        try {
            setGuardando(true);
            await Database.insertGasto({ nombre: nombre.trim(), descripcion: descripcion.trim() });
            router.back();
        } catch (e) {
            console.error("Error al guardar gasto:", e);
            Alert.alert("Error", "No se pudo guardar el gasto.");
        } finally {
            setGuardando(false);
        }
    };

    return (
        <SafeAreaView edges={["bottom"]} style={{ flex: 1, backgroundColor: "black" }}>
            {/* Header */}
            <LinearGradient
                style={s.header}
                colors={gb.gradient_blue}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
            >
                <RecoverButton />
                <Text style={s.headerTitle}>Nuevo gasto</Text>
                <View style={{ width: normalize(35) }} />
            </LinearGradient>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={[s.formScroll, { backgroundColor: gb.gray100 }]}
                keyboardShouldPersistTaps="handled"
            >
                {/* Datos del gasto */}
                <Text style={s.sectionLabel}>Datos del gasto</Text>
                <Input
                    label="Nombre *"
                    placeholder="Ej. Renta, Internet, Nómina…"
                    icon="pricetag-outline"
                    iconColor={gb.purple550}
                    value={nombre}
                    onChange={setNombre}
                />
                <Input
                    label="Descripción"
                    placeholder="Descripción breve del gasto"
                    icon="document-text-outline"
                    value={descripcion}
                    onChange={setDescripcion}
                />

                {/* Botón guardar */}
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
                                name={guardando ? "hourglass-outline" : "checkmark-circle-outline"}
                                size={normalize(20)}
                                color="white"
                            />
                            <Text style={s.saveBtnText}>
                                {guardando ? "Guardando…" : "Registrar gasto"}
                            </Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default AgregarGasto;
