param(
    [string]$ProjectDir = $PSScriptRoot
)

$ProjectDir = $ProjectDir.Trim('"')

# El script vive en src\utils\scripts-bat\ → la raíz del proyecto está 3 niveles arriba.
# Usamos $PSScriptRoot para que la ruta sea siempre correcta sin importar
# qué valor reciba $ProjectDir.
$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..\..\")).Path

$buildGradle = Join-Path $ProjectRoot "node_modules\react-native-bluetooth-escpos-printer\android\build.gradle"
$javaFile = Join-Path $ProjectRoot "node_modules\react-native-bluetooth-escpos-printer\android\src\main\java\cn\jystudio\bluetooth\RNBluetoothManagerModule.java"

Write-Host "Aplicando parches al modulo bluetooth..."

if (-not (Test-Path $buildGradle)) {
    Write-Warning "No se encontro build.gradle"
    Write-Warning "El modulo puede no estar instalado correctamente"
    exit 0
}

if (-not (Test-Path $javaFile)) {
    Write-Warning "No se encontro el archivo Java"
    exit 0
}

try {
    Write-Host "Parcheando build.gradle..."
    $content = Get-Content $buildGradle -Raw -ErrorAction Stop
    
    $content = $content -replace 'jcenter \{ url "http://jcenter\.bintray\.com/" \}', 'jcenter { url "http://jcenter.bintray.com/"; allowInsecureProtocol = true }'
    $content = $content -replace 'maven \{url "http://repo\.spring\.io/plugins-release/"\}', 'maven { url "http://repo.spring.io/plugins-release/"; allowInsecureProtocol = true }'
    $content = $content -replace '    compile fileTree', '    implementation fileTree'
    $content = $content -replace 'compileSdkVersion 27', 'compileSdkVersion 35'
    $content = $content -replace 'buildToolsVersion "27\.0\.3"', 'buildToolsVersion "35.0.0"'
    $content = $content -replace 'targetSdkVersion 24', 'targetSdkVersion 35'
    $content = $content -replace "implementation group: 'com\.android\.support', name: 'support-v4', version: '27\.0\.0'", "implementation 'androidx.core:core:1.13.1'"
    
    Set-Content $buildGradle -Value $content -NoNewline -ErrorAction Stop
    Write-Host "OK - build.gradle parcheado"
    
    Write-Host "Parcheando archivo Java..."
    $javaContent = Get-Content $javaFile -Raw -ErrorAction Stop
    
    $javaContent = $javaContent -replace 'import android\.support\.v4\.app\.ActivityCompat;', 'import androidx.core.app.ActivityCompat;'
    $javaContent = $javaContent -replace 'import android\.support\.v4\.content\.ContextCompat;', 'import androidx.core.content.ContextCompat;'
    
    Set-Content $javaFile -Value $javaContent -NoNewline -ErrorAction Stop
    Write-Host "OK - Archivo Java parcheado"
    Write-Host ""
    Write-Host "Parches aplicados exitosamente!"
    
} catch {
    Write-Error "Error al aplicar parches: $_"
    exit 1
}
