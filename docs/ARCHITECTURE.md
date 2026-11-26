# Arquitectura de XORA

## Capas

```text
Interfaz HTML/CSS/JS
        │ contextBridge
Proceso principal Electron
        │
Núcleo XORA: APK · ADB · runtime · ventanas · actualizaciones
        │
Android Emulator + QEMU + imagen oficial Android 14
```

La interfaz nunca ejecuta comandos del sistema directamente. Los procesos, archivos, red y ADB pasan por el proceso principal, que valida las entradas y limita los canales expuestos por `preload.js`.

## Flujo de instalación

1. El usuario selecciona, arrastra o abre un APK, APKS o XAPK.
2. XORA valida la extensión, analiza el manifiesto y extrae el icono sin ejecutar el paquete.
3. Se comprueba el espacio disponible y se prepara el runtime Android.
4. ADB instala el paquete; los paquetes divididos se envían con `install-multiple`.
5. La biblioteca guarda el paquete, la versión, el icono y el acceso directo.
6. La aplicación se inicia usando la actividad Launcher detectada, no una cadena introducida por el usuario.

## Flujo de ejecución

El runtime se inicia una sola vez y se mantiene preparado mientras haya una aplicación activa. Al abrir otra aplicación, XORA detiene procesos de usuario que ya no son necesarios, ajusta la prioridad del runtime y conecta su ventana nativa. Al cerrar la última ventana, se limpian procesos y sincronización sin borrar los datos.

## Rendimiento

- La imagen base es Android 14 x86_64 con Google Play Store, Servicios de Google y traducción ARM.
- El modo Ahorro limita memoria, núcleos y resolución; Equilibrado reserva recursos para Windows; Máximo rendimiento prioriza la aplicación.
- La aceleración usa WHPX o AEHD cuando están disponibles y deja software como respaldo.
- El runtime ligero se descarga desde GitHub, se verifica con SHA-512 y se reutiliza.
- Las instantáneas de inicio rápido reducen el tiempo del siguiente arranque; se pueden desactivar para ahorrar espacio.

## Seguridad y datos

La asociación de archivos se registra solo para el usuario actual. Las rutas, nombres de paquetes, argumentos ADB y manifiestos externos se validan. No se ejecutan datos del usuario mediante `eval`, no se guardan credenciales de Google y los tokens de actualización no se incrustan en el instalador.
