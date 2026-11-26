# Material de publicación de XORA para Microsoft Store

Documento de referencia para Partner Center. El instalador, el icono y el manifiesto se generan desde el proyecto; la creación del producto y el envío a certificación se completan manualmente.

## Información básica

| Campo | Valor |
|---|---|
| Nombre del producto | `XORA` |
| Categoría | Developer tools → Utilities & tools |
| Precio | Gratis |
| Paquete técnico | `dist/store/XORA_0.6.4.0_x64.msix` |
| Idioma principal | Español |
| Idioma adicional | English (United States) |
| Sitio del proyecto | https://github.com/elx19/xora-emulator |
| Política de privacidad | https://github.com/elx19/xora-emulator/blob/main/docs/privacy.md |
| Soporte | https://github.com/elx19/xora-emulator/issues |

## Novedades de XORA 0.6.4

XORA ahora permite que las aplicaciones Android usen el micrófono del equipo. Se añadió el interruptor «Entrada de micrófono» y el diagnóstico puede detectar y reparar una entrada desactivada.

El renderizado prioriza la GPU real del equipo (NVIDIA, AMD o Intel) y cambia automáticamente a un modo compatible si el controlador presenta problemas. También puedes elegir entre sistema, GPU dedicada o GPU integrada.

El diagnóstico de aplicaciones ARM, capas de traducción y detección antiemulador ahora explica la causa con claridad. Se mantienen los perfiles de dispositivo, los modos de consumo, la configuración de mando, teclado, mouse y DPI, además de las actualizaciones incrementales verificadas.

Google Play, Google Play Juegos y los Servicios de Google son complementos opcionales. XORA funciona sin ellos y no los activa ni redistribuye por defecto.

## Descripción breve

Ejecuta aplicaciones Android en Windows con ventanas independientes, perfiles automáticos y controles configurables.

## Descripción completa

XORA es un emulador Android de escritorio diseñado para ser sencillo, ligero y estable. Importa un APK, elige un perfil adecuado para tu equipo y abre la aplicación en su propia ventana.

Incluye perfiles para PC básica, portátil, PC de alto rendimiento, teléfono, teléfono gaming y tableta. Puedes ajustar el consumo, la resolución, la densidad, los FPS, el mando, el teclado, el mouse y el DPI sin editar archivos técnicos.

El runtime Android y los datos de tus aplicaciones se mantienen separados. Las actualizaciones verifican la firma y el hash del paquete antes de instalarse, y conservan los datos del usuario durante el proceso.

Google Play, Google Play Juegos y los Servicios de Google se ofrecen como complementos opcionales. XORA funciona sin ellos cuando una aplicación no los necesita. La instalación de complementos requiere archivos aportados por el usuario y compatibles con su licencia.

## Funciones principales

- Importar APK mediante botón o arrastrar y soltar.
- Biblioteca con búsqueda, filtros, instalación, apertura y desinstalación.
- Perfiles automáticos para equipos modestos, portátiles, equipos gaming y dispositivos virtuales.
- Modos de ahorro, equilibrado y máximo rendimiento.
- Telemetría local de CPU, memoria, GPU, temperatura y FPS cuando el runtime expone esos datos.
- Configuración de mando, teclado, mouse, DPI, sensibilidad y bloqueo del cursor.
- Complementos opcionales para Google Play y Servicios de Google.
- Diagnóstico guiado de virtualización, controladores, red, almacenamiento y runtime.
- Actualizaciones firmadas, hash SHA-512 y recuperación ante errores.
- Interfaz, ayuda y notificaciones en español.

## Requisitos del sistema

Windows 10 2004 (compilación 19041) o posterior, 64 bits. Se recomiendan 8 GB de RAM y aproximadamente 4 GB libres para la imagen inicial. La aceleración funciona mejor con Windows Hypervisor Platform habilitado.

## Notas para certificación

XORA es una aplicación de escritorio que ejecuta aplicaciones Android aportadas por el usuario. El runtime se distribuye con el paquete completo o se prepara mediante los canales de actualización del proyecto. XORA no activa Google Play por defecto ni redistribuye APK propietarios de Google.

El primer inicio puede tardar mientras prepara archivos locales. La aplicación no necesita una cuenta de XORA para funcionar. Los datos de usuario se guardan en el equipo y no se envían a un servidor de telemetría sin consentimiento explícito.

## Texto opcional en inglés

**Short description**

Run Android apps on Windows with independent windows, automatic profiles and configurable controls.

**Description**

XORA is a simple, lightweight Android emulator for Windows. Import an APK, choose a device profile and open the app in its own window. Adjust performance, controller mappings, keyboard, mouse, DPI and display settings from one clear interface.

Google Play and Google services are optional add-ons. XORA works without them and does not enable or redistribute them by default. Updates verify the manifest signature and SHA-512 hash before installation.
