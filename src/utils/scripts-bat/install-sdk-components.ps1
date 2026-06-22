param(
    [string]$AndroidHome
)

$env:JAVA_HOME = (Get-ChildItem "$PSScriptRoot\tools\jdk" -Directory | Select-Object -First 1).FullName
$env:ANDROID_HOME = $AndroidHome
$env:PATH = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\cmdline-tools\latest\bin;$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\build-tools\35.0.0;$env:PATH"

$sdkmanager = "$AndroidHome\cmdline-tools\latest\bin\sdkmanager.bat"

Write-Host "Aceptando licencias..." -ForegroundColor Yellow
"y`ny`ny`ny`ny`ny`ny`ny`ny" | & $sdkmanager --licenses

Write-Host "`nInstalando platform-tools..." -ForegroundColor Yellow
& $sdkmanager "platform-tools"

Write-Host "`nInstalando Android Platform 35..." -ForegroundColor Yellow
& $sdkmanager "platforms;android-35"

Write-Host "`nInstalando Build Tools 35.0.0..." -ForegroundColor Yellow
& $sdkmanager "build-tools;35.0.0"

Write-Host "`nInstalando NDK 27.1.12297006..." -ForegroundColor Yellow
& $sdkmanager "ndk;27.1.12297006"

Write-Host "`nInstalando CMake 3.22.1..." -ForegroundColor Yellow
& $sdkmanager "cmake;3.22.1"

# Eliminar carpeta backup corrupta de platform-tools si existe
$platformToolsBackup = "$AndroidHome\platform-tools.backup"
if (Test-Path $platformToolsBackup) {
    Write-Host "`nEliminando platform-tools.backup corrupto..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force $platformToolsBackup
}

# Corregir permisos de solo lectura en el NDK (necesario en Windows)
Write-Host "`nCorrigiendo permisos en NDK..." -ForegroundColor Yellow
$ndkPath = "$AndroidHome\ndk\27.1.12297006"
if (Test-Path $ndkPath) {
    $sysrootPath = "$ndkPath\toolchains\llvm\prebuilt\windows-x86_64\sysroot"
    if (Test-Path $sysrootPath) {
        takeown /F "$sysrootPath" /R /D S /A 2>$null
        icacls "$sysrootPath" /grant "${env:USERNAME}:(OI)(CI)F" /T /Q 2>$null
    }
    attrib -R "$ndkPath\*" /S /D 2>$null
    icacls "$ndkPath" /grant "${env:USERNAME}:(OI)(CI)F" /T /Q 2>$null
    Write-Host "Permisos corregidos" -ForegroundColor Green
}

# Corregir permisos del CMake tambien
$cmakePath = "$AndroidHome\cmake\3.22.1"
if (Test-Path $cmakePath) {
    attrib -R "$cmakePath\*" /S /D 2>$null
    icacls "$cmakePath" /grant "${env:USERNAME}:(OI)(CI)F" /T /Q 2>$null
}

Write-Host "`nComponentes instalados correctamente!" -ForegroundColor Green
