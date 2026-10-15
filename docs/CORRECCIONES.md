# Correcciones y verificación
Fecha: 15 de octubre de 2026.

## Correcciones
1. Se incorporó un selector explícito DB_DRIVER con SQLite por defecto. PostgreSQL conserva un módulo propio; el script de migración apunta explícitamente a ese módulo.
2. Se agregó un adaptador SQLite compatible con los controladores asíncronos. Las operaciones se serializan para evitar que solicitudes ajenas se incorporen a una transacción abierta. Las transacciones revierten sus cambios ante un error.
3. Las incidencias se consultan por ambos perfiles con sus filtros correspondientes. Antes, una ruta exclusiva del docente interceptaba la solicitud del director.
4. Los permisos de dirección y mensajería se aplican a sus rutas concretas, evitando afectar rutas ajenas.
5. Los mensajes dirigidos a docentes resuelven docente.usuario_id. Antes se usaba el identificador del registro docente como si fuera el identificador del usuario.
6. El contador de mensajes no leídos solo cuenta mensajes dirigidos al usuario. Se añadió lectura completa y marcado de lectura autorizado por destinatario.
7. Se validan fechas reales en asistencia, incidencias y evaluaciones y horas de 00:00 a 23:59 en horarios.
8. Las evaluaciones usan una consulta compatible con SQLite y agrupación explícita compatible con PostgreSQL.
9. Se valida que los parámetros económicos sean finitos y el número de estudiantes entero. El balance del periodo descuenta todos sus meses de planilla y gastos.
10. Las contraseñas automáticas usan aleatoriedad criptográfica. Las colisiones de unicidad reciben una respuesta controlada.
11. Los errores de JSON y carga de archivos reciben respuestas comprensibles. Se comprueba la firma y extensión de la imagen, además del límite de 300 KB.
12. La vista de plantillas utiliza el saneamiento de Angular en lugar de omitirlo explícitamente.
13. La interfaz usa rutas relativas, proxy de desarrollo y entrega estática desde Express. Se incluyen fuentes e iconos locales y se evita mostrar una imagen rota cuando no existe foto.
14. Se agregó un iniciador portable para Windows x64, generación local de clave de sesión e instrucciones de uso.
15. El generador de datos de ejemplo de asistencia emplea estudiantes de la sección del curso. La base adjunta original se conserva; no se vuelve a sembrar al iniciar.

## Resultados
30 pruebas automatizadas aprobadas: 3 de conversión SQL y 27 de integración. Cubren autenticación y roles, consultas de ambos perfiles, mensajería y lectura, registro y actualización de asistencia, rechazo de fechas y estudiantes inválidos, rollback con concurrencia, alta de docentes, evaluación, cursos, horarios y cruces, resolución de incidencias, cálculo económico y carga de imágenes.

La interfaz Angular compila en producción. Se verificaron en el navegador el acceso del director, los indicadores y el listado de incidencias. El adaptador PostgreSQL no se validó contra un servidor remoto. Las pruebas no constituyen una certificación de seguridad ni una evaluación de usabilidad con usuarios institucionales.

Comprobación del paquete: se extrajo el ZIP en una carpeta independiente, se generó la configuración inicial y se verificaron el inicio de sesión, la consulta del panel, una ruta Angular y la carga de fuentes locales. También se actualizó el texto obsoleto de inicio del docente para describir los módulos disponibles.

Actualización de presentación: el panel docente describe las funciones disponibles sin avisos de sprints pendientes. La página HTML principal se sirve con Cache-Control: no-store para evitar versiones retenidas al actualizar la compilación. Se volvieron a aprobar las 30 pruebas del servidor y la compilación de Angular.
