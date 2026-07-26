#!/bin/bash
set -uo pipefail

echo "========================================"
echo "Build Production - APK Standalone"
echo "========================================"

# ---------------------------------------------------------------------------
# Directorios locales
# ---------------------------------------------------------------------------
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/"
TOOLS_DIR="${PROJECT_DIR}tools"
JAVA_DIR="${TOOLS_DIR}/jdk"
ANDROID_DIR="${TOOLS_DIR}/android-sdk"

fail() {
    echo ""
    echo "ERROR: $1"
    read -rp "Presiona Enter para salir..."
    exit 1
}

# ---------------------------------------------------------------------------
# [1/6] Verificar herramientas
# ---------------------------------------------------------------------------
echo ""
echo "[1/6] Verificando herramientas..."
if [ ! -d "$JAVA_DIR" ]; then
    fail "Java no encontrado. Ejecuta 'npm run deploy' primero para instalar las herramientas."
fi

if [ ! -d "$ANDROID_DIR" ]; then
    fail "Android SDK no encontrado. Ejecuta 'npm run deploy' primero para instalar las herramientas."
fi

# JAVA_HOME: buscar cualquier "Contents/Home" dentro de JAVA_DIR
# (el nombre de la carpeta del JDK puede no terminar en ".jdk" segun el proveedor)
JAVA_HOME="$(find "$JAVA_DIR" -maxdepth 3 -type d -path "*/Contents/Home" 2>/dev/null | head -n 1)"
if [ -z "$JAVA_HOME" ]; then
    JAVA_HOME="$(find "$JAVA_DIR" -maxdepth 1 -type d ! -path "$JAVA_DIR" 2>/dev/null | head -n 1)"
fi
[ -n "$JAVA_HOME" ] || fail "No se pudo determinar JAVA_HOME"
export JAVA_HOME

ANDROID_HOME="$ANDROID_DIR"
export ANDROID_HOME
export PATH="${JAVA_HOME}/bin:${ANDROID_HOME}/cmdline-tools/latest/bin:${ANDROID_HOME}/platform-tools:${ANDROID_HOME}/build-tools/35.0.0:${PATH}"

echo "Java: $JAVA_HOME"
echo "Android SDK: $ANDROID_HOME"

# ---------------------------------------------------------------------------
# [2/6] Aplicar parches a modulos
# ---------------------------------------------------------------------------
echo ""
echo "[2/6] Aplicando parches a modulos..."

BUILD_GRADLE="node_modules/react-native-bluetooth-escpos-printer/android/build.gradle"
JAVA_FILE="node_modules/react-native-bluetooth-escpos-printer/android/src/main/java/cn/jystudio/bluetooth/RNBluetoothManagerModule.java"

if [ -f "$BUILD_GRADLE" ]; then
    sed -i '' \
        -e 's|jcenter { url "http://jcenter\.bintray\.com/" }|jcenter { url "http://jcenter.bintray.com/"; allowInsecureProtocol = true }|' \
        -e 's|maven {url "http://repo\.spring\.io/plugins-release/"}|maven { url "http://repo.spring.io/plugins-release/"; allowInsecureProtocol = true }|' \
        -e 's|    compile fileTree|    implementation fileTree|' \
        -e 's|compileSdkVersion 27|compileSdkVersion 35|' \
        -e 's|buildToolsVersion "27\.0\.3"|buildToolsVersion "35.0.0"|' \
        -e 's|targetSdkVersion 24|targetSdkVersion 35|' \
        -e "s|implementation group: 'com\.android\.support', name: 'support-v4', version: '27\.0\.0'|implementation 'androidx.core:core:1.13.1'|" \
        "$BUILD_GRADLE"
else
    echo "ADVERTENCIA: No se encontro build.gradle, se omite el parche"
fi

if [ -f "$JAVA_FILE" ]; then
    echo "Parchando codigo Java para usar AndroidX..."
    sed -i '' \
        -e 's|import android\.support\.v4\.app\.ActivityCompat;|import androidx.core.app.ActivityCompat;|' \
        -e 's|import android\.support\.v4\.content\.ContextCompat;|import androidx.core.content.ContextCompat;|' \
        "$JAVA_FILE"
else
    echo "ADVERTENCIA: No se encontro el archivo Java, se omite el parche"
fi

# ---------------------------------------------------------------------------
# [3/6] Dispositivo Android conectado
# ---------------------------------------------------------------------------
echo ""
echo "[3/6] Verificando dispositivo Android conectado..."
ADB_BIN="${ANDROID_HOME}/platform-tools/adb"
if [ ! -f "$ADB_BIN" ]; then
    fail "No se encontro adb en $ADB_BIN. El Android SDK no se instalo completo."
fi
xattr -d com.apple.quarantine "$ADB_BIN" 2>/dev/null
chmod +x "$ADB_BIN" 2>/dev/null
"$ADB_BIN" devices || fail "No se pudo ejecutar ADB. Si el error menciona 'no verificado' o 'developer cannot be verified', corre: xattr -dr com.apple.quarantine \"${ANDROID_HOME}\""

echo ""
echo "IMPORTANTE: Asegurate de que tu dispositivo este conectado"
read -rp "Presiona Enter para continuar..."

# ---------------------------------------------------------------------------
# [4/6] Limpiar builds anteriores
# ---------------------------------------------------------------------------
echo ""
echo "[4/6] Limpiando builds anteriores..."
rm -rf "android/app/build"

# ---------------------------------------------------------------------------
# [5/6] Compilar APK RELEASE
# ---------------------------------------------------------------------------
echo ""
echo "[5/6] Compilando APK RELEASE (esto puede tardar varios minutos)..."
echo "Esta APK NO requiere el servidor de Expo para funcionar"
echo ""
pushd android > /dev/null
chmod +x ./gradlew
./gradlew assembleRelease
BUILD_RESULT=$?
popd > /dev/null

if [ $BUILD_RESULT -ne 0 ]; then
    fail "Fallo en la compilacion. Revisa los errores arriba"
fi

# ---------------------------------------------------------------------------
# [6/6] Instalar APK RELEASE en el dispositivo
# ---------------------------------------------------------------------------
echo ""
echo "[6/6] Instalando APK RELEASE en el dispositivo..."
"${ANDROID_HOME}/platform-tools/adb" install -r android/app/build/outputs/apk/release/app-release.apk \
    || fail "Fallo en la instalacion. Verifica que el dispositivo este conectado y desbloqueado"

echo ""
echo "========================================"
echo "EXITO! APK de PRODUCCION instalada"
echo "========================================"
echo ""
echo "APK RELEASE ubicada en: android/app/build/outputs/apk/release/app-release.apk"
echo ""
echo "Esta APK es standalone y NO requiere servidor Expo"
echo "Puedes distribuir este archivo para instalacion en otros dispositivos"
echo ""
read -rp "Presiona Enter para salir..."
