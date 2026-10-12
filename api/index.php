<?php
declare(strict_types=1);

/**
 * Front controller de la API.
 * Ruta de entrada: /api/{recurso}[/{id}]  ->  ver .htaccess de la raiz.
 */

const RUTA_BASE = __DIR__ . '/..';

// Nucleo
require_once RUTA_BASE . '/app/core/Conexion.php';
require_once RUTA_BASE . '/app/core/Respuesta.php';
require_once RUTA_BASE . '/app/core/Router.php';
require_once RUTA_BASE . '/app/core/Auth.php';
require_once RUTA_BASE . '/app/core/ModeloBase.php';
require_once RUTA_BASE . '/app/core/ControladorBase.php';

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
$router->despachar();