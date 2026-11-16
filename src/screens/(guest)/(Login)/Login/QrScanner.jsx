import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Image } from "expo-image";
import { useKeepAwake } from "expo-keep-awake";
import { useCallback, useEffect, useState } from "react";
import {
  AppState,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Button from "../../../../components/atoms/Button/Button";
import GeneralModal from "../../../../components/atoms/GeneralModal/GeneralModal";
import { s } from "./style";

function ActiveQrCamera({ facing, onBarcodeScanned, topInset, onClose }) {
  useKeepAwake("qr-scanner");

  return (
    <CameraView
      style={styles.camera}
      facing={facing}
      active
      barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
      onBarcodeScanned={onBarcodeScanned}
    >
      <View
        pointerEvents="box-none"
        style={[styles.overlay, { paddingTop: topInset + 12 }]}
      >
        <Pressable
          onPress={onClose}
          style={styles.backButton}
          hitSlop={12}
          android_ripple={{ color: "rgba(255,255,255,0.2)" }}
        >
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
          <Text style={styles.backButtonText}>Regresar</Text>
        </Pressable>
      </View>
    </CameraView>
  );
}

export default function QrScanner({ visible, onClose, onScanned }) {
  const insets = useSafeAreaInsets();
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

  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  const handleScanned = useCallback(
    ({ data }) => {
      if (scanned) return;
      setScanned(true);
      onScanned(data);
      handleClose();
    },
    [scanned, onScanned, handleClose],
  );

  if (!visible) {
    return null;
  }

  if (!permission) {
    return null;
  }

  if (!permission.granted) {
    return (
      <GeneralModal
        visible={visible}
        animationType="slide"
        onRequestClose={handleClose}
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
          <Pressable onPress={handleClose} style={styles.permissionBack}>
            <Text style={styles.permissionBackText}>Regresar</Text>
          </Pressable>
        </View>
      </GeneralModal>
    );
  }

  const canShowCamera = appIsActive;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        {canShowCamera ? (
          <ActiveQrCamera
            facing={facing}
            onBarcodeScanned={handleScanned}
            topInset={insets.top}
            onClose={handleClose}
          />
        ) : (
          <View style={styles.camera}>
            <View
              pointerEvents="box-none"
              style={[styles.overlay, { paddingTop: insets.top + 12 }]}
            >
              <Pressable
                onPress={handleClose}
                style={styles.backButton}
                hitSlop={12}
              >
                <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
                <Text style={styles.backButtonText}>Regresar</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  backButton: {
    alignSelf: "flex-start",
    marginLeft: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.55)",
    ...(Platform.OS === "android" ? { elevation: 6 } : null),
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  permissionBack: {
    marginTop: 16,
    paddingVertical: 10,
    alignItems: "center",
  },
  permissionBackText: {
    color: "#404040",
    fontSize: 15,
    fontWeight: "600",
  },
});
