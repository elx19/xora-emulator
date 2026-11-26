# Entorno de desarrollo de XORA

## Requisitos

- Windows 10/11 x64 o Linux compatible.
- Node.js 20 o posterior.
- npm.
- Electron instalado con las dependencias del repositorio.

## Comandos

```powershell
npm install
npm test
npm run test:ui
npm start
npm run build:manual
npm run build:exe
npm run build:exe:full
```

El instalador normal es ligero y descarga el runtime desde GitHub. `build:exe:full` genera una variante desconectada con el runtime incluido.

## Variables de prueba

Para probar un APK real se puede definir `XORA_TEST_APK`. El nombre heredado `APKSTART_TEST_APK` se acepta únicamente por compatibilidad con scripts antiguos.

## Revisión antes de publicar

Ejecuta `npm test`, `npm run test:ui` y `git diff --check`. Confirma que el paquete use XORA, que no haya secretos, que el manifiesto esté firmado y que el artefacto coincida con su SHA-512.
