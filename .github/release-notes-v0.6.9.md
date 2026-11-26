# XORA v0.6.9

Esta versión corrige el primer arranque de Android y hace más segura la migración desde instalaciones antiguas.

## Correcciones principales

- Detecta imágenes Google Play `.xz` incompletas aunque el archivo conserve un tamaño preasignado.
- No intenta iniciar el emulador con una imagen dañada; muestra la causa real y evita el error engañoso «No initial system image».
- Migra automáticamente un runtime histórico al runtime oficial de XORA desde GitHub, sin borrar aplicaciones, sesiones ni datos del usuario.
- Mantiene Play Store y los Servicios de Google en la imagen predeterminada de Android 14.
- El botón de actualización descarga, verifica y prepara la actualización dentro de XORA; no requiere descargar manualmente desde el navegador.

## Actualización

La aplicación conserva el runtime, las aplicaciones instaladas y el AVD. Si detecta una imagen incompleta, repara solo el runtime desde la Release oficial y vuelve a comprobarlo antes de iniciar Android.
