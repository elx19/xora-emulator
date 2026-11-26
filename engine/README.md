# Directorio del runtime (preparación manual opcional)

XORA administra ADB, QEMU y la imagen de Android automáticamente. La versión
ligera descarga el runtime desde el Release oficial de GitHub y lo guarda en
`%APPDATA%\XORA\runtime\`. No es necesario preparar archivos manualmente.

Este directorio solo se usa en estos casos:

## 1. Colocar QEMU manualmente

```
engine/qemu/
├─ qemu-system-x86_64.exe
├─ qemu-img.exe
└─ …（其余 QEMU 文件）
```

Descargas oficiales de QEMU para Windows: https://qemu.weilnetz.de/w64/
(`qemu-w64-setup-*.exe` es un instalador NSIS; también puedes extraerlo con
7-Zip y colocar los archivos en la ubicación anterior.)

## 2. Colocar ADB manualmente

```
tools/platform-tools/
└─ adb.exe
```

Descarga: https://developer.android.com/tools/releases/platform-tools

## Imagen del sistema

- Predeterminada: Android 14 Google Play x86_64, con Play Store y Servicios de Google.
- También puedes importar una imagen propia (qcow2, raw o vmdk) desde Configuración → Runtime.
- La imagen oficial de XORA se comparte entre las aplicaciones y solo se guarda una copia.

## Aceleración de hardware

El runtime usa WHPX o AEHD cuando Windows lo permite. Activa la Plataforma de
hipervisor de Windows y reinicia si la aceleración no está disponible; XORA usará
software como respaldo, con mayor consumo y menor fluidez.
