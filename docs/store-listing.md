# Material de publicación de XORA para Microsoft Store

Documento de referencia para Partner Center. El instalador, el icono y el manifiesto se generan desde el proyecto; la creación del producto y el envío a certificación se completan manualmente.

## Información básica

| Campo | Valor |
|---|---|
| Nombre del producto | `XORA` |
| Categoría | Developer tools → Utilities & tools |
| Precio | Gratis |
| Paquete técnico | `dist/store/XORA_0.6.9.0_x64.msix` |
| Idioma principal | Español |
| Idioma adicional | English (United States) |
| Sitio del proyecto | https://github.com/elx19/xora-emulator |
| Política de privacidad | https://github.com/elx19/xora-emulator/blob/main/docs/privacy.md |
| Soporte | https://github.com/elx19/xora-emulator/issues |

## Novedades de XORA 0.6.9

Android se abre dentro de la misma ventana de XORA por defecto, sin una segunda ventana del emulador. El modo nativo avanzado permanece disponible para diagnóstico y compatibilidad.

Google Play Store ahora muestra su icono oficial multicolor tanto en la Biblioteca como en Complementos de Android.

Google Play Store aparece en la Biblioteca como aplicación incluida y lista para abrir cuando la imagen oficial está preparada. Servicios de Google siguen protegidos como componente del sistema y no se pueden desinstalar accidentalmente.

El cuadro nativo de limpieza de caché ya usa botones en español, incluido el caso singular y plural. También se mantienen las comprobaciones de idioma para que los diagnósticos y notificaciones no expongan texto chino.

### Cambios anteriores

XORA ahora permite que las aplicaciones Android usen el micrófono del equipo. Se añadió el interruptor «Entrada de micrófono» y el diagnóstico puede detectar y reparar una entrada desactivada.

El renderizado prioriza la GPU real del equipo (NVIDIA, AMD o Intel) y cambia automáticamente a un modo compatible si el controlador presenta problemas. También puedes elegir entre sistema, GPU dedicada o GPU integrada.

El diagnóstico de aplicaciones ARM, capas de traducción y detección antiemulador ahora explica la causa con claridad. Se mantienen los perfiles de dispositivo, los modos de consumo, la configuración de mando, teclado, mouse y DPI, además de las actualizaciones incrementales verificadas.

La imagen oficial de Android 14 incluye Google Play Store y los Servicios de Google por defecto para que puedas iniciar sesión y descargar aplicaciones. Google Play Juegos y otros complementos adicionales siguen siendo opcionales.

## Descripción breve

Ejecuta aplicaciones Android en Windows dentro de la ventana principal, con perfiles automáticos y controles configurables.

## Descripción completa

XORA es un emulador Android de escritorio diseñado para ser sencillo, ligero y estable. Importa un APK, elige un perfil adecuado para tu equipo y abre la aplicación en su propia ventana.

Incluye perfiles para PC básica, portátil, PC de alto rendimiento, teléfono, teléfono gaming y tableta. Puedes ajustar el consumo, la resolución, la densidad, los FPS, el mando, el teclado, el mouse y el DPI sin editar archivos técnicos.

El runtime Android y los datos de tus aplicaciones se mantienen separados. Las actualizaciones verifican la firma y el hash del paquete antes de instalarse, y conservan los datos del usuario durante el proceso.

La imagen predeterminada incluye Google Play Store y los Servicios de Google. Google Play Juegos y otros componentes adicionales se ofrecen como complementos opcionales. La distribución de la imagen y cualquier complemento debe cumplir las licencias aplicables.

## Funciones principales

- Importar APK mediante botón o arrastrar y soltar.
- Biblioteca con búsqueda, filtros, instalación, apertura y desinstalación.
- Perfiles automáticos para equipos modestos, portátiles, equipos gaming y dispositivos virtuales.
- Modos de ahorro, equilibrado y máximo rendimiento.
- Telemetría local de CPU, memoria, GPU, temperatura y FPS cuando el runtime expone esos datos.
- Configuración de mando, teclado, mouse, DPI, sensibilidad y bloqueo del cursor.
- Google Play Store y Servicios de Google incluidos en la imagen predeterminada; Play Juegos como complemento opcional.
- Diagnóstico guiado de virtualización, controladores, red, almacenamiento y runtime.
- Actualizaciones firmadas, hash SHA-512 y recuperación ante errores.
- Interfaz, ayuda y notificaciones en español.

## Requisitos del sistema

Windows 10 2004 (compilación 19041) o posterior, 64 bits. Se recomiendan 8 GB de RAM y aproximadamente 4 GB libres para la imagen inicial. La aceleración funciona mejor con Windows Hypervisor Platform habilitado.

## Notas para certificación

XORA es una aplicación de escritorio que ejecuta aplicaciones Android aportadas por el usuario. El runtime se distribuye con el paquete completo o se prepara mediante los canales de actualización del proyecto. La imagen predeterminada usa el paquete oficial `google_apis_playstore`; la publicación de los artefactos queda condicionada al cumplimiento de sus licencias y políticas.

El primer inicio puede tardar mientras prepara archivos locales. La aplicación no necesita una cuenta de XORA para funcionar. Los datos de usuario se guardan en el equipo y no se envían a un servidor de telemetría sin consentimiento explícito.

## Texto opcional en inglés

**Short description**

Run Android apps on Windows inside the main window, with automatic profiles and configurable controls.

**Description**

XORA is a simple, lightweight Android emulator for Windows. Import an APK, choose a device profile and open the app in its own window. Adjust performance, controller mappings, keyboard, mouse, DPI and display settings from one clear interface.

Google Play Store and Google services are included in the default Android image so users can sign in and download apps. Google Play Games and other additional components remain optional. Updates verify the manifest signature and SHA-512 hash before installation.
