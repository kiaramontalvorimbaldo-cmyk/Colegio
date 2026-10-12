<?php
declare(strict_types=1);

/** Modelo de docentes. */
final class Docente extends ModeloBase
{
    protected string $tabla = 'docentes';
    protected array $campos = ['usuario_id', 'dni', 'especialidad', 'sueldo'];

    public function porUsuario(int $usuarioId): ?array
    {
        $stmt = $this->pdo()->prepare('SELECT * FROM docentes WHERE usuario_id = ? LIMIT 1');
        $stmt->execute([$usuarioId]);
        $fila = $stmt->fetch();
        return $fila === false ? null : $fila;
    }

    /** Id del docente asociado al usuario de la sesion (0 si no existe). */
    public function idDeUsuario(int $usuarioId): int
    {
        $fila = $this->porUsuario($usuarioId);
        return $fila === null ? 0 : (int)$fila['id'];
    }

    /** Listado para la direccion: docente + datos de su usuario. */
    public function listar(): array
    {
        $sql = 'SELECT d.*, u.usuario, u.nombres, u.apellidos, u.email, u.telefono, u.activo,
                       (SELECT COUNT(*) FROM cursos c WHERE c.docente_id = d.id) AS cursos
                FROM docentes d
                INNER JOIN usuarios u ON u.id = d.usuario_id
                ORDER BY u.apellidos, u.nombres';

        return $this->pdo()->query($sql)->fetchAll();
    }

    /** Verifica si un nombre de usuario ya existe. */
    public function existeUsuario(string $usuario): bool
    {
        $stmt = $this->pdo()->prepare('SELECT COUNT(*) FROM usuarios WHERE usuario = ?');
        $stmt->execute([$usuario]);
        return (int)$stmt->fetchColumn() > 0;
    }
}