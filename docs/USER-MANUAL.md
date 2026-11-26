# XORA — Manual de uso y solución de problemas

> Versión: v0.6.10 · Plataforma: Windows 10/11 x64 · Actualizado: 2026-11-26
>
> XORA ejecuta aplicaciones Android dentro de su ventana principal por defecto. Importa un APK, deja que el runtime se prepare y abre la aplicación con doble clic. Esta guía explica el uso diario, el rendimiento, los controles y las soluciones más habituales.

---

## Índice

1. [XORA en 30 segundos](#xora-en-30-segundos)
2. [Instalación y primer inicio](#instalación-y-primer-inicio)
3. [Uso diario](#uso-diario)
4. [Conceptos principales](#conceptos-principales)
5. [Comprobación del equipo y diagnóstico](#comprobación-del-equipo-y-diagnóstico)
6. [Soluciones habituales](#soluciones-habituales)
   - [6.1 Aceleración de hardware](#61-aceleración-de-hardware-y-arranque-lento)
   - [6.2 Fallos de instalación](#62-fallos-de-instalación)
   - [6.3 Aplicaciones ARM y detección del emulador](#63-aplicaciones-arm-y-detección-del-emulador)
   - [6.4 Autorización ADB](#64-autorización-adb)
   - [6.5 XORA no abre una aplicación](#65-xora-no-abre-una-aplicación)
   - [6.6 Tabla rápida de fallos](#66-tabla-rápida-de-fallos)
   - [6.7 La aplicación no tiene sonido](#67-la-aplicación-no-tiene-sonido)
   - [6.8 Fallo de inicio de la versión de Microsoft Store](#68-fallo-de-inicio-de-la-versión-de-microsoft-store)
   - [6.9 El micrófono no está disponible](#69-el-micrófono-no-está-disponible)
   - [6.10 Preferencia de GPU](#610-preferencia-de-gpu)
7. [Referencia de comandos](#referencia-de-comandos)
8. [Datos y carpetas](#datos-y-carpetas)
9. [Ayuda y comentarios](#ayuda-y-comentarios)

---

## 1. XORA en 30 segundos

```text
Icono de una aplicación en el escritorio
          │ doble clic
          ▼
XORA.exe --launch <paquete>
          │ si Android está detenido, XORA inicia el runtime
          ▼
La aplicación se abre usando la actividad que declara el sistema
          ▼
Ventana Android independiente con tamaño, orientación e icono propios
```

Características principales:

- Instala uno o varios APK desde la ventana, mediante arrastrar y soltar o desde el Explorador de archivos.
- Genera accesos directos con el icono de cada aplicación.
- Mantiene un único runtime Android para iniciar las aplicaciones siguientes con mayor rapidez.
- Incluye perfiles para PC básica, portátil, PC de alto rendimiento, teléfono y tableta.
- La imagen Android predeterminada incluye Google Play Store y Servicios de Google. Google Play Juegos es opcional.
- No depende de MuMu, BlueStacks, LDPlayer, WSA ni de otro emulador instalado en el equipo.

---

## 2. Instalación y primer inicio

### 2.1 Elige la edición adecuada

Descarga XORA desde el repositorio privado y el canal oficial configurado en la aplicación. Comprueba que el nombre del producto sea XORA y que el manifiesto de actualización sea válido.

| Edición | Archivo | Uso recomendado |
|---|---|---|
| Microsoft Store | `XORA_<versión>_x64.msix` | Instalación integrada y actualizaciones de la Store. |
| Instalador | `XORA-v*-Setup.exe` | Accesos directos, menú Inicio y desinstalador. |
| Portátil completa | `XORA-v*-win64-full.zip` | Uso sin descargar el runtime durante el primer inicio. |
| Portátil ligera | `XORA-v*-win64-portable.zip` | Probar la interfaz; prepara el runtime al iniciarse. |

### 2.2 Qué ocurre la primera vez

1. XORA comprueba la virtualización, la GPU, la memoria, el almacenamiento y los componentes del runtime.
2. La edición ligera descarga o la edición completa expande Android Emulator, ADB y la imagen oficial de Android 14 `google_apis_playstore` x86_64.
3. Se crea una partición de datos independiente para conservar aplicaciones, sesiones y configuraciones.
4. El runtime inicia Android y comprueba que el sistema y el gestor de paquetes estén listos.
5. Google Play Store y Servicios de Google quedan disponibles en la imagen predeterminada. Al abrir Play Store puedes iniciar sesión con tu cuenta de Google.

El primer arranque puede tardar más que los siguientes porque crea los datos y prepara el snapshot. No cierres XORA mientras el asistente indique que está trabajando.

### 2.3 Requisitos prácticos

- Windows 10 2004 o posterior, 64 bits.
- 4 GB de RAM como mínimo; se recomiendan 8 GB o más.
- Al menos 4 GB libres para una instalación básica y más espacio si se instalarán juegos grandes.
- Virtualización activada en BIOS/UEFI y Windows Hypervisor Platform o AEHD cuando el equipo lo permita.
- Controlador gráfico actualizado. XORA puede usar GPU integrada, dedicada o el modo elegido por Windows.

---

## 3. Uso diario

### 3.1 Instalar una aplicación

Puedes usar cualquiera de estas opciones:

- Arrastra un archivo `.apk` a XORA.
- Pulsa **Instalar APK** y selecciona el archivo.
- Registra la asociación `.apk` en Configuración → Integración y archivos y abre el APK desde el Explorador.
- Usa la opción de instalación múltiple para paquetes compatibles `.apks` o `.xapk`.

XORA valida el paquete, la firma, la arquitectura y el espacio disponible antes de enviarlo al runtime. Si la aplicación es ARM, consulta la sección 6.3.

### 3.2 Abrir, detener y desinstalar

En **Biblioteca**, busca una aplicación y usa **Abrir**, **Detener**, **Desinstalar**, **Reparar** o **Crear acceso directo**. Una aplicación recién instalada se marca en la biblioteca y el contador se actualiza sin reiniciar XORA.

### 3.3 Ventana y orientación

- **Ventana vertical:** permite cambiar el tamaño y conserva el tamaño de cada aplicación.
- **Pantalla completa:** llena la pantalla y mantiene la proporción de Android.
- **Seguir la aplicación:** adapta la orientación a la declaración de la aplicación.
- **Forzar vertical u horizontal:** usa la opción correspondiente en Configuración → Pantalla y ventanas.
- **Rotar:** usa el botón de la barra de la aplicación o `Ctrl+Alt+R`.
- **Pantalla completa:** usa `F11` o el menú de la bandeja.

Si la aplicación solicita una orientación distinta, XORA puede reiniciar el runtime una vez para aplicar el panel correcto. Las siguientes aplicaciones con la misma orientación no necesitan repetir el cambio.

### 3.4 Archivos compartidos

La carpeta de Windows `%USERPROFILE%\XORAShared` se sincroniza con `/sdcard/XORAShared` cuando la integración de archivos está activa. Configuración → Integración y archivos permite cambiar la carpeta, sincronizar ahora y abrirla.

### 3.5 Google Play y cuenta de Google

Google Play Store y Servicios de Google vienen incluidos en la imagen predeterminada. Abre Play Store desde Android, inicia sesión y descarga tus aplicaciones. XORA no solicita ni guarda tu contraseña de Google.

Google Play Juegos, aplicaciones de Google adicionales y paquetes de reparación se gestionan por separado en **Complementos**. No instales APK de fuentes desconocidas ni reemplaces un servicio del sistema que ya funcione.

### 3.6 Manual integrado y tutoriales automáticos

Abre el manual con el botón **Ayuda** o desde Configuración → Actualizaciones y acerca de. El diagnóstico puede abrir automáticamente el capítulo relacionado con el problema. También puedes usar el botón **Tutorial** de cada resultado de diagnóstico.

---

## 4. Conceptos principales

### 4.1 Runtime e imagen del sistema

El runtime contiene Android Emulator, ADB, el sistema Android y los componentes gráficos. La partición de datos se mantiene separada, por lo que actualizar la imagen no debe borrar tus aplicaciones.

La imagen predeterminada es Android 14 x86_64 con Google Play Store, Servicios de Google y una capa de compatibilidad para aplicaciones ARM. El tamaño del runtime puede ser grande, pero se descarga una sola vez y se reutiliza.

### 4.2 Aceleración y renderizado

Con virtualización y aceleración gráfica, XORA usa menos CPU y arranca más rápido. El modo automático prioriza `host` para NVIDIA, AMD e Intel y cambia a una alternativa compatible si el controlador falla.

En Configuración → Rendimiento y recursos puedes elegir sistema predeterminado, GPU dedicada o GPU integrada. Si el cambio no se aplica inmediatamente, reinicia Android.

### 4.3 Compatibilidad ARM y antiemulador

Android x86_64 usa la capa de traducción incluida para ejecutar bibliotecas ARM. Si una aplicación exige funciones de hardware, integridad o antiemulador, puede negarse a ejecutarse aunque el runtime funcione correctamente. Ese caso es una restricción de la aplicación, no necesariamente un fallo de XORA.

---

## 5. Comprobación del equipo y diagnóstico

### 5.1 Diagnóstico inicial

Ve a Configuración → Diagnóstico y reparación y pulsa **Comprobar**. XORA revisa:

- Virtualización, Hypervisor Platform y AEHD.
- GPU, controlador, memoria y temperatura.
- ADB, Android Emulator, imagen del sistema y partición de datos.
- Red del runtime, DNS, almacenamiento y archivos compartidos.
- Estado de Play Store y Servicios de Google cuando la imagen está lista.

El resultado diferencia entre correcto, advertencia, error y estado desconocido. Un dato que no se puede comprobar no se presenta como correcto de forma artificial.

### 5.2 Diagnóstico automático

El diagnóstico automático revisa el equipo periódicamente. Puede encontrar autorización ADB pendiente, procesos huérfanos, bloqueos, snapshot inválido, disco lleno, conflicto de orientación, red desconectada, sonido desactivado o micrófono bloqueado.

Cada resultado incluye una explicación, un botón de reparación cuando es seguro y un enlace al capítulo correspondiente de este manual.

### 5.3 Informe de diagnóstico

Pulsa **Exportar informe de diagnóstico** para generar un archivo de texto. El informe incluye versiones, configuración técnica, parámetros de arranque y errores recientes, pero excluye contraseñas y tokens.

---

## 6. Soluciones habituales

### 6.1 Aceleración de hardware y arranque lento

Si aparece una advertencia de emulación por software:

1. Abre Configuración → Diagnóstico y reparación.
2. Comprueba si la virtualización aparece desactivada.
3. Activa Intel VT-x o AMD SVM en BIOS/UEFI si es necesario.
4. En Windows activa Windows Hypervisor Platform y reinicia.
5. Ejecuta de nuevo la comprobación y aplica la configuración recomendada.

Sin aceleración XORA todavía puede iniciar Android, pero el arranque, los juegos y la respuesta gráfica serán más lentos. No fuerces la GPU si el diagnóstico informa que el controlador se cierra.

### 6.2 Fallos de instalación

- `INSTALL_FAILED_INSUFFICIENT_STORAGE`: libera espacio en la partición de datos o aumenta su tamaño.
- `INSTALL_FAILED_VERSION_DOWNGRADE`: desinstala la versión superior o instala una versión más reciente.
- `INSTALL_PARSE_FAILED_*`: verifica que el APK esté completo y firmado.
- `INSTALL_FAILED_NO_MATCHING_ABIS`: la aplicación usa una arquitectura no disponible; continúa con 6.3.
- Firma incompatible: desinstala la versión anterior solo si puedes perder sus datos.

No desactives la validación del paquete ni instales un APK modificado para saltarte un error de firma.

### 6.3 Aplicaciones ARM y detección del emulador

Si la aplicación se cierra con `NO_MATCHING_ABIS`, `DoBadTrampoline`, `libndk_translation` o errores de integridad:

1. Confirma que el runtime use la imagen oficial Android 14 `google_apis_playstore`.
2. Reinicia Android para que la capa de traducción se cargue desde el inicio.
3. Ejecuta el diagnóstico y repara la imagen si el archivo está incompleto.
4. Si la aplicación detecta un emulador, revisa sus requisitos de seguridad o contacta con el desarrollador.

Una comprobación antiemulador o anti depuración puede bloquear una aplicación deliberadamente. Cambiar de imagen no siempre lo resuelve y puede borrar la sesión si se restablecen los datos.

### 6.4 Autorización ADB

Si el diagnóstico muestra **Android sin autorización**:

1. Mira la ventana de Android y pulsa **Permitir** en el aviso de depuración USB.
2. Marca **Permitir siempre desde este equipo**.
3. Si el aviso no aparece, reinicia el runtime.
4. Como último recurso, restablece los datos de Android desde Configuración. Esto elimina las aplicaciones instaladas dentro del runtime.

No borres manualmente las claves de Windows como primera medida: puede impedir que Android reconozca una autorización anterior.

### 6.5 XORA no abre una aplicación

Comprueba que el runtime esté listo, que la aplicación aparezca en Biblioteca y que exista espacio libre. Después:

- Detén la aplicación y vuelve a abrirla.
- Ejecuta Diagnóstico y reparación.
- Revisa orientación, snapshot y aceleración.
- Usa Reparar para reinstalar la aplicación conservando la biblioteca.
- Exporta el informe si el problema se repite.

### 6.6 Tabla rápida de fallos

| Síntoma | Acción recomendada |
|---|---|
| Ventana negra | Comprueba GPU, controlador y aceleración. |
| Arranque detenido | Espera el primer inicio; luego revisa ADB y snapshot. |
| Android sin red | Ejecuta Reparar red y revisa VPN o firewall. |
| Disco lleno | Limpia archivos recuperables o aumenta la partición. |
| Aplicación sin teclado | Activa Mapeo de teclado y revisa el perfil. |
| Mando sin respuesta | Comprueba que Windows lo detecte y vuelve a Detectar mando. |
| Play Store no abre | Confirma que la imagen sea `google_apis_playstore` y que la fecha/hora sean correctas. |

### 6.7 La aplicación no tiene sonido

1. Comprueba que el volumen de Android no esté en silencio.
2. Revisa Configuración → Rendimiento y recursos → Sonido.
3. Comprueba que el servicio de audio de Windows esté en ejecución.
4. Reinicia el runtime después de cambiar el audio.

El sonido y el micrófono son controles independientes. XORA solo usa `-no-audio` cuando ambos están desactivados.

### 6.8 Fallo de inicio de la versión de Microsoft Store

El código `0xC0000135` indica que un proceso no pudo cargar una DLL. **No significa automáticamente que falte VC++, que el antivirus haya borrado un archivo o que debas reinstalar todo.**

1. Ejecuta Diagnóstico y reparación.
2. Revisa la arquitectura x64, las dependencias del paquete y el registro de Windows.
3. Si la instalación es de Microsoft Store, usa Reparar o Restablecer desde Configuración de Windows.
4. Si el problema continúa, exporta el informe y conserva el código exacto.

### 6.9 El micrófono no está disponible

1. Abre Configuración → Rendimiento y recursos.
2. Activa **Entrada de micrófono**.
3. Comprueba los permisos de micrófono de Windows para XORA.
4. Selecciona un dispositivo de entrada predeterminado en Windows.
5. Reinicia Android y ejecuta el diagnóstico.

La configuración predeterminada mantiene el micrófono habilitado. Desactivarlo ahorra recursos, pero impide llamadas, dictado y grabación.

### 6.10 Preferencia de GPU

En Configuración → Rendimiento y recursos selecciona **Sistema predeterminado**, **GPU dedicada** o **GPU integrada**. Windows guarda la preferencia por proceso. El cambio puede requerir reiniciar Android y no puede superar una limitación del controlador.

---

## 7. Referencia de comandos

Los accesos directos usan el ejecutable instalado de XORA. Los ejemplos siguientes son orientativos:

```text
XORA.exe <ruta\aplicacion.apk>
XORA.exe --launch <nombre.del.paquete>
XORA.exe --diagnostics
```

No ejecutes comandos con rutas recibidas de terceros sin comprobarlas. Para las operaciones normales, usa la interfaz y el proceso principal validado de XORA.

---

## 8. Datos y carpetas

- Datos de XORA: `%APPDATA%\xora` o la carpeta de datos indicada por la instalación.
- Aplicaciones y metadatos: subcarpetas administradas por XORA, no las edites manualmente.
- Runtime: componentes Android y la imagen del sistema.
- Datos de Android: aplicaciones, sesiones, caché y snapshots.
- Carpeta compartida: `%USERPROFILE%\XORAShared`.
- Informes y registros: accesibles desde Diagnóstico y reparación.

No borres la carpeta de datos mientras Android esté ejecutándose. Usa las acciones de limpieza de XORA para conservar los archivos necesarios y proteger las aplicaciones.

---

## 9. Ayuda y comentarios

Antes de solicitar ayuda, ejecuta el diagnóstico y adjunta el informe sin contraseñas ni tokens. Indica la versión de XORA, la edición instalada, el perfil activo, el modelo de GPU y el código de error exacto.

El canal de soporte y las notas de versión se encuentran en el repositorio oficial de XORA. Las actualizaciones válidas se verifican mediante firma RSA-SHA256 y hash SHA-512 antes de instalarse.
