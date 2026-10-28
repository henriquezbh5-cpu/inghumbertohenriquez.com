# RELOJ: guía de la demostración automática

Esta presentación utiliza datos de ejemplo y pantallas ilustrativas. No conecta fuentes reales ni publica un tablero real.

## Tres recorridos

- **Cierre completo:** SQL Server, SharePoint, API y Excel aportan 10 filas. Se elimina un duplicado; quedan 9 registros y un importe de ejemplo de 5200.
- **Fuente sin respuesta:** se muestra el bloqueo de la publicación cuando falta una fuente. Un total parcial no se presenta como cierre completo.
- **Recuperación:** la fuente vuelve a estar disponible, se validan los datos y se muestra el cierre completo.

Los pasos avanzan solos. Puede pausar, reproducir, repetir o pasar a otro escenario. Al ocultar la pestaña o sacar la demostración de la pantalla, se suspende el avance. Con movimiento reducido o ahorro de datos se presenta un resultado estático.

## Código de la presentación

- `/laboratorio/auto-scenes.js`: escenarios, datos y estados preparados.
- `/laboratorio/auto-player.js`: secuencia, pausa y reproducción.
- `/laboratorio/auto-preview.js`: vistas ilustrativas del tablero y los datos.

Los cambios visibles pertenecen al guion de la demostración. Una implementación real necesita accesos, conectores, reglas de calidad y pruebas con los sistemas de la organización.
