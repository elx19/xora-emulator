# Comprobación previa de XORA

Antes del primer arranque, XORA revisa CPU, memoria, disco, virtualización, GPU, controlador gráfico, red y permisos de micrófono. El resultado se transforma en un perfil seguro.

## Ajustes automáticos

- memoria y núcleos respetando un margen para Windows;
- GPU host cuando la aceleración y el controlador son compatibles;
- software como respaldo cuando no hay virtualización;
- resolución menor en equipos modestos;
- prioridad equilibrada y suspensión de procesos en segundo plano.

## Límites

La aplicación no puede activar una opción de BIOS ni instalar un controlador del kernel sin autorización. En la versión de Microsoft Store muestra la guía de Windows; en la versión instalable ofrece la acción elevada cuando el usuario la confirma.

La comprobación no borra datos, aplicaciones ni snapshots. Los cambios se guardan en el perfil de XORA y se aplican al siguiente arranque.

