#!/bin/bash
set -uo pipefail

echo "========================================"
echo "Build Portable - Configuracion Automatica"
echo "========================================"

# ---------------------------------------------------------------------------
# Directorios locales
# ---------------------------------------------------------------------------
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/"
ROOT_DIR="$(cd "${PROJECT_DIR}../../.." && pwd)/"
TOOLS_DIR="${PROJECT_DIR}tools"
JAVA_DIR="${TOOLS_DIR}/jdk"
ANDROID_DIR="${TOOLS_DIR}/android-sdk"

# ---------------------------------------------------------------------------
# Deteccion de arquitectura (Apple Silicon vs Intel)
# ---------------------------------------------------------------------------
ARCH="$(uname -m)"
if [ "$ARCH" = "arm64" ]; then
    JDK_ARCH="aarch64"
    CMDLINE_TOOLS_ARCH="mac"
else
    JDK_ARCH="x64"
    CMDLINE_TOOLS_ARCH="mac"
fi

# URLs de descarga (build de Microsoft OpenJDK 17 para macOS)
JDK_URL="https://aka.ms/download-jdk/microsoft-jdk-17.0.12-macos-${JDK_ARCH}.tar.gz"
CMDLINE_TOOLS_URL="https://dl.google.com/android/repository/commandlinetools-mac-11076708_latest.zip"

fail() {
    echo ""
    echo "ERROR: $1"
    read -rp "Presiona Enter para salir..."
    exit 1
}

# ---------------------------------------------------------------------------
# [1/9] Java JDK 17
# ---------------------------------------------------------------------------
echo ""
echo "[1/9] Verificando/Descargando Java JDK 17..."
if [ ! -d "$JAVA_DIR" ]; then
    echo "Java no encontrado. Descargando JDK 17 (${JDK_ARCH})..."
    mkdir -p "$TOOLS_DIR"
    mkdir -p "$JAVA_DIR"

    echo "Descargando desde Microsoft..."
    curl -L --fail -o "${TOOLS_DIR}/jdk.tar.gz" "$JDK_URL" || fail "No se pudo descargar Java"

    echo "Extrayendo Java..."
    tar -xzf "${TOOLS_DIR}/jdk.tar.gz" -C "$JAVA_DIR" || fail "No se pudo extraer Java"
    rm -f "${TOOLS_DIR}/jdk.tar.gz"
else
    echo "Java ya existe en $JAVA_DIR"
fi

# El tar de macOS extrae un bundle tipo "jdk-17.x.x+N/Contents/Home"
# (puede o no tener sufijo ".jdk" en el nombre segun el proveedor del JDK,
# asi que buscamos cualquier "Contents/Home" hasta 3 niveles de profundidad).
JAVA_HOME="$(find "$JAVA_DIR" -maxdepth 3 -type d -path "*/Contents/Home" 2>/dev/null | head -n 1)"
if [ -z "$JAVA_HOME" ]; then
    # Fallback: primer subdirectorio encontrado
    JAVA_HOME="$(find "$JAVA_DIR" -maxdepth 1 -type d ! -path "$JAVA_DIR" | head -n 1)"
fi
[ -n "$JAVA_HOME" ] || fail "No se pudo determinar JAVA_HOME"
export JAVA_HOME
echo "Java configurado: $JAVA_HOME"

# ---------------------------------------------------------------------------
# [2/9] Android SDK
# ---------------------------------------------------------------------------
echo ""
echo "[2/9] Verificando/Descargando Android SDK..."
if [ ! -d "${ANDROID_DIR}/cmdline-tools" ]; then
    echo "Android SDK no encontrado. Descargando..."
    mkdir -p "$ANDROID_DIR"

    echo "Descargando Android Command Line Tools..."
    curl -L --fail -o "${TOOLS_DIR}/cmdline-tools.zip" "$CMDLINE_TOOLS_URL" || fail "No se pudo descargar Android SDK"

    echo "Extrayendo Android SDK..."
    rm -rf "${ANDROID_DIR}/cmdline-tools-temp"
    mkdir -p "${ANDROID_DIR}/cmdline-tools-temp"
    unzip -q "${TOOLS_DIR}/cmdline-tools.zip" -d "${ANDROID_DIR}/cmdline-tools-temp" || fail "No se pudo extraer Android SDK"

    # Crear estructura correcta
    mkdir -p "${ANDROID_DIR}/cmdline-tools/latest"
    cp -R "${ANDROID_DIR}/cmdline-tools-temp/cmdline-tools/." "${ANDROID_DIR}/cmdline-tools/latest/"
    rm -rf "${ANDROID_DIR}/cmdline-tools-temp"
    rm -f "${TOOLS_DIR}/cmdline-tools.zip"
else
    echo "Android SDK ya existe en $ANDROID_DIR"
fi

