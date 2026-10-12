<?php
declare(strict_types=1);

/**
 * Front controller de la API.
 * Ruta de entrada: /api/{recurso}[/{id}]  ->  ver .htaccess de la raiz.
 * Cualquier error se traduce a una respuesta JSON (nunca HTML con datos internos).
 */

const RUTA_BASE = __DIR__ . '/..';

// La API nunca muestra errores de PHP al navegador: quedan en el log del servidor
ini_set('display_errors', '0');
ini_set('log_errors', '1');
error_reporting(E_ALL);

// Nucleo
require_once RUTA_BASE . '/app/core/Conexion.php';
require_once RUTA_BASE . '/app/core/Respuesta.php';
require_once RUTA_BASE . '/app/core/Router.php';
require_once RUTA_BASE . '/app/core/Auth.php';
require_once RUTA_BASE . '/app/core/ModeloBase.php';
require_once RUTA_BASE . '/app/core/ControladorBase.php';

try {
    // Configuracion: config.php local; si no existe se usa el ejemplo (sin secretos en el repo)
    $rutaConfig = RUTA_BASE . '/app/config/config.php';
    if (!is_file($rutaConfig)) {
        $rutaConfig = RUTA_BASE . '/app/config/config.example.php';
    }
    $config = require $rutaConfig;
    $GLOBALS['CONFIG'] = $config;
    date_default_timezone_set($config['app']['zona_horaria'] ?? 'America/Lima');

    Conexion::inicializar($config['bd']);
    Auth::iniciar([
        'nombre' => $config['sesion']['nombre'] ?? 'SCJSESION',
        'ruta'   => $config['app']['base_url'] ?? '/',
    ]);

    // Carga automatica de modelos y controladores
    spl_autoload_register(static function (string $clase): void {
        foreach (['models', 'controllers'] as $carpeta) {
            $archivo = RUTA_BASE . '/app/' . $carpeta . '/' . $clase . '.php';
            if (is_file($archivo)) {
                require_once $archivo;
                return;
            }
        }
    });

    // Rutas de la API: metodo, ruta, controlador, accion y roles permitidos
    $router = new Router();

    $router->agregar('GET',  'salud',       SaludController::class, 'indice');
    $router->agregar('POST', 'auth/login',  AuthController::class, 'ingresar');
    $router->agregar('POST', 'auth/logout', AuthController::class, 'salir');
    $router->agregar('GET',  'auth/yo',     AuthController::class, 'yo',       ['DOCENTE', 'DIRECTOR']);

    // Diagnostico del middleware de roles (Sprint 2)
    $router->agregar('GET', 'pruebas/permiso-docente',  RolController::class, 'soloDocente',  ['DOCENTE']);
    $router->agregar('GET', 'pruebas/permiso-director', RolController::class, 'soloDirector', ['DIRECTOR']);

    // Modulos del docente (Sprint 3)
    $router->agregar('GET', 'docente/perfil',  DocenteController::class, 'perfil',          ['DOCENTE']);
    $router->agregar('PUT', 'docente/perfil',  DocenteController::class, 'actualizarPerfil', ['DOCENTE']);
    $router->agregar('GET', 'docente/cursos',  DocenteController::class, 'cursos',          ['DOCENTE']);
    $router->agregar('GET', 'docente/horario', DocenteController::class, 'horario',         ['DOCENTE']);

    // Asistencia e incidencias del docente (Sprint 4)
    $router->agregar('GET',  'docente/estudiantes', DocenteController::class,   'estudiantes', ['DOCENTE']);
    $router->agregar('GET',  'docente/reportes',    DocenteController::class,   'reportes',    ['DOCENTE']);
    $router->agregar('GET',  'asistencias',         AsistenciaController::class, 'index',     ['DOCENTE']);
    $router->agregar('POST', 'asistencias',         AsistenciaController::class, 'crear',     ['DOCENTE']);
    $router->agregar('GET',  'incidencias',         IncidenciaController::class,  'index',     ['DOCENTE', 'DIRECTOR']);
    $router->agregar('POST', 'incidencias',         IncidenciaController::class,  'crear',     ['DOCENTE']);
    $router->agregar('PUT',  'incidencias/{id}',    IncidenciaController::class,  'actualizar', ['DIRECTOR']);

    // Modulos de la direccion (Sprint 5)
    $router->agregar('GET',    'director/resumen', DirectorController::class, 'resumen',    ['DIRECTOR']);
    $router->agregar('GET',    'docentes',         DocentesController::class, 'index',      ['DIRECTOR']);
    $router->agregar('POST',   'docentes',         DocentesController::class, 'crear',      ['DIRECTOR']);
    $router->agregar('GET',    'evaluaciones',     EvaluacionController::class, 'index',    ['DIRECTOR']);
    $router->agregar('POST',   'evaluaciones',     EvaluacionController::class, 'crear',    ['DIRECTOR']);
    $router->agregar('GET',    'cursos',           CursoController::class,     'index',    ['DIRECTOR']);
    $router->agregar('POST',   'cursos',           CursoController::class,     'crear',    ['DIRECTOR']);
    $router->agregar('PUT',    'cursos/{id}',      CursoController::class,     'actualizar', ['DIRECTOR']);
    $router->agregar('DELETE', 'cursos/{id}',      CursoController::class,     'borrar',    ['DIRECTOR']);
    $router->agregar('GET',    'horarios',         HorarioController::class,   'index',    ['DIRECTOR']);
    $router->agregar('POST',   'horarios',         HorarioController::class,   'crear',    ['DIRECTOR']);
    $router->agregar('PUT',    'horarios/{id}',    HorarioController::class,   'actualizar', ['DIRECTOR']);
    $router->agregar('DELETE', 'horarios/{id}',    HorarioController::class,   'borrar',    ['DIRECTOR']);

    // Mensajeria entre docentes y direccion
    $router->agregar('GET',  'mensajes', MensajeController::class, 'index', ['DOCENTE', 'DIRECTOR']);
    $router->agregar('POST', 'mensajes', MensajeController::class, 'crear', ['DOCENTE', 'DIRECTOR']);

    // Mensajeria con la UGEL, plantillas y gestion economica (Sprint 6)
    $router->agregar('GET', 'ugel/contactos',          MensajeController::class,   'contactos',   ['DIRECTOR']);
    $router->agregar('GET', 'plantillas',              PlantillaController::class, 'index',       ['DIRECTOR']);
    $router->agregar('GET', 'plantillas/{id}/generar', PlantillaController::class, 'generar',     ['DIRECTOR']);
    $router->agregar('GET', 'economia/resumen',        EconomiaController::class,  'resumen',     ['DIRECTOR']);
    $router->agregar('PUT', 'economia/parametros',     EconomiaController::class,  'parametros',  ['DIRECTOR']);

    $router->despachar();
} catch (Throwable $e) {
    error_log('[API] ' . $e->getMessage() . ' en ' . $e->getFile() . ':' . $e->getLine());
    Respuesta::error('Error interno del servidor', 500);
}