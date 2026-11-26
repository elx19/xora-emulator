# XORA v0.6.12

Esta versión corrige el arranque de aplicaciones cuando el dispositivo Android pierde temporalmente la conexión ADB y completa la traducción de los estados dinámicos del actualizador.

## Correcciones y mejoras

- Recuperación automática cuando el serial ADB desaparece durante el arranque; XORA espera, reconecta y reintenta sin pedir configuración manual.
- Mensajes claros en español para errores de inicio, red y actualización.
- Indicador de conexión del PC con barras de señal, latencia y velocidad estimada.
- El emulador usa la conexión de Internet del PC y vuelve a intentar la conexión Wi‑Fi virtual de Android cuando es necesario.
- Actualizaciones desde GitHub integradas en XORA, con confirmación «Instalar ahora» o «Más tarde» y verificación de firma.
- Instalación directa de APK desde la biblioteca o mediante arrastrar y soltar.
- Google Play Store y Servicios de Google incluidos en la imagen oficial del runtime.

## Validación

- Suite principal: 142 pruebas correctas.
- Interfaz Electron: 49 pruebas correctas.
- Auditoría de dependencias de producción: 0 vulnerabilidades de severidad alta.
