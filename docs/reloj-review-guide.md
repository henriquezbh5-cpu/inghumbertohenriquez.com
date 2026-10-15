# RELOJ: guía de revisión técnica

Demostración propia de Humberto Henríquez. Actualización: 15 de octubre de 2026.

## Qué se puede evaluar

RELOJ representa el cierre de cuatro fuentes con distinta antigüedad. Se ejecuta en el navegador con datos sintéticos y semilla fija. Permite comparar la política de frescura y validación antes de publicar un resultado.

- Caso y límites: https://inghumbertohenriquez.com/proyectos/consolidacion-datos/
- Demostración: https://inghumbertohenriquez.com/laboratorio/#reloj
- Código del escenario: https://inghumbertohenriquez.com/laboratorio/sys/reloj.js
- Utilidades compartidas: https://inghumbertohenriquez.com/laboratorio/lab-core.js

El código enlazado es el que sirve el sitio. No es un repositorio completo de una integración empresarial. No requiere claves ni datos de clientes para probar la demostración.

## Recorrido reproducible

1. Abre RELOJ y ejecuta la configuración inicial. Revisa la antigüedad por fuente, la tabla de orígenes y el resultado final.
2. Reduce el umbral de frescura y selecciona «No aceptar». Cuando una fuente excede el umbral, el escenario se detiene en ese origen y no publica.
3. Selecciona «Aceptar con marca», activa «Simular servicio caído» y conserva «Detener si la validación falla». La fuente diferida queda visible y el escenario se detiene en validación.
4. Desactiva esa detención y repite. La publicación continúa con avisos; revisa qué información de frescura acompaña el resultado.
5. Compara con «Aceptar en silencio». Esa opción representa el riesgo de ocultar la antigüedad y no constituye una recomendación operativa.

## Decisiones que conviene discutir

- **Frescura por origen:** un total no basta para describir la actualidad de sus componentes.
- **Política y estado separados:** el estado de la fuente y la autorización de publicar son decisiones distintas.
- **Avisos explícitos:** el texto debe permitir evaluar el dato diferido sin depender solo del color.
- **Base sintética reproducible:** la semilla permite repetir un escenario sin exponer información de terceros.

La representación agrupa 42 controles por familias; no ejecuta 42 consultas externas. Los tiempos y cantidades son parte del escenario, no una medición de rendimiento ni un ahorro observado.

## Qué haría falta para una implementación real

Contratos de datos, conectores reales, autenticación y secretos protegidos, persistencia de ejecuciones, idempotencia, controles de acceso, pruebas de recuperación y observabilidad. El tratamiento de datos y las reglas de publicación se acordarían con el equipo responsable. Esta demostración no acredita esos componentes en producción.

## Contacto

Perfil y condiciones: https://inghumbertohenriquez.com/colaboracion/

Servicios mediante Optimatiza; oportunidades laborales en contacto directo con Humberto. No se publica capacidad inmediata ni un plazo de entrega fijo.
