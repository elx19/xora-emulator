# Recorrido técnico de XORA

Este documento resume dónde vive cada parte del producto. Los nombres de archivos y comandos son contratos técnicos; los mensajes visibles deben pasar por `i18n`.

## Entrada y biblioteca

- `src/ui/index.html`, `src/ui/app.js` y `src/ui/style.css`: biblioteca, perfiles, rendimiento, controles, complementos y configuración.
- `src/core/installer.js`: normaliza rutas, analiza APK/APKS/XAPK, instala y registra accesos directos.
- `src/core/store.js`: configuración, biblioteca, iconos, perfiles y migración de datos a XORA.
- `src/core/identity.js`: nombres, rutas canónicas y migración segura desde instalaciones anteriores.

## Runtime

- `src/core/provision.js`: descarga y valida ADB, emulator, QEMU e imagen oficial.
- `src/core/engine.js`: ciclo de vida, arranque, conexión ADB y recuperación.
- `src/core/emulator.js`: AVD `xora`, instantánea y parámetros de GPU, memoria y CPU.
- `src/core/layers.js`: análisis de archivos recuperables sin borrar datos de aplicaciones.
- `src/core/updater.js`: Releases, manifiesto firmado, hash y rollback.

## Ventanas y entrada

- `src/core/appwin.js`: ventana nativa de cada aplicación.
- `src/core/agent.js` y `src/core/win/`: prioridad, foco y controles de Windows.
- `src/core/pointer.js`, `src/core/keymap.js` y `src/core/input-latency.js`: mouse, teclado, mando y medición de latencia.

## Validación

`npm test` ejecuta pruebas de APK, runtime simulado, perfiles, complementos, idioma, identidad, manifiestos y actualización. `npm run test:ui` abre Electron y comprueba que todas las categorías de configuración se rendericen en español.

