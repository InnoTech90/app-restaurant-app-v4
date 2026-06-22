@echo off
setlocal EnableDelayedExpansion

echo ========================================
echo Build Portable - Configuracion Automatica
echo ========================================

:: Definir directorios locales
set "PROJECT_DIR=%~dp0"
set "ROOT_DIR=%PROJECT_DIR%..\..\..\"
set "TOOLS_DIR=%PROJECT_DIR%tools"
set "JAVA_DIR=%TOOLS_DIR%\jdk"
set "ANDROID_DIR=%TOOLS_DIR%\android-sdk"

:: URLs de descarga
set "JDK_URL=https://download.oracle.com/java/17/archive/jdk-17.0.12_windows-x64_bin.zip"
set "CMDLINE_TOOLS_URL=https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip"

echo.
echo [1/9] Verificando/Descargando Java JDK 17...
if not exist "%JAVA_DIR%" (
    echo Java no encontrado. Descargando JDK 17...
    mkdir "%TOOLS_DIR%" 2>nul
    mkdir "%JAVA_DIR%" 2>nul
    
    echo Descargando desde Oracle...
    powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://aka.ms/download-jdk/microsoft-jdk-17.0.12-windows-x64.zip' -OutFile '%TOOLS_DIR%\jdk.zip'}"
    
    if !errorlevel! neq 0 (
        echo ERROR: No se pudo descargar Java
        pause
        exit /b 1
    )
    
    echo Extrayendo Java...
    powershell -Command "Expand-Archive -Path '%TOOLS_DIR%\jdk.zip' -DestinationPath '%JAVA_DIR%' -Force"
    
    :: Buscar el directorio real del JDK
    for /d %%i in ("%JAVA_DIR%\*") do set "JAVA_HOME=%%i"
    del "%TOOLS_DIR%\jdk.zip"
) else (
    echo Java ya existe en %JAVA_DIR%
    for /d %%i in ("%JAVA_DIR%\*") do set "JAVA_HOME=%%i"
)

echo Java configurado: %JAVA_HOME%

echo.
echo [2/9] Verificando/Descargando Android SDK...
if not exist "%ANDROID_DIR%\cmdline-tools" (
    echo Android SDK no encontrado. Descargando...
    mkdir "%ANDROID_DIR%" 2>nul
    
    echo Descargando Android Command Line Tools...
    powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '%CMDLINE_TOOLS_URL%' -OutFile '%TOOLS_DIR%\cmdline-tools.zip'}"
    
    if !errorlevel! neq 0 (
        echo ERROR: No se pudo descargar Android SDK
        pause
        exit /b 1
    )
    
    echo Extrayendo Android SDK...
    powershell -Command "Expand-Archive -Path '%TOOLS_DIR%\cmdline-tools.zip' -DestinationPath '%ANDROID_DIR%\cmdline-tools-temp' -Force"
    
    :: Crear estructura correcta
    mkdir "%ANDROID_DIR%\cmdline-tools\latest" 2>nul
    xcopy /E /I /Y "%ANDROID_DIR%\cmdline-tools-temp\cmdline-tools\*" "%ANDROID_DIR%\cmdline-tools\latest\"
    rmdir /S /Q "%ANDROID_DIR%\cmdline-tools-temp"
    del "%TOOLS_DIR%\cmdline-tools.zip"
) else (
    echo Android SDK ya existe en %ANDROID_DIR%
)

set "ANDROID_HOME=%ANDROID_DIR%"
set "PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\cmdline-tools\latest\bin;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\build-tools\35.0.0;%PATH%"

echo.
echo [3/9] Instalando componentes de Android SDK...
powershell -ExecutionPolicy Bypass -File "%PROJECT_DIR%install-sdk-components.ps1" -AndroidHome "%ANDROID_HOME%"
if !errorlevel! neq 0 (
    echo ERROR: Fallo la instalacion de componentes SDK
    pause
    exit /b 1
)

set "PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\cmdline-tools\latest\bin;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\build-tools\35.0.0;%PATH%"

echo.
echo [4/9] Aplicando parches a modulos problematicos...
powershell -ExecutionPolicy Bypass -File "%PROJECT_DIR%patch-bluetooth-module.ps1" -ProjectDir "%PROJECT_DIR%"
if !errorlevel! neq 0 (
    echo ADVERTENCIA: Algunos parches no se pudieron aplicar
    echo La aplicacion puede funcionar igual
)

echo.
echo [5/9] Verificando dispositivo Android conectado...
"%ANDROID_HOME%\platform-tools\adb.exe" devices
if !errorlevel! neq 0 (
    echo ERROR: No se pudo ejecutar ADB
    pause
    exit /b 1
)

echo.
echo IMPORTANTE: Asegurate de que tu dispositivo este conectado y aparezca en la lista
echo Si no aparece, habilita la depuracion USB en tu dispositivo
pause

echo.
echo [6/9] Verificando/Creando carpeta Android con Expo Prebuild...
if not exist "%ROOT_DIR%android\gradlew.bat" (
    echo Carpeta android no encontrada. Creando estructura con expo prebuild...
    pushd "%ROOT_DIR%"
    call npx expo prebuild --platform android
    set PREBUILD_RESULT=!errorlevel!
    popd
    
    if !PREBUILD_RESULT! neq 0 (
        echo ERROR: Fallo en la creacion de la carpeta android
        echo Revisa que node_modules este instalado correctamente
        pause
        exit /b 1
    )
    echo Estructura Android creada exitosamente
) else (
    echo Carpeta Android ya existe
)

echo.
echo [7/9] Limpiando build anterior...
if exist "%ROOT_DIR%android\app\build" (
    rmdir /S /Q "%ROOT_DIR%android\app\build"
)

echo.
echo [8/9] Compilando APK (esto puede tardar varios minutos)...
echo Compilando sin paralelizacion ni daemon para evitar conflictos de archivos...
pushd "%ROOT_DIR%android"
call gradlew.bat assembleDebug --max-workers=1 --no-daemon --no-parallel
set BUILD_RESULT=!errorlevel!
popd

if !BUILD_RESULT! neq 0 (
    echo.
    echo ERROR: Fallo en la compilacion
    echo Revisa los errores arriba
    pause
    exit /b 1
)

echo.
echo [9/9] Instalando APK en el dispositivo...
"%ANDROID_HOME%\platform-tools\adb.exe" install -r "%ROOT_DIR%android\app\build\outputs\apk\debug\app-debug.apk"
if !errorlevel! neq 0 (
    echo.
    echo ERROR: Fallo en la instalacion
    echo Verifica que el dispositivo este conectado y desbloqueado
    pause
    exit /b 1
)

echo.
echo ========================================
echo EXITO! Herramientas instaladas correctamente
echo ========================================
echo.
echo Ubicacion de Herramientas: src/utils/scripts-bat/tools
echo.
echo Herramientas instaladas en: %TOOLS_DIR%
echo - Java: %JAVA_HOME%
echo - Android SDK: %ANDROID_HOME%
echo.
echo.
pause
