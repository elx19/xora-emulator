# Evolución del runtime de XORA

## Decisión actual

XORA usa Android Emulator y QEMU como único runtime. La ventana del emulador se presenta como una ventana nativa para evitar bordes negros, coordenadas desalineadas y el coste de reordenar una ventana OpenGL dentro de Electron.

## Por qué no se añade otro emulador

Integrar otro producto obligaría a distribuir componentes incompatibles, duplicaría procesos y complicaría el soporte. XORA mantiene un único backend, con perfiles de recursos y degradación segura para equipos modestos.

## Posibles líneas futuras

- Mejorar la detección de WHPX, AEHD y controladores gráficos.
- Medir el consumo por aplicación y suspender procesos que no estén en primer plano.
- Añadir más perfiles de dispositivo sin duplicar la imagen Android.
- Mantener una interfaz de backend preparada para pruebas, sin depender de MuMu, BlueStacks, LDPlayer, WSA ni productos de terceros.

La prioridad del producto es que instalar un APK sea simple, verificable y ligero.

