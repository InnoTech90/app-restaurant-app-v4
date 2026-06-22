import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Text, View } from "react-native";
import { gb } from "../../../screens/globalStyles";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";
import Button from "../../atoms/Button/Button";
import GeneralModal from "../../atoms/GeneralModal/GeneralModal";
import Input from "../../atoms/Input/Input";
import { dataBase } from "./database";
import { s } from "./styles";

const NipModal = ({ visible, onClose, onSubmit, titulo }) => {
    const [nip, setNip] = useState("")


    const verificarNip = async () => {
        const configuraciones = await dataBase.getConfiguracionesModel();
        if (!configuraciones || configuraciones.length === 0) {
            alert("No hay configuración guardada");
            return;
        }
        if (nip == configuraciones[0].NIP) {
            await onSubmit();
        } else {
            alert("NIP incorrecto");
        }
    }
    return (
        <GeneralModal visible={visible} onRequestClose={onClose}>
            <View style={s.container}>
                <LinearGradient style={s.iconContainer} colors={gb.gradient_blue} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                    <Ionicons name="shield-checkmark" size={40} color={gb.gray50} />
                </LinearGradient>
                <Text style={s.titleModal}>{titulo}</Text>
                <Text style={s.subTitleModal}>Ingresa tu NIP para continuar</Text>
                <Input placeholder="NIP" secureTextEntry={true} style={s.input} icon='apps' iconColor={gb.purple500}
                    onChange={(text) => setNip(text)}
                    keyboardType="numeric"
                    maxLength={4}
                    styleInput={{ textAlign: "center", letterSpacing: 8, fontSize: normalize(20) }}
                />
                <View style={s.buttonsContainer}>
                    <Button onPress={onClose} style={s.btnCancelar}><Text style={s.btnCancelarText}>Cancelar</Text></Button>
                    <Button onPress={verificarNip} style={s.btnConfirmar}><Text style={s.btnConfirmarText}>Confirmar</Text></Button>
                </View>
            </View>
        </GeneralModal>
    )
}

export default NipModal;