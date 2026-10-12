<?php
declare(strict_types=1);

/**
 * Rutas de diagnostico del Sprint 2: demuestran el middleware exigirRol().
 * Un perfil que llama a la ruta del otro perfil recibe 403.
 */
final class RolController
{
    public function soloDocente(): never
    {
        Auth::exigirRol('DOCENTE');
        Respuesta::json([
            'ruta'    => 'pruebas/permiso-docente',
            'rol'     => Auth::rol(),
            'usuario' => Auth::usuario()['usuario'] ?? '',
        ], 'Acceso permitido: ruta exclusiva del docente');
    }

    public function soloDirector(): never
    {
        Auth::exigirRol('DIRECTOR');
        Respuesta::json([
            'ruta'    => 'pruebas/permiso-director',
            'rol'     => Auth::rol(),
            'usuario' => Auth::usuario()['usuario'] ?? '',
        ], 'Acceso permitido: ruta exclusiva del director');
    }
}