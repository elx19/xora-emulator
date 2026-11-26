# Política de privacidad de XORA

Última actualización: 26 de noviembre de 2026

XORA es un emulador Android que se ejecuta localmente. No recopilamos, subimos ni compartimos tus datos personales.

## Datos que no recopilamos

- No solicitamos cuentas, nombres, correos, teléfonos ni otros datos de identidad.
- No recopilamos identificadores del dispositivo, ID publicitario ni ubicación.
- No integramos analítica, telemetría, informes de fallos ni publicidad.
- XORA no tiene un servidor propio para almacenar tus datos.

## Datos guardados en tu equipo

La configuración, las aplicaciones instaladas, los APK, los datos Android y las instantáneas se guardan localmente. La carpeta compartida solo sincroniza los archivos que tú elijas entre Windows y Android.

El runtime y los datos se guardan bajo `%USERPROFILE%\XORA` y la carpeta compartida bajo `%USERPROFILE%\XORAShared`. La imagen oficial de Android se descarga desde los Releases de GitHub cuando el runtime ligero la necesita.

Desinstalar XORA no elimina automáticamente tus datos; puedes borrarlos manualmente desde la configuración o el Explorador de archivos.

## Conexiones de red

- La versión ligera consulta GitHub para descargar el runtime, comprobar actualizaciones y obtener los manifiestos firmados.
- Las aplicaciones Android usan su propia conexión a Internet mediante la red virtual del runtime. XORA no inspecciona ni guarda ese contenido.
- XORA no incluye tokens personales ni envía credenciales a GitHub.

## Google Play

La imagen oficial incluye Google Play Store y Servicios de Google para que puedas iniciar sesión y descargar aplicaciones. XORA no solicita ni almacena tu contraseña de Google; el inicio de sesión ocurre dentro de Android y está sujeto a las políticas de Google.

## Aplicaciones de terceros

Las aplicaciones que ejecutes tienen sus propias políticas de privacidad. XORA no controla sus prácticas ni representa a sus desarrolladores.

## Cambios y contacto

Si actualizamos esta política, cambiaremos la fecha de esta página. Para preguntas o reportes, abre un issue en:

<https://github.com/elx19/xora-emulator/issues>
