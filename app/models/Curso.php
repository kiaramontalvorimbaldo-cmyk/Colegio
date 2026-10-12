<?php
declare(strict_types=1);

/** Modelo de cursos con su resumen horario y de matricula. */
final class Curso extends ModeloBase
{
    protected string $tabla = 'cursos';
    protected array $campos = ['nombre', 'grado', 'seccion', 'periodo', 'docente_id'];

    /** Cursos asignados a un docente (solo los suyos). */
    public function porDocente(int $docenteId): array
    {
        $sql = 'SELECT c.*,
                       u.nombres   AS docente_nombres,
                       u.apellidos AS docente_apellidos,
                       (SELECT COUNT(*) FROM horarios h WHERE h.curso_id = c.id) AS horas_semana,
                       (SELECT COUNT(*) FROM estudiantes e
                          WHERE e.grado = c.grado AND e.seccion = c.seccion) AS estudiantes
                FROM cursos c
                INNER JOIN docentes d ON d.id = c.docente_id
                INNER JOIN usuarios  u ON u.id = d.usuario_id
                WHERE c.docente_id = ?
                ORDER BY c.grado, c.seccion';

        $stmt = $this->pdo()->prepare($sql);
        $stmt->execute([$docenteId]);
        return $stmt->fetchAll();
    }

    public function conDocente(int $id): ?array
    {
        $sql = 'SELECT c.*, u.nombres AS docente_nombres, u.apellidos AS docente_apellidos
                FROM cursos c
                INNER JOIN docentes d ON d.id = c.docente_id
                INNER JOIN usuarios  u ON u.id = d.usuario_id
                WHERE c.id = ? LIMIT 1';

        $stmt = $this->pdo()->prepare($sql);
        $stmt->execute([$id]);
        $fila = $stmt->fetch();
        return $fila === false ? null : $fila;
    }
}