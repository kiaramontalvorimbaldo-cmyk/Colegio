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
}