<?php
declare(strict_types=1);

/** POST /api/auth/login · POST /api/auth/logout · GET /api/auth/yo */
final class AuthController
{
    private const ROLES = ['DOCENTE', 'DIRECTOR'];

    public function ingresar(): never
    {
        $datos = $this->entrada();
        $usuario = trim((string)($datos['usuario'] ?? ''));
        $clave   = (string)($datos['clave'] ?? '');

        if ($usuario === '' || $clave === '') {
            Respuesta::error('Usuario y contrasena son obligatorios', 400);
        }

        $fila = Auth::intentar($usuario, $clave, $this->minutosInactividad());
        if ($fila === null) {
            Respuesta::error('Usuario o contrasena incorrectos', 400);
        }

        if (!in_array($fila['rol'], self::ROLES, true)) {
            Auth::salir();
            Respuesta::error('Su cuenta no tiene un perfil habilitado', 403);
        }

        unset($fila['password_hash']);

        Respuesta::json([
            'id'        => $fila['id'],
            'usuario'   => $fila['usuario'],
            'nombres'   => $fila['nombres'],
            'apellidos' => $fila['apellidos'],
            'email'     => $fila['email'],
            'telefono'  => $fila['telefono'],
            'foto'      => $fila['foto'],
            'rol'       => $fila['rol'],
        ], 'Sesion iniciada');
    }

    public function salir(): never
    {
        Auth::salir();
        Respuesta::json(null, 'Sesion cerrada');
    }

    public function yo(): never
    {
        Auth::exigirRol(...self::ROLES);
        Respuesta::json(Auth::usuario(), 'Sesion activa');
    }

    private function minutosInactividad(): int
    {
        return (int)($GLOBALS['CONFIG']['sesion']['inactividad_min'] ?? 30);
    }

    private function entrada(): array
    {
        $json = json_decode(file_get_contents('php://input') ?: '', true);
        return is_array($json) ? $json : $_POST;
    }
}