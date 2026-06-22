import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { gb } from "../../../screens/globalStyles";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";

/**
 * Modal que se muestra cuando se intenta imprimir pero ningún punto
 * de impresión tiene impresora vinculada.
 *
 * Props:
 *  - visible      {boolean}   Controla visibilidad
 *  - onVincular   {function}  Se llama al pulsar "Vincular"
 *  - onOmitir     {function}  Se llama al pulsar "Omitir" (cierra modal)
 */
const ModalSinImpresora = ({ visible, onVincular, onOmitir }) => (
    <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onOmitir}
    >
        <View style={s.backdrop}>
            <View style={s.card}>
                {/* Icono */}
                <View style={s.iconBox}>
                    <Ionicons name="print-outline" size={normalize(36)} color={gb.blue550} />
                </View>

                {/* Textos */}
                <Text style={s.titulo}>Sin impresora asignada</Text>
                <Text style={s.mensaje}>
                    Ningún punto de impresión tiene una impresora vinculada.{"\n"}
                    Ve a Impresoras para asociar una.
                </Text>

                {/* Botones */}
                <View style={s.botones}>
                    <Pressable
                        style={[s.btn, s.btnOmitir]}
                        onPress={onOmitir}
                        android_ripple={{ color: gb.gray200 }}
                    >
                        <Text style={[s.btnTexto, s.btnTextoOmitir]}>Omitir</Text>
                    </Pressable>
                    <Pressable
                        style={[s.btn, s.btnVincular]}
                        onPress={onVincular}
                        android_ripple={{ color: gb.blue600 }}
                    >
                        <Ionicons name="bluetooth" size={normalize(14)} color="white" style={{ marginRight: 4 }} />
                        <Text style={[s.btnTexto, s.btnTextoVincular]}>Vincular</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    </Modal>
);

const s = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.55)",
        justifyContent: "center",
        alignItems: "center",
    },
    card: {
        width: "82%",
        backgroundColor: "white",
        borderRadius: normalize(14),
        padding: normalize(24),
        alignItems: "center",
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 8,
    },
    iconBox: {
        width: normalize(68),
        height: normalize(68),
        borderRadius: normalize(34),
        backgroundColor: gb.blue100,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: normalize(14),
    },
    titulo: {
        fontSize: normalize(16),
        fontWeight: "700",
        color: gb.gray900,
        marginBottom: normalize(8),
        textAlign: "center",
    },
    mensaje: {
        fontSize: normalize(13),
        color: gb.gray500,
        textAlign: "center",
        lineHeight: normalize(19),
        marginBottom: normalize(22),
    },
    botones: {
        flexDirection: "row",
        gap: normalize(10),
        width: "100%",
    },
    btn: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: normalize(11),
        borderRadius: normalize(8),
    },
    btnOmitir: {
        backgroundColor: gb.gray100,
        borderWidth: 1,
        borderColor: gb.gray200,
    },
    btnVincular: {
        backgroundColor: gb.blue550,
    },
    btnTexto: {
        fontSize: normalize(14),
        fontWeight: "600",
    },
    btnTextoOmitir: {
        color: gb.gray600,
    },
    btnTextoVincular: {
        color: "white",
    },
});

export default ModalSinImpresora;
