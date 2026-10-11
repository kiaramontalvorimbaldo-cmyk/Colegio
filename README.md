# Sistema de Administracion Academica - I.E.P. Sagrado Corazon de Jesus (Chiclayo)

Gestion docente y directiva (MVC propio en PHP 8 + MySQL, frontend HTML5/CSS3/JS puro).

## Requisitos
- XAMPP 8.x (Apache + MySQL + PHP 8) instalado y panel abierto.
- Navegador Chrome/Edge. Git para el control de versiones.

## Instalacion
1. Copiar la carpeta del proyecto en `C:\xampp\htdocs\sagrado-corazon`.
2. Iniciar Apache y MySQL desde el panel de XAMPP.
3. Crear la base de datos (Sprint 1: `database/01_schema.sql` y `database/02_seed.sql`) en phpMyAdmin e importarlos.
4. Copiar `app/config/config.example.php` como `app/config/config.php` y ajustar host, usuario y clave.
5. Abrir `http://localhost:8080/sagrado-corazon/` (o sin `:8080` si Apache escucha en el puerto 80).

## Credenciales de prueba (creadas en el seed)
| Perfil  | Usuario    | Contrasena    |
|---------|------------|---------------|
| Director | `director` | `Director123*`|
| Docente  | `docente`   | `Docente123*` |

## Estructura
`app/` (core, models, controllers, config) - `api/` (front controller) - `public/` (frontend y assets) - `database/` (SQL) - `docs/` (evidencias).

## Versionado
Rama `main`, un commit por sprint. `config.php` jamas se versiona.