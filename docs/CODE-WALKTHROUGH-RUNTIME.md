# Runtime y actualizaciones de XORA

## Fuentes

GitHub es la fuente predeterminada para runtime y actualizaciones. Las URL deben ser HTTPS, pertenecer al repositorio de XORA y coincidir con el artefacto esperado. Los mirrors se usan solo si el usuario los habilita.

## Descarga

El descargador soporta reanudación, rangos HTTP, varias conexiones y verificación SHA-512. Si una respuesta no respeta el rango solicitado, se descarta el fragmento y se repite la descarga completa. No se deja un archivo parcial como si fuera válido.

## Preparación

El provisionador comprueba ADB, emulator, QEMU, la imagen Android 14 `google_apis_playstore/x86_64` y la capacidad de escritura. La imagen puede estar comprimida; se expande de forma atómica y se valida antes de usarla.

## Actualización

El manifiesto firmado contiene producto, versión, plataforma, canal, URL, tamaño y SHA-512. El cliente verifica la firma y el hash antes de aplicar una actualización. Si el reemplazo falla, conserva el paquete anterior y marca el trabajo para recuperación.

## Datos

El runtime base y los datos del usuario están separados. Actualizar XORA no borra aplicaciones, configuraciones ni instantáneas.

