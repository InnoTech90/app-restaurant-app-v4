#!/bin/bash
set -uo pipefail

# ---------------------------------------------------------------------------
# Argumentos
# ---------------------------------------------------------------------------
PROJECT_DIR=""
while [ $# -gt 0 ]; do
    case "$1" in
        --project-dir)
            PROJECT_DIR="$2"
            shift 2
            ;;
        *)
            shift
            ;;
    esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# El script vive en src/utils/scripts-bat/ -> la raiz del proyecto esta 3 niveles arriba.
# Usamos SCRIPT_DIR para que la ruta sea siempre correcta sin importar
# que valor reciba PROJECT_DIR.
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"

BUILD_GRADLE="${PROJECT_ROOT}/node_modules/react-native-bluetooth-escpos-printer/android/build.gradle"
JAVA_FILE="${PROJECT_ROOT}/node_modules/react-native-bluetooth-escpos-printer/android/src/main/java/cn/jystudio/bluetooth/RNBluetoothManagerModule.java"

echo "Aplicando parches al modulo bluetooth..."

if [ ! -f "$BUILD_GRADLE" ]; then
    echo "ADVERTENCIA: No se encontro build.gradle"
    echo "ADVERTENCIA: El modulo puede no estar instalado correctamente"
    exit 0
fi

if [ ! -f "$JAVA_FILE" ]; then
    echo "ADVERTENCIA: No se encontro el archivo Java"
    exit 0
fi

echo "Parcheando build.gradle..."
sed -i '' \
    -e 's|jcenter { url "http://jcenter\.bintray\.com/" }|jcenter { url "http://jcenter.bintray.com/"; allowInsecureProtocol = true }|' \
    -e 's|maven {url "http://repo\.spring\.io/plugins-release/"}|maven { url "http://repo.spring.io/plugins-release/"; allowInsecureProtocol = true }|' \
    -e 's|    compile fileTree|    implementation fileTree|' \
    -e 's|compileSdkVersion 27|compileSdkVersion 35|' \
    -e 's|buildToolsVersion "27\.0\.3"|buildToolsVersion "35.0.0"|' \
    -e 's|targetSdkVersion 24|targetSdkVersion 35|' \
    -e "s|implementation group: 'com\.android\.support', name: 'support-v4', version: '27\.0\.0'|implementation 'androidx.core:core:1.13.1'|" \
    "$BUILD_GRADLE"

if [ $? -ne 0 ]; then
    echo "Error al aplicar parches: fallo al editar build.gradle"
    exit 1
fi
echo "OK - build.gradle parcheado"

echo "Parcheando archivo Java..."
sed -i '' \
    -e 's|import android\.support\.v4\.app\.ActivityCompat;|import androidx.core.app.ActivityCompat;|' \
    -e 's|import android\.support\.v4\.content\.ContextCompat;|import androidx.core.content.ContextCompat;|' \
    "$JAVA_FILE"

if [ $? -ne 0 ]; then
    echo "Error al aplicar parches: fallo al editar el archivo Java"
    exit 1
fi
echo "OK - Archivo Java parcheado"
echo ""
echo "Parches aplicados exitosamente!"
