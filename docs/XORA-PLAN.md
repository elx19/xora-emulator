# XORA — plan maestro del emulador y esquema de actualizaciones

**Nombre del producto:** XORA  
**Descripción:** emulador Android de escritorio ligero, fluido y sencillo de configurar.  
**Estado:** implementación funcional completada sobre la base técnica de ApkStart 0.6.4; quedan validaciones externas de publicación y hardware.
**Repositorio objetivo:** privado en GitHub; la confirmación de privacidad y protección de `main` queda como tarea administrativa.

## Estado de implementación

- [x] Identidad visual XORA en la interfaz, splash, shell y recursos de distribución.
- [x] Icono oficial integrado en tamaños de ventana, bandeja, ICO, Linux y tienda.
- [x] Catálogo existente conservado con sustitución de marca a XORA sin reescribir toda la UI.
- [x] Actualizador, provisionador y fuentes apuntando al repositorio `elx19/xora-emulator`.
- [x] Perfiles de dispositivo: catálogo integrado, recomendación automática, aplicación y JSON validado.
- [x] Módulo de rendimiento: modos de ahorro, equilibrado y máximo rendimiento con opciones persistentes.
- [x] Panel inicial de controles: mando, asignaciones, teclado, mouse, DPI y perfiles guardados.
- [x] Integración de mapeos por aplicación, eventos de mando compatibles y mediciones en vivo del runtime.
- [x] Ajustes avanzados del runtime expuestos en módulos dedicados.
- [x] Complementos opcionales de Google Play y Servicios de Google con instalación aportada por el usuario.
- [x] Contrato de manifiesto firmado, canales de actualización, hash y estado de rollback.
- [x] Secreto `XORA_UPDATE_PRIVATE_KEY` configurado en GitHub Actions; falta ejecutar una Release real para validarlo de extremo a extremo.
- [ ] Ejecutar una publicación final en GitHub y comprobar una actualización firmada de extremo a extremo.

## 1. Objetivo del producto

XORA debe permitir ejecutar aplicaciones Android en una computadora con una configuración mínima y entendible. La prioridad es ofrecer una experiencia fluida usando pocos recursos, con perfiles automáticos para distintos equipos y controles preparados para juegos.

XORA será la aplicación principal. Google Play, Google Play Juegos y los Servicios de Google serán complementos opcionales e instalables por separado. La aplicación debe funcionar sin esos complementos cuando la aplicación Android no los necesite.

### Principios

- Fluidez antes que cantidad de funciones.
- Bajo consumo de CPU, GPU y memoria.
- Configuración automática con posibilidad de ajuste manual.
- Interfaz clara en español y preparada para más idiomas.
- Aislamiento entre la aplicación, el runtime Android y los complementos.
- Actualizaciones verificadas, reversibles y controladas por canales.
- Sin credenciales de GitHub embebidas en el instalador.

## 2. Módulos del producto

### 2.1 Inicio

- Botón principal para iniciar y detener Android.
- Estado del runtime: detenido, iniciando, activo, detenido con error.
- Resumen de CPU, memoria, GPU, temperatura y FPS objetivo.
- Acceso directo al perfil recomendado.
- Estado de complementos sin afirmar que están activos si no están instalados.

### 2.2 Biblioteca de aplicaciones

- Importar APK mediante botón, arrastrar y soltar o asociación de archivos.
- Lista de aplicaciones instaladas con búsqueda y filtros.
- Abrir, detener, desinstalar, reparar y crear acceso directo.
- Metadatos locales: nombre, paquete, versión, tamaño y fecha de instalación.
- Validación del archivo antes de instalarlo.

### 2.3 Runtime Android

- Preparación y arranque del runtime.
- Detención limpia y recuperación después de un cierre inesperado.
- Persistencia de datos de usuario separada del runtime base.
- Control de resolución, orientación, densidad y aceleración.
- Registro de eventos técnicos sin guardar datos personales innecesarios.

### 2.4 Perfiles de dispositivo

**Avance implementado:** los seis perfiles iniciales ya tienen contrato validado, recomendación según memoria/núcleos, aplicación mediante IPC seguro y persistencia del perfil activo. La interfaz permite seleccionar, aplicar, importar y exportar perfiles JSON. El ajuste por aplicación se cubre mediante el contrato de controles y los mapeos persistidos en el proceso principal.

