<?php
declare(strict_types=1);

/** Modelo de usuarios con acceso al nombre de inicio de sesion. */
final class Usuario extends ModeloBase
{
    protected string $tabla = 'usuarios';
    protected array $campos = [
        'rol_id', 'usuario', 'password_hash', 'nombres', 'apellidos',
        'email', 'telefono', 'foto', 'activo',
    ];

    /** Une roles para conocer el perfil con el que se inicia sesion. */
    public function buscarPorNombre(string $usuario): ?array
    {
        $sql = 'SELECT u.*, r.nombre AS rol
                FROM usuarios u
                INNER JOIN roles r ON r.id = u.rol_id
                WHERE u.usuario = ?
                LIMIT 1';

        $stmt = $this->pdo()->prepare($sql);
        $stmt->execute([$usuario]);

        $fila = $stmt->fetch();
        return $fila === false ? null : $fila;
    }

    public function porId(int $id): ?array
    {
        $sql = 'SELECT u.*, r.nombre AS rol
                FROM usuarios u
                INNER JOIN roles r ON r.id = u.rol_id
                WHERE u.id = ?
                LIMIT 1';

        $stmt = $this->pdo()->prepare($sql);
        $stmt->execute([$id]);

        $fila = $stmt->fetch();
        return $fila === false ? null : $fila;
    }

    /** Usuarios activos de un perfil (por ejemplo la direccion). */
    public function porRol(string $rol): array
    {
        $sql = 'SELECT u.*, r.nombre AS rol
                FROM usuarios u
                INNER JOIN roles r ON r.id = u.rol_id
                WHERE r.nombre = ? AND u.activo = 1
                ORDER BY u.id';

        $stmt = $this->pdo()->prepare($sql);
        $stmt->execute([$rol]);
        return $stmt->fetchAll();
    }
}