# Sistema de Administración Académica
I.E.P. Sagrado Corazón de Jesús de Chiclayo. Versión corregida para demostración local en Windows x64.

## Abrir el sistema
1. Extrae TODO el ZIP en una carpeta de tu equipo. No ejecutes el iniciador dentro del ZIP.
2. Abre **INICIAR.cmd** con doble clic. Incluye Node.js y las dependencias del servidor.
3. Mantén abierta esa ventana y abre **http://localhost:3000** en el navegador.
4. Para detenerlo, cierra la ventana o presiona Ctrl+C.

No requiere Supabase, instalación de Node.js ni descarga de paquetes para esta demostración. Los iconos y fuentes también se incluyen localmente. El ejecutable incluido es Node.js 24.19.0 para Windows x64; su licencia está en runtime/LICENSE-Node.txt.

| Perfil | Usuario | Contraseña |
|---|---|---|
| Director | director | Director123* |
| Docente | docente | Docente123* |

El primer inicio crea backend/.env con una clave aleatoria de sesión. No compartas ese archivo. La base incluida contiene los datos locales del proyecto. No ejecutes el sembrado sobre tus datos de trabajo: reemplaza su contenido.

## Funciones
- Docente: perfil y fotografía, cursos, horarios, asistencia, incidencias, reportes y mensajes.
- Director: indicadores, incidencias y respuestas, evaluación y alta de docentes, cursos y horarios, mensajes, contactos y documentos UGEL, panel económico.
- Mensajería con lectura del texto completo y marcado de lectura por el destinatario.
- SQLite por defecto y adaptador opcional PostgreSQL.

## Verificación de la entrega
- Compilación de producción de Angular completada.
- 30 pruebas del servidor aprobadas con el ejecutable Node.js incluido.
- Pruebas sobre una base temporal, sin modificar los datos de trabajo.
- Inicio de sesión y consulta de indicadores e incidencias comprobados en el navegador.
- La opción PostgreSQL conserva su adaptador, pero no se ha probado contra una cuenta remota.

Más detalle en docs/CORRECCIONES.md.

## Desarrollo
Para modificar y recompilar la interfaz instala Node.js 24 y npm en el equipo de desarrollo:

    npm run setup
    npm run build
    npm test
    npm start

La interfaz ya compilada está en frontend/dist/frontend/browser. Para iniciar solo el backend incluido:

    runtime\node.exe iniciar.js

Para ejecutar las pruebas con el entorno portable:

    runtime\node.exe --test backend/test/*.test.js

Para desarrollar con recarga, inicia el backend y ejecuta `npm start` dentro de frontend. Su proxy redirige /api y /uploads al puerto 3000. Si cambias PORT, cambia también frontend/proxy.conf.json al desarrollar.

## Base remota opcional
Copia backend/.env.example a backend/.env únicamente si todavía no existe, configura JWT_SECRET, cambia DB_DRIVER a postgres y agrega SUPABASE_DB_URL. Desde backend, `npm run db:migrate` copia la base SQLite a tablas PostgreSQL vacías. Haz una copia de seguridad y utiliza una base de destino propia. La migración se detiene si ya existen datos. La demostración portable no necesita este paso.

## Límites del prototipo
Los mensajes UGEL quedan registrados en la aplicación: no envían correo ni realizan trámites externos. El panel económico es informativo; considera planilla y gastos operativos mensuales, y el balance descuenta esos gastos durante todos los meses del periodo. Cambiar parámetros no modifica los pagos guardados. No incluye cobros en línea.

La ejecución portable escucha únicamente en el equipo local. Para alojarlo públicamente se necesita configurar un entorno de despliegue y sus credenciales.

## Conservación de datos
Guarda una copia de backend/db/academico.db y backend/uploads cuando el servidor esté detenido. Conserva backend/.env para mantener la configuración. Si el puerto 3000 está ocupado, detén la otra instancia o cambia PORT en backend/.env.