Perfiles iniciales:

- PC básica.
- Portátil.
- PC de alto rendimiento.
- Teléfono preconfigurado.
- Teléfono gaming.
- Tableta.
- Perfil personalizado.

Cada perfil define memoria, número de núcleos, resolución, DPI, densidad, límite de FPS, orientación y nivel de compatibilidad. El perfil debe poder exportarse e importarse como JSON validado.

### 2.5 Rendimiento y bajo consumo

**Avance implementado:** la interfaz permite elegir Ahorro, Equilibrado o Máximo rendimiento y guardar aceleración, procesos en segundo plano, suspensión y ajuste automático. Cuando Android está activo, el monitor consulta CPU, memoria, GPU disponible, temperatura y FPS; si un dato no existe en la imagen, se muestra “Sin dato” en lugar de inventar una medición.

- Modos Ahorro, Equilibrado y Máximo rendimiento.
- Detección de aceleración de hardware disponible.
- Límite configurable de CPU, GPU, memoria y FPS.
- Suspensión al minimizar.
- Reducción de procesos en segundo plano.
- Monitor de temperatura y advertencias de sobrecarga.
- Aplicación automática de la configuración recomendada.

### 2.6 Configuración de mando

**Avance implementado:** el módulo detecta mandos compatibles mediante Gamepad API, ofrece asignaciones rápidas, perfiles FPS/MOBA/Productividad y guarda DPI, sensibilidad, bloqueo de cursor y mapeo de teclado. Las asignaciones por aplicación se validan y persisten en el proceso principal; no se instala un controlador adicional.

- Detección de mandos compatibles mediante XInput y APIs disponibles.
- Perfiles General, Acción, Carreras y Personalizado.
- Asignación de botones, sticks, gatillos y vibración.
- Prueba visual de botones.
- Guardado por aplicación o por perfil de dispositivo.
- Restablecimiento seguro de la configuración.

### 2.7 Teclado, mouse y DPI

- Asignación de teclas para juegos y aplicaciones.
- Editor visual de WASD, acciones, atajos y combinaciones.
- Bloqueo y liberación del cursor.
- Sensibilidad del mouse y DPI seleccionable.
- Perfiles FPS, MOBA, Productividad y Personalizado.
- Persistencia por aplicación.

### 2.8 Complementos de Google

- Catálogo separado de complementos disponibles.
- Google Play Store.
- Google Play Juegos.
- Servicios de Google.
- Estado explícito: no instalado, disponible para instalar, instalado, actualización disponible o error.
- Comprobación de compatibilidad antes de instalar.
- Reparación y desinstalación del complemento sin borrar la biblioteca del usuario.
- Aviso de licencias y requisitos de cuenta.

XORA no debe mostrar “Google Play listo”, “Servicios activos” o “Conectado” si el complemento correspondiente no está instalado y verificado.

La implementación no descarga ni redistribuye APK de Google. El usuario aporta un APK compatible y con licencia; XORA comprueba el paquete, registra la versión y el hash SHA-256, instala en Android y permite reparar o desinstalar sin borrar la biblioteca.

### 2.9 Archivos e integración con el sistema

- Carpetas de datos, compartida, intercambio y respaldos.
- Asociación opcional de archivos `.apk`.
- Accesos directos de aplicaciones.
- Importación y exportación de perfiles.
- Copia de seguridad y restauración de la configuración.
- Rutas visibles y modificables por el usuario.

### 2.10 Red

- Estado de conectividad del runtime.
- Configuración de red aislada o compartida.
- Diagnóstico de DNS, puertos y conexión local.
- Opción de no exponer servicios del runtime fuera de la computadora.
- Avisos claros antes de habilitar ADB o puertos de depuración.

### 2.11 Diagnóstico y reparación

- Comprobación de virtualización y aceleración.
- Detección de controlador gráfico.
- Comprobación de memoria y almacenamiento.
- Diagnóstico del runtime y de complementos.
- Registro técnico exportable con datos sensibles excluidos.
- Soluciones guiadas y botón de reparación automática.
- Modo seguro para iniciar con una configuración mínima.

### 2.12 Notificaciones y bandeja del sistema

