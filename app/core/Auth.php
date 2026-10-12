<?php
declare(strict_types=1);

/**
 * Autenticacion por sesion PHP.
 * Login con password_verify, cierre de sesion y middleware por rol.
 */
final class Auth
{
    /** Abre la sesion con cookie httpOnly y ruta limitada al proyecto. */
    public static function iniciar(array $sesion): void
    {
        if (session_status() === PHP_SESSION_ACTIVE) {
            return;
        }

        session_name($sesion['nombre'] ?? 'SCJSESION');
        session_set_cookie_params([
            'lifetime' => 0,
            'path'     => $sesion['ruta'] ?? '/',
            'domain'   => '',
            'secure'   => false,
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
        session_start();
    }

    /** Verifica credenciales; devuelve el usuario o null. */
    public static function intentar(string $usuario, string $clave, int $inactividad = 30): ?array
    {
        $fila = (new Usuario())->buscarPorNombre(trim($usuario));
        if ($fila === null || (int)$fila['activo'] !== 1) {
            return null;
        }
        if (!password_verify($clave, (string)$fila['password_hash'])) {
            return null;
        }

        session_regenerate_id(true);
        $_SESSION['usuario'] = [
            'id'        => (int)$fila['id'],
            'rol'       => (string)$fila['rol'],
            'usuario'   => (string)$fila['usuario'],
            'nombres'   => (string)$fila['nombres'],
            'apellidos' => (string)$fila['apellidos'],
            'email'     => $fila['email'],
            'telefono'  => $fila['telefono'],
            'foto'      => $fila['foto'],
            'rol_id'    => (int)$fila['rol_id'],
        ];
        $_SESSION['inactividad_min'] = $inactividad;
        $_SESSION['ultima_actividad'] = time();

        return $_SESSION['usuario'];
    }

    public static function haySesion(): bool
    {
        if (!isset($_SESSION['usuario'])) {
            return false;
        }

        $limite = (int)($_SESSION['inactividad_min'] ?? 30) * 60;
        if (time() - (int)($_SESSION['ultima_actividad'] ?? 0) > $limite) {
            self::salir();
            return false;
        }

        $_SESSION['ultima_actividad'] = time();
        return true;
    }

    public static function usuario(): ?array
    {
        return self::haySesion() ? $_SESSION['usuario'] : null;
    }

    public static function id(): int
    {
        return (int)($_SESSION['usuario']['id'] ?? 0);
    }

    public static function rol(): ?string
    {
        return $_SESSION['usuario']['rol'] ?? null;
    }

    public static function esDocente(): bool
    {
        return self::rol() === 'DOCENTE';
    }

    public static function esDirector(): bool
    {
        return self::rol() === 'DIRECTOR';
    }

    public static function salir(): void
    {
        if (session_status() !== PHP_SESSION_ACTIVE) {
            return;
        }

        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $p = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000, $p['path'], $p['domain'], $p['secure'], $p['httponly']);
        }
        session_destroy();
    }

    /** Middleware: 401 sin sesion, 403 si el rol no tiene permiso. */
    public static function exigirRol(string ...$roles): void
    {
        if (!self::haySesion()) {
            Respuesta::error('Debe iniciar sesion', 401);
        }

        if ($roles !== [] && !in_array(self::rol(), $roles, true)) {
            Respuesta::error('Su rol no tiene permiso para esta operacion', 403);
        }
    }
}