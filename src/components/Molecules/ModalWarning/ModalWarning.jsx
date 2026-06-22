import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Modal, Pressable, Text, View } from "react-native";
import { gb } from "../../../screens/globalStyles";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";
import { s } from "./styles";

/**
 * ModalWarning
 *
 * Props:
 *  visible          {boolean}   — controla visibilidad
 *  onCancel         {function}  — acción del botón cancelar / cerrar
 *  onConfirm        {function}  — acción del botón confirmar
 *  title            {string}    — título del modal          (default "¿Estás seguro?")
 *  message          {string}    — mensaje descriptivo
 *  confirmText      {string}    — texto botón confirmar     (default "Confirmar")
 *  cancelText       {string}    — texto botón cancelar      (default "Cancelar")
 *  type             {string}    — "warning" | "danger" | "info"  (default "warning")
 */
const TYPES = {
    warning: {
        icon: "warning-outline",
        iconColor: gb.yellow500,
        accentColors: [gb.yellow400, gb.yellow500],
        confirmColor: gb.yellow500,
    },
    danger: {
        icon: "trash-outline",
        iconColor: gb.red600,
        accentColors: [gb.red400, gb.red600],
        confirmColor: gb.red600,
    },
    info: {
        icon: "information-circle-outline",
        iconColor: gb.blue500,
        accentColors: gb.gradient_blue,
        confirmColor: gb.blue500,
    },
};

const ModalWarning = ({
    visible,
    onCancel,
    onConfirm,
    title = "¿Estás seguro?",
    message = "",
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    type = "warning",
}) => {
    const cfg = TYPES[type] ?? TYPES.warning;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <Pressable style={s.backdrop} onPress={onCancel}>
                {/* Evita que el tap en el card cierre el modal */}
                <Pressable style={s.card} onPress={() => {}}>

                    {/* Franja superior de color */}
                    <LinearGradient
                        colors={cfg.accentColors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={s.accent}
                    />

                    {/* Ícono */}
                    <View style={[s.iconWrap, { backgroundColor: cfg.iconColor + "1A" }]}>
                        <Ionicons name={cfg.icon} size={normalize(36)} color={cfg.iconColor} />
                    </View>

                    {/* Título */}
                    <Text style={s.title}>{title}</Text>

                    {/* Mensaje */}
                    {!!message && <Text style={s.message}>{message}</Text>}

                    {/* Botones */}
                    <View style={s.buttonsRow}>
                        {/* Cancelar */}
                        <Pressable
                            style={({ pressed }) => [s.btnCancel, { opacity: pressed ? 0.7 : 1 }]}
                            onPress={onCancel}
                        >
                            <Text style={s.btnCancelText}>{cancelText}</Text>
                        </Pressable>

                        {/* Confirmar */}
                        <Pressable
                            style={({ pressed }) => [
                                s.btnConfirm,
                                { backgroundColor: cfg.confirmColor, opacity: pressed ? 0.85 : 1 },
                            ]}
                            onPress={onConfirm}
                        >
                            <Text style={s.btnConfirmText}>{confirmText}</Text>
                        </Pressable>
                    </View>

                </Pressable>
            </Pressable>
        </Modal>
    );
};

export default ModalWarning;