- Inicio, detención, instalación, actualización y errores.
- Notificaciones accionables con “Ver detalles” y “Resolver”.
- Icono de bandeja con menú Inicio, Pausar, Diagnóstico, Configuración y Salir.
- No mostrar texto nativo sin traducir.
- No enviar telemetría sin consentimiento explícito.

### 2.13 Ayuda y documentación

- Manual de instalación y primer inicio.
- Guía de perfiles y rendimiento.
- Guía de mando, teclado, mouse y DPI.
- Preguntas frecuentes.
- Códigos de error explicados.
- Información de versión y licencias.

### 2.14 Actualizaciones y acerca de

- Versión instalada, canal y fecha de la última comprobación.
- Canales estable, beta y desarrollo.
- Notas de versión en español.
- Comprobación manual y automática configurable.
- Descarga, verificación, instalación y reversión.
- Opción para posponer una actualización no crítica.

El cliente acepta únicamente manifiestos `schemaVersion: 1` del producto `xora`, con canal y plataforma compatibles, URL HTTPS permitida, firma RSA-SHA256 y hash SHA-512 del artefacto. Las publicaciones sin manifiesto firmado se abren para descarga manual y no ejecutan un instalador automáticamente.

## 3. Arquitectura propuesta

```text
Interfaz XORA (renderer)
        │ contrato interno validado
        ▼
Proceso principal Electron
        ├── gestor de ventanas y bandeja
        ├── gestor de perfiles
        ├── gestor de aplicaciones APK
        ├── gestor de complementos
        ├── gestor de actualizaciones
        └── diagnóstico y registros
        │
        ▼
Servicio Runtime Android
        ├── imagen base
        ├── datos del usuario
        ├── control de recursos
        ├── red y ADB
        └── integración de controles
```

La interfaz no debe ejecutar comandos del sistema directamente. Toda operación que afecte archivos, procesos, red o instalación debe pasar por el proceso principal, validar sus argumentos y devolver errores estructurados.

## 4. Contratos internos importantes

Los módulos deben comunicarse con contratos estables y extensibles. Los estados deben usar valores enumerados y respuestas predecibles.

### Estado de complemento

```json
{
  "id": "google-play-services",
  "name": "Servicios de Google",
  "state": "not_installed",
  "version": null,
  "compatible": true,
  "actions": ["install"]
}
```

Estados permitidos: `not_installed`, `available`, `installing`, `installed`, `update_available`, `repair_required`, `failed`.

### Manifiesto de actualización

```json
{
  "schemaVersion": 1,
  "product": "xora",
  "version": "0.7.0",
  "channel": "stable",
  "platform": "win32-x64",
  "minimumVersion": "0.6.4",
  "mandatory": false,
  "asset": "XORA-Setup-0.7.0.exe",
  "sha512": "<hash-del-archivo>",
  "signature": "<firma-del-manifiesto>",
  "releaseNotes": "<url-de-notas>"
}
```

## 5. Esquema de actualizaciones con GitHub

### Repositorio

- Repositorio privado de GitHub para el código fuente, workflows y artefactos de XORA.
- Ramas protegidas: `main` para estable y `develop` para integración.
- Tags semánticos: `v0.7.0`, `v0.7.1`, etc.
- Releases separados por plataforma y arquitectura.

### Flujo de publicación

1. Se crea una rama de trabajo.
2. Se ejecutan pruebas, comprobación de fuentes y auditoría de dependencias.
3. Se genera el instalador y el paquete del runtime correspondiente.
4. Se calcula el hash SHA-512 de cada artefacto.
5. Se firma el manifiesto y, cuando corresponda, el instalador.
6. GitHub Actions publica una Release privada con notas y artefactos.
7. El canal seleccionado recibe la versión.
8. XORA descarga el manifiesto, verifica producto, plataforma, versión, hash y firma.
9. La actualización se instala de forma atómica.
10. Se inicia una comprobación posterior; si falla, se revierte a la versión anterior.

### Seguridad del actualizador

- Nunca incluir un token personal de GitHub dentro de XORA.
- No ejecutar un instalador si falla el hash o la firma.
- No aceptar URLs de descarga arbitrarias desde una respuesta no validada.
- Usar HTTPS y una lista de hosts permitidos.
- Guardar una copia de la versión anterior hasta completar la comprobación.
- Registrar versión, resultado y código de error, sin guardar tokens.
- Para instalaciones privadas, usar un mecanismo de distribución autenticado o un servicio intermediario controlado; el cliente no debe contener credenciales reutilizables.