ANDROID_HOME="$ANDROID_DIR"
export ANDROID_HOME
export PATH="${JAVA_HOME}/bin:${ANDROID_HOME}/cmdline-tools/latest/bin:${ANDROID_HOME}/platform-tools:${ANDROID_HOME}/build-tools/35.0.0:${PATH}"

# ---------------------------------------------------------------------------
# [3/9] Componentes de Android SDK
# ---------------------------------------------------------------------------
echo ""
echo "[3/9] Instalando componentes de Android SDK..."
bash "${PROJECT_DIR}install-sdk-components.sh" --android-home "$ANDROID_HOME" \
    || fail "Fallo la instalacion de componentes SDK"

export PATH="${JAVA_HOME}/bin:${ANDROID_HOME}/cmdline-tools/latest/bin:${ANDROID_HOME}/platform-tools:${ANDROID_HOME}/build-tools/35.0.0:${PATH}"

# ---------------------------------------------------------------------------
# [4/9] Parches a modulos problematicos
# ---------------------------------------------------------------------------
echo ""
echo "[4/9] Aplicando parches a modulos problematicos..."
if ! bash "${PROJECT_DIR}patch-bluetooth-module.sh" --project-dir "$PROJECT_DIR"; then
    echo "ADVERTENCIA: Algunos parches no se pudieron aplicar"
    echo "La aplicacion puede funcionar igual"
fi

# ---------------------------------------------------------------------------
# [5/9] Dispositivo Android conectado
# ---------------------------------------------------------------------------
echo ""
echo "[5/9] Verificando dispositivo Android conectado..."
ADB_BIN="${ANDROID_HOME}/platform-tools/adb"
if [ ! -f "$ADB_BIN" ]; then
    fail "No se encontro adb en $ADB_BIN. El Android SDK no se instalo completo (revisa el paso 3/9)."
fi
xattr -d com.apple.quarantine "$ADB_BIN" 2>/dev/null
chmod +x "$ADB_BIN" 2>/dev/null
"$ADB_BIN" devices || fail "No se pudo ejecutar ADB. Si el error menciona 'no verificado' o 'developer cannot be verified', corre: xattr -dr com.apple.quarantine \"${ANDROID_HOME}\""

echo ""
echo "IMPORTANTE: Asegurate de que tu dispositivo este conectado y aparezca en la lista"
echo "Si no aparece, habilita la depuracion USB en tu dispositivo"
read -rp "Presiona Enter para continuar..."

# ---------------------------------------------------------------------------
# [6/9] Carpeta android con Expo Prebuild
# ---------------------------------------------------------------------------
echo ""
echo "[6/9] Verificando/Creando carpeta Android con Expo Prebuild..."
if [ ! -f "${ROOT_DIR}android/gradlew" ]; then
    echo "Carpeta android no encontrada. Creando estructura con expo prebuild..."
    pushd "$ROOT_DIR" > /dev/null
    npx expo prebuild --platform android
    PREBUILD_RESULT=$?
    popd > /dev/null

    if [ $PREBUILD_RESULT -ne 0 ]; then
        fail "Fallo en la creacion de la carpeta android. Revisa que node_modules este instalado correctamente"
    fi
    echo "Estructura Android creada exitosamente"
else
    echo "Carpeta Android ya existe"
fi

# ---------------------------------------------------------------------------
# [7/9] Limpiar build anterior
# ---------------------------------------------------------------------------
echo ""
echo "[7/9] Limpiando build anterior..."
rm -rf "${ROOT_DIR}android/app/build"

# ---------------------------------------------------------------------------
# [8/9] Compilar APK
# ---------------------------------------------------------------------------
echo ""
echo "[8/9] Compilando APK (esto puede tardar varios minutos)..."
echo "Compilando sin paralelizacion ni daemon para evitar conflictos de archivos..."
pushd "${ROOT_DIR}android" > /dev/null
chmod +x ./gradlew
./gradlew assembleDebug --max-workers=1 --no-daemon --no-parallel
BUILD_RESULT=$?
popd > /dev/null

if [ $BUILD_RESULT -ne 0 ]; then
    fail "Fallo en la compilacion. Revisa los errores arriba"
fi

# ---------------------------------------------------------------------------
# [9/9] Instalar APK en el dispositivo
# ---------------------------------------------------------------------------
echo ""
echo "[9/9] Instalando APK en el dispositivo..."
"${ANDROID_HOME}/platform-tools/adb" install -r "${ROOT_DIR}android/app/build/outputs/apk/debug/app-debug.apk" \
    || fail "Fallo en la instalacion. Verifica que el dispositivo este conectado y desbloqueado"

echo ""
echo "========================================"
echo "EXITO! Herramientas instaladas correctamente"
echo "========================================"
echo ""
echo "Ubicacion de Herramientas: src/utils/scripts-bat/tools"
echo ""
echo "Herramientas instaladas en: $TOOLS_DIR"
echo "- Java: $JAVA_HOME"
echo "- Android SDK: $ANDROID_HOME"
echo ""
read -rp "Presiona Enter para salir..."
