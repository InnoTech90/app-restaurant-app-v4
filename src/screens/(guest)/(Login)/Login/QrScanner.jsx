import { CameraView, useCameraPermissions } from "expo-camera";
import { Image } from "expo-image";
import { useKeepAwake } from "expo-keep-awake";
import { useCallback, useEffect, useState } from "react";
import { AppState, StyleSheet, Text, View } from "react-native";
import Button from "../../../../components/atoms/Button/Button";
import GeneralModal from "../../../../components/atoms/GeneralModal/GeneralModal";
import { s } from "./style";

function ActiveQrCamera({ facing, onBarcodeScanned }) {
  useKeepAwake("qr-scanner");

  return (
    <CameraView
      style={styles.camera}
      facing={facing}
      active
      barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
      onBarcodeScanned={onBarcodeScanned}
    />
  );
}

export default function QrScanner({ visible, onClose, onScanned }) {
  const [facing] = useState("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [appIsActive, setAppIsActive] = useState(
    AppState.currentState === "active",
  );
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (nextState) => {
      setAppIsActive(nextState === "active");
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!visible) setScanned(false);
  }, [visible]);

  const handleScanned = useCallback(
    ({ data }) => {
      if (scanned) return;
      setScanned(true);
      onScanned(data);
      onClose();
    },
    [scanned, onScanned, onClose],
  );

  if (!visible) {
    return null;
  }

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <GeneralModal
        visible={visible}
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={s.containerPermisosCamara}>
          <View style={{ alignItems: "center" }}>
            <Image
              source={require("../../../../assets/icons/camara.png")}
              style={s.imgPermisoCamara}
            />
            <Text style={s.titlePermisoCamara}>Apunta tu cámara</Text>
            <Image
              source={require("../../../../assets/img/qrMano.png")}
              style={s.imagenRq}
            />
            <Text style={s.subTitleModal}>
              Dirige el visor al código QR de la sucursal para escanear.
            </Text>
          </View>
          <Button onPress={requestPermission} style={s.btnAceptarPermisos}>
            <Text style={s.btnAceptarPermisosText}>Habilitar Cámara</Text>
          </Button>
        </View>
      </GeneralModal>
    );
  }

  const canShowCamera = appIsActive;

  return (
    <View style={styles.container}>
      {canShowCamera ? (
        <ActiveQrCamera facing={facing} onBarcodeScanned={handleScanned} />
      ) : (
        <View style={styles.camera} />
      )}
      <View style={styles.buttonContainer} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    zIndex: 999,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 64,
    flexDirection: "row",
    backgroundColor: "transparent",
    width: "100%",
    paddingHorizontal: 64,
  },
});