### Canales

- **Estable:** versiones probadas para uso normal.
- **Beta:** funciones nuevas con riesgo controlado.
- **Desarrollo:** pruebas internas; no recomendado para usuarios finales.

## 6. Fases de desarrollo

### Fase 0 — Base y repositorio

- [x] Confirmar que `xora-emulator` esté configurado como repositorio privado.
- [x] Subir la base actual sin binarios pesados ni secretos.
- [x] Añadir este plan y reglas de contribución.
- [x] Revisar nombre, versión, licencia y metadatos del producto.
- [ ] Proteger `main` y confirmar la configuración de CI desde GitHub (GitHub Free no permite reglas de protección en repositorios privados; requiere GitHub Pro o hacer público el repositorio).

### Fase 1 — Identidad y shell

- [x] Cambiar la identidad visible de ApkStart a XORA.
- [x] Consolidar navegación y diseño sobrio.
- [x] Completar traducciones y eliminar textos nativos visibles restantes.
- [x] Definir temas, iconos y estados accesibles.

### Fase 2 — Runtime y perfiles

- [x] Separar runtime base, datos de usuario y complementos.
- [x] Implementar perfiles de PC, teléfono y tableta.
- [x] Validar y persistir perfiles personalizados en JSON.
- [x] Añadir detección automática y validación de recursos.

### Fase 3 — Rendimiento

- [x] Implementar modos de consumo.
- [x] Medir arranque, memoria, FPS, temperatura y cierre cuando el runtime expone el dato.
- [x] Añadir suspensión al minimizar y recuperación segura.

### Fase 4 — Juegos y controles

- [x] Mando compatible y perfiles por juego.
- [x] Teclado, mouse, bloqueo de cursor y DPI.
- [x] Validación y persistencia de perfiles por aplicación.
- [ ] Medición de latencia en hardware real por modelo de mando.

### Fase 5 — Complementos de Google

- [x] Catálogo de complementos.
- [x] Instalación, reparación y desinstalación aisladas.
- [x] Validación de compatibilidad y estados correctos.
- [x] Avisos de licencia y cuenta.

### Fase 6 — Actualizaciones

- [x] Manifiesto versionado.
- [x] GitHub Actions de pruebas y empaquetado existentes.
- [x] Firma, hash, canales, descarga y rollback lógico.
- [ ] Prueba con una Release privada real y configuración del secreto de firma antes de activar publicaciones automáticas.

### Fase 7 — Calidad y distribución

- [x] Contratos y pruebas automatizadas para PC básica, portátil y PC de alto rendimiento.
- [x] Pruebas de instalación limpia, actualización dañada y reversión de aplicación.
- [x] Auditoría de dependencias y bloqueo de secretos/binarios pesados en el repositorio.
- [ ] Validación final en hardware físico y publicación de instaladores firmados.

## 7. Criterios de aceptación

- XORA puede iniciar y detener Android sin dejar procesos huérfanos.
- Una aplicación APK puede instalarse, abrirse, cerrarse y desinstalarse.
- Los perfiles se aplican sin borrar datos del usuario.
- El modo equilibrado mantiene un consumo razonable en equipos modestos.
- Mando, teclado, mouse y DPI se pueden configurar y guardar.
- Google Play y sus servicios se muestran como complementos opcionales.
- Toda la interfaz visible está traducida al español.
- Una actualización válida se instala y una actualización dañada se rechaza.
- Una actualización fallida permite volver a la versión anterior.
- No hay secretos, tokens ni binarios de runtime pesados en el repositorio.

## 8. Decisiones pendientes

- Runtime Android base y licencia de la imagen.
- Requisitos mínimos oficiales de CPU, RAM, GPU y almacenamiento.
- Plataformas iniciales: Windows solamente o Windows y Linux.
- Canal de distribución autenticado para Releases privadas.
- Método de firma de instaladores y custodio de las claves.
- Alcance exacto de los complementos de Google y sus licencias.
- Nombre legal, icono final y dominio del proyecto.

