# Guía de carga de XORA en Microsoft Store

> Sigue el orden de Partner Center. Los bloques **[Copiar]** se pueden reutilizar y los bloques **[Subir]** se seleccionan desde el equipo.
> La única parte que requiere datos de la cuenta es el paso 2, donde se copian los identificadores reales del publicador.

---

## 0. Comprobaciones previas

- [ ] Existe `dist/store/XORA_0.6.9.0_x64.msix`.
- [ ] La identidad del paquete fue sustituida por los valores reales de Partner Center (el valor local de XORA es provisional).
- [ ] La política de privacidad tiene una URL pública.

---

## 1. Crear el producto

1. Inicia sesión en <https://partner.microsoft.com/dashboard>.
2. Selecciona **Apps and games → New product → MSIX or PWA app**.
3. Nombre del producto: `XORA`.
   - Si está ocupado, usa una variante comercial de XORA; esto no cambia la identidad técnica del paquete.

---

## 2. Obtener la identidad (**importante**)

En **Product management → Product identity**, copia las dos líneas completas:

```
Package/Identity/Name       = XORA.Emulator
Package/Identity/Publisher  = CN=TU-PUBLISHER-DE-PARTNER-CENTER
```

> `XORA.Emulator` y `CN=XORA` son valores locales provisionales. `build/msix.js`
> bloquea la generación si no se proporciona el Publisher real de Partner Center.
> Cuando tengas los valores definitivos, ejecuta:
>
> ```powershell
> node build/msix.js --identity "XORA.Emulator" --publisher "CN=TU-PUBLISHER-DE-PARTNER-CENTER"
> ```

Después de compilar, comprueba que la identidad coincida carácter por carácter, que la versión sea válida y que los recursos coincidan con `build/store-assets`.
**No subas el paquete antes de completar el paso 2**: una identidad provisional será rechazada.
**No subas el paquete antes de completar el paso 2**: una identidad provisional será rechazada.

---

## 3. Packages — Subir

**Packages → Upload package**

- **[Subir]** `dist/store/XORA_0.6.9.0_x64.msix`
- El envío puede tardar entre 5 y 20 minutos según tu conexión; no cierres la página.
- Cuando termine la validación aparecerá «Package accepted».

Errores habituales:
| Error | Causa |
|---|---|
| `0x800B0109` | El Publisher no coincide con la firma; vuelve al paso 2. |
| `0x80080204` | El manifiesto no es válido; recompila con `build/msix.js`. |
| `Invalid package identity name` | `Name` contiene espacios o usa mayúsculas diferentes. |

---

## 4. Store listing — Inglés (idioma predeterminado)

**Short description** (≤100 caracteres) **[Copiar]**
```
Run Android apps on Windows by double-clicking an APK. Each app gets its own window.
```

**Description** **[Copiar]**
Usa el bloque en inglés de la sección 3 de `docs/store-listing.md`.

**Product features** (hasta 20 elementos, uno por línea) **[Copiar]**
```
Double-click an APK to install it — no emulator UI, no setup
Each app gets its own Desktop and Start menu shortcut with its real icon
Apps run in their own window, with full-screen and resizable window mode
Portrait and landscape apps are detected and filled to the correct aspect ratio
Windows Search finds installed Android apps by name
A shared folder syncs both ways between Windows and /sdcard/XORAShared
The full runtime ships in the package — nothing executable is downloaded at runtime
Shell has zero third-party dependencies; the runtime starts on demand and is reclaimed when idle
No virtual network adapter and no kernel driver — Android uses the host connection
Runtime permissions are granted automatically; crashed apps are retried
```

**Screenshots** (al menos una, de 1366×768 o superior) **[Subir]**
1. `docs/store-shots/1-main.png`
2. `docs/store-shots/2-window.png`

**Store logos**: opcional; el paquete MSIX ya contiene los recursos de `Assets/`.

---

## 5. Store listing — Español

Añade **Spanish** en los idiomas del producto y usa los textos de `docs/store-listing.md`.

**Descripción breve** **[Copiar]**
```
Ejecuta aplicaciones Android en Windows al hacer doble clic en un APK: ejecución integrada y configuración sencilla.
```

**Descripción completa** **[Copiar]**
Usa la sección en español de `docs/store-listing.md`.

**Funciones** **[Copiar]**
Usa la lista de funciones de la sección 4 de `docs/store-listing.md`.

**Capturas**: reutiliza las dos imágenes anteriores.

---

## 6. Properties

- **Category**：Developer tools → **Utilities & tools**
- **System requirements** **[Copiar]**
```
Windows 10 version 2004 (build 19041) or later, x64. "Virtual Machine Platform"
(Windows Hypervisor Platform) must be enabled for hardware acceleration.
8 GB RAM recommended; ~4 GB free disk space for the system image.
```
- **Privacy policy URL** **[Copiar]**
  ```
  https://github.com/elx19/xora-emulator/blob/main/docs/privacy.md
  ```
- **Support contact**: tu correo y `https://github.com/elx19/xora-emulator/issues`.

---

## 7. Clasificación por edades (cuestionario IARC)

- La aplicación no incluye contenido propio, pero **puede ejecutar aplicaciones Android de terceros**; marca el acceso a contenido de terceros.
- No incluye contenido generado por usuarios, funciones sociales, ubicación compartida ni compras integradas.
- La clasificación esperada suele ser 3+ / Everyone.

---

## 8. Submission options → Notes for certification **[Copiar]**

Usa la sección 6 de `docs/store-listing.md`. Debe explicar que el emulador y la imagen se distribuyen con el paquete, que no se descargan ejecutables durante la ejecución y que el primer inicio solo prepara archivos locales.

---

## 9. Enviar

**Review and publish → Submit for certification**

- El primer paquete suele tardar entre 1 y 3 días laborables.
- Las causas más comunes de rechazo son capturas que no coinciden con la interfaz, una política de privacidad inaccesible o notas de certificación insuficientes.
