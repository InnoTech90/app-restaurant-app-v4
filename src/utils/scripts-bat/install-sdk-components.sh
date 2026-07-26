#!/bin/bash
set -uo pipefail

# ---------------------------------------------------------------------------
# Argumentos
# ---------------------------------------------------------------------------
ANDROID_HOME=""
while [ $# -gt 0 ]; do
    case "$1" in
        --android-home)
            ANDROID_HOME="$2"
            shift 2
            ;;
        *)
            shift
            ;;
    esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# JAVA_HOME: buscar cualquier "Contents/Home" dentro de tools/jdk
# (el nombre de la carpeta del JDK puede no terminar en ".jdk" segun el proveedor,
# p.ej. el JDK de Microsoft extrae a "jdk-17.0.12+7/Contents/Home" sin sufijo .jdk)
JAVA_HOME="$(find "${SCRIPT_DIR}/tools/jdk" -maxdepth 3 -type d -path "*/Contents/Home" 2>/dev/null | head -n 1)"
if [ -z "$JAVA_HOME" ]; then
    JAVA_HOME="$(find "${SCRIPT_DIR}/tools/jdk" -maxdepth 1 -type d ! -path "${SCRIPT_DIR}/tools/jdk" 2>/dev/null | head -n 1)"
fi
export JAVA_HOME

export ANDROID_HOME
export PATH="${JAVA_HOME}/bin:${ANDROID_HOME}/cmdline-tools/latest/bin:${ANDROID_HOME}/platform-tools:${ANDROID_HOME}/build-tools/35.0.0:${PATH}"

if [ ! -x "${JAVA_HOME}/bin/java" ]; then
    echo "ERROR: JAVA_HOME invalido: $JAVA_HOME (no se encontro bin/java ahi)"
    exit 1
fi

# Quitar cuarentena de Gatekeeper y dar permisos de ejecucion a TODO el SDK
# (los binarios descargados con curl/unzip quedan marcados como "no verificados"
# y macOS los bloquea si no se limpia este atributo).
xattr -dr com.apple.quarantine "$ANDROID_HOME" 2>/dev/null
find "$ANDROID_HOME/cmdline-tools/latest/bin" -type f -exec chmod +x {} \; 2>/dev/null

SDKMANAGER="${ANDROID_HOME}/cmdline-tools/latest/bin/sdkmanager"
chmod +x "$SDKMANAGER" 2>/dev/null

fail() {
    echo ""
    echo "ERROR: $1"
    exit 1
}

if [ ! -f "$SDKMANAGER" ]; then
    fail "No se encontro sdkmanager en $SDKMANAGER. Revisa que cmdline-tools se haya descomprimido bien."
fi

echo "Aceptando licencias..."
yes | "$SDKMANAGER" --licenses > /dev/null

echo ""
echo "Instalando platform-tools..."
"$SDKMANAGER" "platform-tools" || fail "sdkmanager fallo instalando platform-tools (revisa el mensaje de Java/error arriba)"

echo ""
echo "Instalando Android Platform 35..."
"$SDKMANAGER" "platforms;android-35" || fail "sdkmanager fallo instalando platforms;android-35"

echo ""
echo "Instalando Build Tools 35.0.0..."
"$SDKMANAGER" "build-tools;35.0.0" || fail "sdkmanager fallo instalando build-tools;35.0.0"

echo ""
echo "Instalando NDK 27.1.12297006..."
"$SDKMANAGER" "ndk;27.1.12297006" || fail "sdkmanager fallo instalando el NDK"

echo ""
echo "Instalando CMake 3.22.1..."
"$SDKMANAGER" "cmake;3.22.1" || fail "sdkmanager fallo instalando CMake"

# Eliminar carpeta backup corrupta de platform-tools si existe
PLATFORM_TOOLS_BACKUP="${ANDROID_HOME}/platform-tools.backup"
if [ -d "$PLATFORM_TOOLS_BACKUP" ]; then
    echo ""
    echo "Eliminando platform-tools.backup corrupto..."
    rm -rf "$PLATFORM_TOOLS_BACKUP"
fi

# Corregir permisos de ejecucion/escritura en el NDK y CMake
# (en macOS no existen ACLs tipo Windows; basta con chmod -R)
echo ""
echo "Corrigiendo permisos en NDK..."
NDK_PATH="${ANDROID_HOME}/ndk/27.1.12297006"
if [ -d "$NDK_PATH" ]; then
    SYSROOT_PATH="${NDK_PATH}/toolchains/llvm/prebuilt/darwin-x86_64/sysroot"
    if [ -d "$SYSROOT_PATH" ]; then
        chmod -R u+rwX "$SYSROOT_PATH" 2>/dev/null
    fi
    chmod -R u+rwX "$NDK_PATH" 2>/dev/null
    echo "Permisos corregidos"
fi

# Corregir permisos del CMake tambien
CMAKE_PATH="${ANDROID_HOME}/cmake/3.22.1"
if [ -d "$CMAKE_PATH" ]; then
    chmod -R u+rwX "$CMAKE_PATH" 2>/dev/null
fi

echo ""
echo ""
echo "Quitando cuarentena y ajustando permisos de ejecucion en platform-tools..."
xattr -dr com.apple.quarantine "${ANDROID_HOME}/platform-tools" 2>/dev/null
chmod +x "${ANDROID_HOME}/platform-tools/adb" 2>/dev/null
chmod +x "${ANDROID_HOME}/platform-tools"/* 2>/dev/null

# Verificacion final: si adb no quedo instalado, algo fallo mas arriba
# aunque los "|| fail" no lo hayan detectado (p.ej. sdkmanager devolvio 0
# pero no escribio los archivos).
if [ ! -f "${ANDROID_HOME}/platform-tools/adb" ]; then
    fail "adb no aparece en ${ANDROID_HOME}/platform-tools/ despues de la instalacion. sdkmanager no genero los archivos esperados; revisa el output de 'Instalando platform-tools' mas arriba en busca de errores de Java/red."
fi

echo "Componentes instalados correctamente!"
