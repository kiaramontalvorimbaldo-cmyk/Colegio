<?php
declare(strict_types=1);

/**
 * Conexion singleton a MySQL mediante PDO.
 * Una sola instancia por peticion: todas las clases comparten el mismo enlace.
 */
final class Conexion
{
    private static ?PDO $pdo = null;
    private static array $config = [];

    /** Registra la configuracion y abre el enlace una unica vez. */
    public static function inicializar(array $config): void
    {
        self::$config = $config;
        if (self::$pdo instanceof PDO) {
            return; // ya existe la instancia unica
        }

        $nombre = (string)($config['nombre'] ?? '');
        $dsn = sprintf(
            'mysql:host=%s;port=%d;dbname=%s;charset=%s',
            $config['host'] ?? 'localhost',
            (int)($config['puerto'] ?? 3306),
            $nombre,
            $config['charset'] ?? 'utf8mb4'
        );

        self::$pdo = new PDO($dsn, (string)($config['usuario'] ?? 'root'), (string)($config['clave'] ?? ''), [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    }

    /** Devuelve el enlace unico; lanza excepcion si no se inicializo. */
    public static function obtener(): PDO
    {
        if (!self::$pdo instanceof PDO) {
            throw new RuntimeException('La conexion a la base de datos no ha sido inicializada.');
        }
        return self::$pdo;
    }

    public static function estaIniciada(): bool
    {
        return self::$pdo instanceof PDO;
    }

    /** Configuracion vigente de la base de datos. */
    public static function configuracion(): array
    {
        return self::$config;
    }

    /** Identificador del objeto PDO: sirve para demostrar el Singleton. */
    public static function identificador(): int
    {
        return self::$pdo instanceof PDO ? spl_object_id(self::$pdo) : 0;
    }

    public static function nombreBase(): string
    {
        return (string)(self::$config['nombre'] ?? '');
    }

    /** Verifica que la base exista y responde. */
    public static function verificar(): array
    {
        $pdo = self::obtener();
        $pdo->query('SELECT 1');
        return [
            'base_datos'   => $pdo->query('SELECT DATABASE()')->fetchColumn(),
            'servidor'     => $pdo->getAttribute(PDO::ATTR_SERVER_VERSION),
            'conexion_id'  => self::identificador(),
        ];
    }
}