# Guía de paquete MSIX de XORA

Esta guía describe cómo preparar el paquete de Microsoft Store. El nombre visible y técnico del producto es **XORA**.

## Identidad

| Campo | Valor local provisional |
|---|---|
| Product name | `XORA` |
| Package identity name | `XORA.Emulator` |
| Publisher | `CN=XORA` (provisional) |
| Artefacto | `dist/store/XORA_0.6.6.0_x64.msix` |

El Publisher real debe copiarse desde Partner Center. `build/msix.js` bloquea el paquete si se intenta publicar con el Publisher provisional.

## Preparar la versión portátil

```powershell
node build/pack.js
```

El runtime y los datos de usuario permanecen separados para que una actualización no borre aplicaciones ni configuraciones.

## Generar el paquete MSIX

```powershell
node build/msix.js --identity "XORA.Emulator" --publisher "CN=TU-PUBLISHER-DE-PARTNER-CENTER"
```

El paquete final debe aparecer en:

```text
dist/store/XORA_0.6.6.0_x64.msix
```

El script valida la versión de cuatro componentes, la identidad del manifiesto, los recursos gráficos y la estructura del paquete.

## Firma local de prueba

La firma de prueba solo sirve para instalar el paquete en un equipo de desarrollo. No uses certificados de prueba para Microsoft Store.

```powershell
signtool sign /fd SHA256 /a /f dist\store\XORA-test.pfx /p "CONTRASEÑA-DE-PRUEBA" dist\store\XORA_0.6.6.0_x64.msix
Add-AppxPackage -Path dist\store\XORA_0.6.6.0_x64.msix
```

## Datos del runtime

- Versión portátil: `%APPDATA%\XORA\runtime`.
- Versión MSIX: `%USERPROFILE%\XORA\data`.
- Aplicaciones, snapshots y ajustes: dentro de la carpeta de datos del usuario.
- Google Play Store y Servicios de Google: incluidos y verificados en la imagen oficial predeterminada. Play Juegos queda como complemento opcional.

La primera ejecución puede expandir la imagen local y tardar más que los siguientes arranques. La imagen oficial contiene Play Store y Servicios de Google; cualquier paquete adicional debe respetar sus licencias aplicables.

## Publicación

1. Abre Partner Center y crea o selecciona el producto `XORA`.
2. Copia el `Package Identity Name` y el `Publisher` reales.
3. Regenera el paquete usando esos valores.
4. Sube `dist/store/XORA_0.6.6.0_x64.msix`.
5. Usa las descripciones de [store-listing.md](store-listing.md).

Antes de publicar, comprueba la política de privacidad, los requisitos del sistema, las capturas y la firma comercial.
