# XORA v0.6.13

Esta versión corrige la instalación directa de APK y la apertura de Google Play en el runtime oficial de XORA.

## Correcciones principales

- El emulador usa explícitamente el ADB incluido en XORA y deja de mezclarlo con el ADB instalado en Windows.
- La instalación de APK, APKS y XAPK espera a que Android esté conectado antes de iniciar la transferencia; si ADB no responde, cancela con un mensaje claro en lugar de quedarse bloqueada.
- Play Store y Servicios de Google se detectan como componentes del sistema y pueden repararse desde Complementos si quedan deshabilitados o reemplazados por una actualización incompatible.
- Si Play Store entra en un ANR después de una actualización incompatible, XORA restaura una sola vez la copia oficial incluida en la imagen y vuelve a intentar abrirla.
- Se conserva la instalación dentro de la ventana de XORA y el acceso a Internet del PC mediante la red virtual de Android.

## Validación

- Suite principal: 142 pruebas correctas.
- Interfaz Electron: 49 pruebas correctas.
- Auditoría de dependencias de producción: 0 vulnerabilidades.
- Verificación real: APKPure 3.20.82 instalado con `Success` usando el ADB interno; Play Store oficial abrió en español y mostró el inicio de sesión.

## Actualización

La actualización se distribuye mediante el flujo firmado de GitHub. XORA puede descargarla desde la aplicación y preguntar si se instala ahora o más tarde.
