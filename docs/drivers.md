# Controladores de compatibilidad de XORA

Un controlador es un archivo JSON que aplica parámetros seguros a una combinación concreta de GPU, memoria, versión del runtime y aceleración. No ejecuta código y solo puede modificar claves incluidas en la lista blanca.

## Ubicación

- Configuración → Diagnóstico y reparación → Abrir directorio de controladores: ajustes del usuario.
- `src/drivers/`: ejemplos incluidos, desactivados por defecto.

Los archivos del usuario tienen prioridad sobre los ejemplos con el mismo identificador. La importación valida formato, identificador, coincidencias, efectos, tamaño y ausencia de rutas peligrosas.

## Efectos permitidos

- backend de GPU y bloqueo de TCG;
- argumentos seguros del emulator;
- claves concretas de `config.ini`;
- variables `ANDROID_`, `QEMU_`, `LIBGL_`, `MESA_` y `EMUGL_`.

No se permiten `-wipe-data`, cambios de ruta, tamaño de partición, ejecución de comandos, saltos de directorio ni valores con saltos de línea.

## Flujo

1. Exporta la plantilla del equipo.
2. Ajusta solo el efecto necesario.
3. Valida e importa el JSON.
4. Activa el controlador desde Diagnóstico.
5. Reinicia Android y comprueba el resultado.

