# Análisis offline de APK en XORA

XORA analiza un paquete sin ejecutarlo. `src/core/zip.js` lee el contenedor, `axml.js` interpreta el AndroidManifest binario, `arsc.js` resuelve nombres e iconos de recursos y `apk.js` devuelve paquete, versión, actividad, orientación, ABI e icono.

La entrada acepta APK individual y archivos APKS/XAPK. Los paquetes divididos se extraen a una carpeta temporal ASCII, se valida el APK base y después se instalan todos los fragmentos. La carpeta temporal se elimina tanto en éxito como en error.

Las rutas externas no pueden salir del directorio de trabajo, los nombres de paquete se validan antes de formar comandos y ningún metadato del APK se ejecuta como código.

Pruebas relacionadas:

- `test/run-tests.js`: ZIP, PNG y APK sintético.
- `test/library-flow-test.js`: incorporación y actualización de aplicaciones.
- `test/issue-hardening-test.js`: zip-slip, nombres y manifiestos.
- `test/input-latency-test.js`: contrato de entrada de juegos.
