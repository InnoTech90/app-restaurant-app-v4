import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { s } from './style';
import GeneralModal from '../../../../components/atoms/GeneralModal/GeneralModal';
import Button from "../../../../components/atoms/Button/Button";
import { Image } from 'expo-image';

export default function QrScanner({ visible, onClose , onScanned}) {
    const [facing, setFacing] = useState('back');
    const [permission, requestPermission] = useCameraPermissions();

    if (!visible) {
        return null;
    }
    if (!permission) {
        // Camera permissions are still loading.
        return <View />;
    }
    if (!permission.granted) {
        // Camera permissions are not granted yet.
        return (
            <GeneralModal visible={visible} animationType="slide" onRequestClose={onClose} >
                <View style={s.containerPermisosCamara}>
                    <View style={{ alignItems: "center" }}>
                        <Image source={require("../../../../assets/icons/camara.png")} style={s.imgPermisoCamara} />
                        <Text style={s.titlePermisoCamara}>Apunta tu cámara</Text>
                        <Image source={require("../../../../assets/img/qrMano.png")} style={s.imagenRq} />
                        <Text style={s.subTitleModal}>Dirige el visor al código QR de la sucursal para escanear.</Text>
                    </View>
                    <Button onPress={requestPermission} style={s.btnAceptarPermisos} ><Text style={s.btnAceptarPermisosText}>Habilitar Cámara</Text></Button>

                </View>
            </GeneralModal>
        );
    }
    const handleScanned = ({ data }) => {
        onScanned(data);
        onClose();
    }


    return (
        <View style={styles.container}>
            <CameraView
                style={styles.camera}
                facing={facing}
                barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                onBarcodeScanned={handleScanned}
            />
            <View style={styles.buttonContainer}>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        zIndex: 999,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
    },
    camera: {
        flex: 1,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 64,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        width: '100%',
        paddingHorizontal: 64,
    },
    button: {
        flex: 1,
        alignItems: 'center',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
});