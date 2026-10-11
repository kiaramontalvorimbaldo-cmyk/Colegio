<?php
/**
 * Plantilla de configuracion.
 * Copiar como config.php y ajustar los valores de la BD local.
 * config.php esta en .gitignore: nunca se sube al repositorio.
 */
return [
    'bd' => [
        'host'   => 'localhost',
        'puerto' => 3306,
        'nombre' => 'sagrado_corazon',
        'usuario'=> 'root',
        'clave'  => '',          // en XAMPP suele ir vacia
        'charset'=> 'utf8mb4',
    ],
    'app' => [
        'nombre'      => 'I.E.P. Sagrado Corazon de Jesus',
        'sistema'     => 'Sistema de Administracion Academica',
        'base_url'    => '/sagrado-corazon',
        'zona_horaria'=> 'America/Lima',
    ],
    'sesion' => [
        'nombre' => 'SCJSESION',
        'inactividad_min' => 30,   // cierre de sesion por inactividad
    ],
];