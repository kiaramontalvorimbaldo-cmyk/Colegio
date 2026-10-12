<?php
declare(strict_types=1);

/** Modelo de estudiantes (solo datos sembrados, sin modulo de matricula). */
final class Estudiante extends ModeloBase
{
    protected string $tabla = 'estudiantes';
    protected array $campos = ['dni', 'nombres', 'apellidos', 'grado', 'seccion'];

    /** Estudiantes de los cursos asignados a un docente (sin repetir). */
    public function porDocente(int $docenteId): array
    {
        $sql = 'SELECT DISTINCT e.id, e.dni, e.nombres, e.apellidos, e.grado, e.seccion
                FROM estudiantes e
                INNER JOIN cursos c ON c.grado = e.grado AND c.seccion = e.seccion
                WHERE c.docente_id = ?
                ORDER BY e.grado, e.seccion, e.apellidos, e.nombres';

        $stmt = $this->pdo()->prepare($sql);
        $stmt->execute([$docenteId]);
        return $stmt->fetchAll();
    }
}