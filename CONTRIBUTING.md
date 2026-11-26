# Guía de contribución

Gracias por contribuir a XORA. El proyecto busca una experiencia Android de escritorio ligera, predecible y fácil de mantener.

## Requisitos

- Windows 10/11 x64 o Linux compatible.
- Node.js 20 o posterior.
- npm.

Instala las dependencias y ejecuta la aplicación:

```powershell
npm install
npm start
```

## Antes de enviar cambios

Ejecuta las pruebas del repositorio:

```powershell
npm test
git diff --check
```

Si el cambio afecta a la interfaz, comprueba también las ventanas principales y revisa que no haya texto sin traducir.

## Organización del código

- `src/ui/`: HTML, CSS, JavaScript de la interfaz, manual e internacionalización.
- `src/core/`: APK, ADB, runtime, perfiles, red, controles y diagnósticos.
- `src/main.js`: ventanas, bandeja, eventos y coordinación del proceso principal.
- `src/preload.js`: canales permitidos entre la interfaz y el proceso principal.
- `test/`: pruebas unitarias, integración, runtime y traducción.
- `docs/`: arquitectura, manual, privacidad y plan de XORA.

## Reglas técnicas

- Mantén la interfaz en español y añade las nuevas cadenas al sistema `i18n`.
- No introduzcas dependencias grandes para resolver una función pequeña si Node.js ya ofrece una alternativa suficiente.
- Las operaciones de archivos, procesos, red y ADB deben pasar por el proceso principal.
- Valida las entradas externas y devuelve errores consistentes.
- No uses `eval`, HTML sin sanitizar ni comandos construidos directamente con datos del usuario.
- No incluyas tokens, contraseñas, claves privadas, binarios del runtime ni datos personales.
- Mantén `contextIsolation` activo y limita los canales expuestos por `preload.js`.
- Los complementos de Google deben mantenerse separados del núcleo de XORA.

## Pruebas de APK

Cuando se disponga de un APK de prueba, se puede indicar mediante una variable de entorno:

```powershell
$env:XORA_TEST_APK = 'C:\ruta\a\una-aplicacion.apk'
npm test
```

Las pruebas que requieren un runtime real deben documentar sus requisitos y no depender de servicios externos durante la ejecución normal de CI.

## Commits y solicitudes de cambio

Usa mensajes breves con formato Conventional Commits:

```text
feat(runtime): añade perfil de teléfono preconfigurado
fix(i18n): traduce avisos dinámicos de diagnóstico
docs: actualiza el esquema de Releases
```

Cada solicitud debe explicar el problema, el cambio realizado y las pruebas ejecutadas. Si modifica la interfaz, incluye una captura antes y después cuando sea útil.
