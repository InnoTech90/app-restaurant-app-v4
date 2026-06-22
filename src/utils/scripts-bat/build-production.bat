@echo off
setlocal EnableDelayedExpansion

echo ========================================
echo Build Production - APK Standalone
echo ========================================

:: Definir directorios locales
set "PROJECT_DIR=%~dp0"
set "TOOLS_DIR=%PROJECT_DIR%tools"
set "JAVA_DIR=%TOOLS_DIR%\jdk"
set "ANDROID_DIR=%TOOLS_DIR%\android-sdk"

echo.
echo [1/6] Verificando herramientas...
if not exist "%JAVA_DIR%" (
    echo ERROR: Java no encontrado. Ejecuta 'npm run deploy' primero para instalar las herramientas.
    pause
    exit /b 1
)

if not exist "%ANDROID_DIR%" (
    echo ERROR: Android SDK no encontrado. Ejecuta 'npm run deploy' primero para instalar las herramientas.
    pause
    exit /b 1
)

:: Buscar el directorio real del JDK
for /d %%i in ("%JAVA_DIR%\*") do set "JAVA_HOME=%%i"
set "ANDROID_HOME=%ANDROID_DIR%"
set "PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\cmdline-tools\latest\bin;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\build-tools\35.0.0;%PATH%"

echo Java: %JAVA_HOME%
echo Android SDK: %ANDROID_HOME%

echo.
echo [2/6] Aplicando parches a modulos...
powershell -Command "(Get-Content 'node_modules\react-native-bluetooth-escpos-printer\android\build.gradle') -replace 'jcenter { url \"http://jcenter.bintray.com/\" }', 'jcenter { url \"http://jcenter.bintray.com/\"; allowInsecureProtocol = true }' | Set-Content 'node_modules\react-native-bluetooth-escpos-printer\android\build.gradle'"
powershell -Command "(Get-Content 'node_modules\react-native-bluetooth-escpos-printer\android\build.gradle') -replace 'maven {url \"http://repo.spring.io/plugins-release/\"}', 'maven { url \"http://repo.spring.io/plugins-release/\"; allowInsecureProtocol = true }' | Set-Content 'node_modules\react-native-bluetooth-escpos-printer\android\build.gradle'"
powershell -Command "(Get-Content 'node_modules\react-native-bluetooth-escpos-printer\android\build.gradle') -replace '    compile fileTree', '    implementation fileTree' | Set-Content 'node_modules\react-native-bluetooth-escpos-printer\android\build.gradle'"
powershell -Command "(Get-Content 'node_modules\react-native-bluetooth-escpos-printer\android\build.gradle') -replace 'compileSdkVersion 27', 'compileSdkVersion 35' | Set-Content 'node_modules\react-native-bluetooth-escpos-printer\android\build.gradle'"
powershell -Command "(Get-Content 'node_modules\react-native-bluetooth-escpos-printer\android\build.gradle') -replace 'buildToolsVersion \"27.0.3\"', 'buildToolsVersion \"35.0.0\"' | Set-Content 'node_modules\react-native-bluetooth-escpos-printer\android\build.gradle'"
powershell -Command "(Get-Content 'node_modules\react-native-bluetooth-escpos-printer\android\build.gradle') -replace 'targetSdkVersion 24', 'targetSdkVersion 35' | Set-Content 'node_modules\react-native-bluetooth-escpos-printer\android\build.gradle'"
powershell -Command "(Get-Content 'node_modules\react-native-bluetooth-escpos-printer\android\build.gradle') -replace \"implementation group: 'com.android.support', name: 'support-v4', version: '27.0.0'\", \"implementation 'androidx.core:core:1.13.1'\" | Set-Content 'node_modules\react-native-bluetooth-escpos-printer\android\build.gradle'"

echo Parchando codigo Java para usar AndroidX...
powershell -Command "(Get-Content 'node_modules\react-native-bluetooth-escpos-printer\android\src\main\java\cn\jystudio\bluetooth\RNBluetoothManagerModule.java') -replace 'import android.support.v4.app.ActivityCompat;', 'import androidx.core.app.ActivityCompat;' | Set-Content 'node_modules\react-native-bluetooth-escpos-printer\android\src\main\java\cn\jystudio\bluetooth\RNBluetoothManagerModule.java'"
powershell -Command "(Get-Content 'node_modules\react-native-bluetooth-escpos-printer\android\src\main\java\cn\jystudio\bluetooth\RNBluetoothManagerModule.java') -replace 'import android.support.v4.content.ContextCompat;', 'import androidx.core.content.ContextCompat;' | Set-Content 'node_modules\react-native-bluetooth-escpos-printer\android\src\main\java\cn\jystudio\bluetooth\RNBluetoothManagerModule.java'"

echo.
echo [3/6] Verificando dispositivo Android conectado...
"%ANDROID_HOME%\platform-tools\adb.exe" devices
if !errorlevel! neq 0 (
    echo ERROR: No se pudo ejecutar ADB
    pause
    exit /b 1
)

echo.
echo IMPORTANTE: Asegurate de que tu dispositivo este conectado
pause

echo.
echo [4/6] Limpiando builds anteriores...
if exist "android\app\build" (
    rmdir /S /Q "android\app\build"
)

echo.
echo [5/6] Compilando APK RELEASE (esto puede tardar varios minutos)...
echo Esta APK NO requiere el servidor de Expo para funcionar
echo.
cd android
call gradlew.bat assembleRelease
set BUILD_RESULT=!errorlevel!
cd ..

if !BUILD_RESULT! neq 0 (
    echo.
    echo ERROR: Fallo en la compilacion
    echo Revisa los errores arriba
    pause
    exit /b 1
)

echo.
echo [6/6] Instalando APK RELEASE en el dispositivo...
"%ANDROID_HOME%\platform-tools\adb.exe" install -r android\app\build\outputs\apk\release\app-release.apk
if !errorlevel! neq 0 (
    echo.
    echo ERROR: Fallo en la instalacion
    echo Verifica que el dispositivo este conectado y desbloqueado
    pause
    exit /b 1
)

echo.
echo ========================================
echo EXITO! APK de PRODUCCION instalada
echo ========================================
echo.
echo APK RELEASE ubicada en: android\app\build\outputs\apk\release\app-release.apk
echo.
echo Esta APK es standalone y NO requiere servidor Expo
echo Puedes distribuir este archivo para instalacion en otros dispositivos
echo.
pause
