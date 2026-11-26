# XORA v0.6.11

Esta actualización mejora el arranque, la conexión y las actualizaciones de XORA.

## Cambios principales

- El indicador de estado muestra la conexión a Internet del PC, la señal y una medición aproximada de velocidad.
- Android usa la conexión de red del PC mediante la red virtual del runtime.
- Si ADB pierde temporalmente el dispositivo al abrir una aplicación, XORA espera, reconecta y reinicia el enlace una vez antes de mostrar un error.
- El mensaje `device ... not found` ya no expone comandos técnicos ni texto sin traducir.
- Las actualizaciones se descargan y preparan desde XORA. Antes de instalarse muestran las opciones **Instalar ahora** o **Más tarde**.
- Se conserva el runtime, Play Store, Servicios de Google, aplicaciones instaladas y datos del usuario durante la actualización.

La actualización se verifica mediante el manifiesto firmado de XORA y se obtiene desde la Release oficial de GitHub.
