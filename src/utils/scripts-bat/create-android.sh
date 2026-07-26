#!/bin/bash
set -uo pipefail

echo "========================================"
echo "Create Android Folder - Expo Prebuild"
echo "========================================"

# ---------------------------------------------------------------------------
# Directorios
# ---------------------------------------------------------------------------
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/"
ROOT_DIR="$(cd "${PROJECT_DIR}../../.." && pwd)/"
TOOLS_DIR="${PROJECT_DIR}tools"
JAVA_DIR="${TOOLS_DIR}/jdk"
ANDROID_DIR="${TOOLS_DIR}/android-sdk"

fail() {
    echo ""
    echo "ERROR: $1"
    read -rp "Presiona Enter para salir..."
    exit 1
}

# Verificar si las herramientas existen
if [ ! -d "$JAVA_DIR" ]; then
    echo "ERROR: Java JDK no encontrado"
    fail "Ejecuta primero: npm run deploy"
fi

if [ ! -d "$ANDROID_DIR" ]; then
    echo "ERROR: Android SDK no encontrado"
    fail "Ejecuta primero: npm run deploy"
fi

# ---------------------------------------------------------------------------
# Configurar variables de entorno
# ---------------------------------------------------------------------------
JAVA_HOME="$(find "$JAVA_DIR" -maxdepth 3 -type d -path "*/Contents/Home" 2>/dev/null | head -n 1)"
if [ -z "$JAVA_HOME" ]; then
    JAVA_HOME="$(find "$JAVA_DIR" -maxdepth 1 -type d ! -path "$JAVA_DIR" 2>/dev/null | head -n 1)"
fi
[ -n "$JAVA_HOME" ] || fail "No se pudo determinar JAVA_HOME"
export JAVA_HOME

ANDROID_HOME="$ANDROID_DIR"
export ANDROID_HOME
export PATH="${JAVA_HOME}/bin:${ANDROID_HOME}/cmdline-tools/latest/bin:${ANDROID_HOME}/platform-tools:${ANDROID_HOME}/build-tools/35.0.0:${PATH}"

echo ""
echo "Configuracion:"
echo "- Java: $JAVA_HOME"
echo "- Android SDK: $ANDROID_HOME"

# ---------------------------------------------------------------------------
# Verificar carpeta android
# ---------------------------------------------------------------------------
echo ""
echo "Verificando carpeta android..."
if [ -f "${ROOT_DIR}android/gradlew" ]; then
    echo ""
    echo "La carpeta android YA EXISTE"
    echo "Si deseas recrearla, eliminala primero con: rm -rf android"
    read -rp "Presiona Enter para salir..."
    exit 0
fi

echo ""
echo "Creando estructura Android con expo prebuild..."
echo "Esto puede tardar unos minutos..."
pushd "$ROOT_DIR" > /dev/null
npx expo prebuild --platform android --clean
RESULT=$?
popd > /dev/null

if [ $RESULT -ne 0 ]; then
    echo ""
    echo "ERROR: Fallo en la creacion de la carpeta android"
    echo ""
    echo "Posibles causas:"
    echo "- node_modules no esta instalado (ejecuta: npm install)"
    echo "- package.json no tiene expo configurado correctamente"
    read -rp "Presiona Enter para salir..."
    exit 1
fi

echo ""
echo "========================================"
echo "EXITO! Carpeta Android creada"
echo "========================================"
echo ""
echo "Ubicacion: ${ROOT_DIR}android"
echo ""
echo "Ahora puedes ejecutar:"
echo "  npm run deploy                 - Para compilar e instalar APK"
echo "  cd android; ./gradlew assembleDebug  - Solo compilar"
echo ""
read -rp "Presiona Enter para salir..."
