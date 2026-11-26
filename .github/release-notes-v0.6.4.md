# XORA v0.6.4

Primera publicación de XORA con la identidad y el flujo de actualización del proyecto.

## Novedades

- Entrada de micrófono del PC configurable desde **Configuración → Rendimiento y recursos**.
- Renderizado `host` preferente para GPU NVIDIA, AMD e Intel, con degradación automática si el controlador falla.
- Preferencia de GPU: sistema, GPU dedicada o GPU integrada.
- Diagnóstico más claro para aplicaciones ARM, capas de traducción y detección antiemulador.
- Perfiles de dispositivo, rendimiento, mando, teclado, mouse y DPI.
- Complementos de Google Play y Servicios de Google opcionales; XORA no los activa ni redistribuye por defecto.
- Actualizaciones incrementales con manifiesto firmado, SHA-512 y recuperación ante fallos.
- Interfaz, ayuda y mensajes de diagnóstico en español.

## Compatibilidad y seguridad

- La aplicación funciona sin Google Play cuando el APK no lo necesita.
- La versión portátil y la versión completa conservan los datos de usuario durante una actualización.
- El cliente rechaza manifiestos con firma, producto, plataforma o hash incorrectos.
- Las pruebas automatizadas y la verificación visual de la interfaz pasan correctamente en este commit.

## Artefactos

- `XORA-v0.6.4-win64-portable.zip`: versión portátil de Windows.
- `XORA-v0.6.4-update-manifest.json`: manifiesto firmado para el actualizador.
- `XORA-v0.6.4-manifest.json` y `XORA-v0.6.4-app.zip`: actualización incremental.

Todos los artefactos publicados usan ahora la identidad **XORA**.
