import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { gb } from "../../../screens/globalStyles";
import { guardarSesionAcceso } from "../../../utils/gerentePermisos";
import { isTablet, normalize } from "../../../utils/funcionesMaquetado/responsiveWH";
import Button from "../../atoms/Button/Button";
import GeneralModal from "../../atoms/GeneralModal/GeneralModal";
import Input from "../../atoms/Input/Input";
import ModalWarning from "../ModalWarning/ModalWarning";
import { dataBase } from "./database";
import { s } from "./styles";

const NipModal = ({
  visible,
  onClose,
  onSubmit,
  titulo,
  modo = "dueño",
  keywords,
}) => {
  const [nip, setNip] = useState("");
  const [nombreSucursal, setNombreSucursal] = useState(null);
  const [aviso, setAviso] = useState(null);

  const keywordsList = Array.isArray(keywords) ? keywords : null;
  const modoEfectivo =
    keywordsList != null && modo === "dueño" ? "acceso" : modo;

  useEffect(() => {
    if (!visible) {
      setNip("");
      setAviso(null);
      return;
    }

    let activo = true;
    dataBase.getNombreSucursal().then((nombre) => {
      if (activo) setNombreSucursal(nombre);
    });

    return () => {
      activo = false;
    };
  }, [visible]);

  const mostrarAviso = (title, message, type = "warning") => {
    setAviso({ title, message, type });
  };

  const cerrarAviso = () => setAviso(null);

  const verificarNip = async () => {
    if (modoEfectivo === "gerente") {
      const result = await dataBase.validarNipGerente(nip);
      if (result.reason === "no_gerentes") {
        mostrarAviso(
          "Sin gerentes",
          "No hay gerentes con NIP configurado. Sincroniza los datos e intenta de nuevo.",
        );
        return;
      }
      if (result.reason === "empty") {
        mostrarAviso("NIP requerido", "Ingresa el NIP del gerente.");
        return;
      }
      if (!result.ok) {
        mostrarAviso("NIP incorrecto", "El NIP ingresado no es válido. Intenta de nuevo.");
        setNip("");
        return;
      }
      await onSubmit(result.gerente);
      return;
    }

    if (modoEfectivo === "acceso") {
      const result = await dataBase.validarNipAcceso(nip, keywordsList ?? []);
      if (result.reason === "empty") {
        mostrarAviso("NIP requerido", "Ingresa el NIP.");
        return;
      }
      if (result.reason === "sin_permiso") {
        mostrarAviso(
          "Sin permiso",
          "No tiene permisos para acceder a esta opción.",
          "danger",
        );
        setNip("");
        return;
      }
      if (!result.ok) {
        mostrarAviso("NIP incorrecto", "El NIP ingresado no es válido. Intenta de nuevo.");
        setNip("");
        return;
      }
      await guardarSesionAcceso(result);
      await onSubmit(result);
      return;
    }

    const nipDueño = await dataBase.getNipDueño();
    if (nipDueño == null || String(nipDueño).trim() === "") {
      mostrarAviso(
        "NIP no configurado",
        "No hay NIP configurado. Sincroniza los datos e intenta de nuevo.",
      );
      return;
    }

    if (String(nip).trim() === String(nipDueño).trim()) {
      await onSubmit({ tipo: "owner" });
    } else {
      mostrarAviso("NIP incorrecto", "El NIP ingresado no es válido. Intenta de nuevo.");
      setNip("");
    }
  };

  const subtitulo =
    modoEfectivo === "gerente"
      ? "Ingresa el NIP del gerente para continuar"
      : modoEfectivo === "acceso"
        ? "Ingresa el NIP del dueño o de un gerente autorizado"
        : nombreSucursal
          ? `Ingresa el NIP de ${nombreSucursal} para continuar`
          : "Ingresa el NIP de la sucursal para continuar";

  return (
    <>
      <GeneralModal visible={visible} onRequestClose={onClose}>
        <View style={s.container}>
          <LinearGradient
            style={s.iconContainer}
            colors={gb.gradient_blue}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons
              name="shield-checkmark"
              size={normalize(isTablet ? 36 : 32)}
              color={gb.gray50}
            />
          </LinearGradient>
          <Text style={s.titleModal}>{titulo}</Text>
          <Text style={s.subTitleModal}>{subtitulo}</Text>
          <Input
            placeholder="NIP"
            secureTextEntry
            style={s.inputContainer}
            value={nip}
            onChange={(text) => setNip(String(text ?? "").replace(/[^0-9]/g, ""))}
            keyboardType="number-pad"
            maxLength={8}
            textAlign="center"
            styleInput={s.inputField}
          />
          <View style={s.buttonsContainer}>
            <Button onPress={onClose} style={s.btnCancelar}>
              <Text style={s.btnCancelarText}>Cancelar</Text>
            </Button>
            <Button onPress={verificarNip} style={s.btnConfirmar}>
              <Text style={s.btnConfirmarText}>Confirmar</Text>
            </Button>
          </View>
        </View>
      </GeneralModal>

      <ModalWarning
        visible={!!aviso}
        type={aviso?.type ?? "warning"}
        title={aviso?.title ?? ""}
        message={aviso?.message ?? ""}
        confirmText="Entendido"
        cancelText="Cerrar"
        onCancel={cerrarAviso}
        onConfirm={cerrarAviso}
      />
    </>
  );
};

export default NipModal;
