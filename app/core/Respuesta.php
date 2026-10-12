<?php
declare(strict_types=1);

/** Envoltura de las respuestas JSON de la API: {ok, datos, mensaje}. */
final class Respuesta
{
    public static function json(mixed $datos = null, string $mensaje = '', int $codigo = 200): never
    {
        self::enviar($datos, $mensaje, $codigo);
    }

    public static function creado(mixed $datos = null, string $mensaje = 'Recurso creado'): never
    {
        self::enviar($datos, $mensaje, 201);
    }

    public static function error(string $mensaje, int $codigo = 400, mixed $datos = null): never
    {
        self::enviar($datos, $mensaje, $codigo);
    }

    private static function enviar(mixed $datos, string $mensaje, int $codigo): never
    {
        if (!headers_sent()) {
            http_response_code($codigo);
            header('Content-Type: application/json; charset=utf-8');
            header('X-Content-Type-Options: nosniff');
        }

        echo json_encode(
            ['ok' => $codigo < 400, 'datos' => $datos, 'mensaje' => $mensaje],
            JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
        );
        exit;
    }
}