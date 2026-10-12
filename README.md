# Sistema de Administracion Academica - I.E.P. Sagrado Corazon de Jesus (Chiclayo)

Gestion docente y directiva: MVC propio en PHP 8 + API REST JSON + MySQL, frontend HTML5/CSS3/JS (modulos ES).

## Instalacion (XAMPP limpio)
1. Copiar la carpeta a `C:\xampp\htdocs\sagrado-corazon`.
2. Iniciar Apache y MySQL en el panel de XAMPP.
3. En phpMyAdmin, importar en este orden: `database/01_schema.sql` y `database/02_seed.sql`.
4. Copiar `app/config/config.example.php` como `app/config/config.php` y ajustar host, usuario y clave (en XAMPP: root / sin clave).
5. Abrir `http://localhost/sagrado-corazon/` (si su Apache escucha en otro puerto, agreuelo, p. ej. `:8080`).

## Cuentas de prueba
| Perfil | Usuario | Contrasena |
|---|---|---|
| Director | `director` | `Director123*` |
| Docente | `docente` | `Docente123*` |

## Modulos
- **Docente**: perfil y foto, cursos asignados, horario semanal, asistencia por curso y fecha, incidencias, reportes con graficos, mensajeria con la direccion.
- **Director**: panel con indicadores, incidencias (estado y respuesta), evaluacion docente (1-5 con promedio), alta de docentes con credenciales automaticas, CRUD de cursos y horarios con validacion de cruces, mensajeria con docentes y UGEL, plantillas UGEL imprimibles y panel economico.

## Estructura
`app/` (core, models, controllers, config) · `api/index.php` (front controller) · `public/` (login, paneles y assets) · `database/` (SQL + diagrama ER) · `docs/` (evidencias, `api-pruebas.http`).

## Seguridad
Consultas preparadas en toda la API, `password_hash`/`password_verify`, sesiones con `session_regenerate_id`, middleware de roles (401/403), escape de salida en el cliente y en el servidor, y `config.php` excluido del repositorio.

## Versionado
Rama `main`, un commit por sprint, etiqueta `v1.0` en la entrega final.