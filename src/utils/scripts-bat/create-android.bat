@echo off
setlocal EnableDelayedExpansion

echo ========================================
echo Create Android Folder - Expo Prebuild
echo ========================================

:: Definir directorios
set "PROJECT_DIR=%~dp0"
set "ROOT_DIR=%PROJECT_DIR%..\..\..\"
set "TOOLS_DIR=%PROJECT_DIR%tools"
set "JAVA_DIR=%TOOLS_DIR%\jdk"
set "ANDROID_DIR=%TOOLS_DIR%\android-sdk"

:: Verificar si las herramientas existen
if not exist "%JAVA_DIR%" (
    echo ERROR: Java JDK no encontrado
    echo Ejecuta primero: npm run deploy
    pause
    exit /b 1
)

if not exist "%ANDROID_DIR%" (
    echo ERROR: Android SDK no encontrado
    echo Ejecuta primero: npm run deploy
    pause
    exit /b 1
)

:: Configurar variables de entorno
for /d %%i in ("%JAVA_DIR%\*") do set "JAVA_HOME=%%i"
set "ANDROID_HOME=%ANDROID_DIR%"
set "PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\cmdline-tools\latest\bin;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\build-tools\35.0.0;%PATH%"

echo.
echo Configuracion:
echo - Java: %JAVA_HOME%
echo - Android SDK: %ANDROID_HOME%

echo.
echo Verificando carpeta android...
if exist "%ROOT_DIR%android\gradlew.bat" (
    echo.
    echo La carpeta android YA EXISTE
    echo Si deseas recrearla, eliminala primero con: rmdir /S /Q android
    pause
    exit /b 0
)

echo.
echo Creando estructura Android con expo prebuild...
echo Esto puede tardar unos minutos...
pushd "%ROOT_DIR%"
call npx expo prebuild --platform android --clean
set RESULT=!errorlevel!
popd

if !RESULT! neq 0 (
    echo.
    echo ERROR: Fallo en la creacion de la carpeta android
    echo.
    echo Posibles causas:
    echo - node_modules no esta instalado (ejecuta: npm install)
    echo - package.json no tiene expo configurado correctamente
    pause
    exit /b 1
)

echo.
echo ========================================
echo EXITO! Carpeta Android creada
echo ========================================
echo.
echo Ubicacion: %ROOT_DIR%android
echo.
echo Ahora puedes ejecutar:
echo   npm run deploy          - Para compilar e instalar APK
echo   cd android; gradlew.bat assembleDebug  - Solo compilar
echo.
pause
