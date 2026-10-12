<?php
declare(strict_types=1);

/** Evaluaciones de desempenho del docente (puntaje 1 a 5). */
final class Evaluacion extends ModeloBase
{
    protected string $tabla = 'evaluaciones_docentes';
    protected array $campos = ['docente_id', 'director_id', 'puntaje', 'observaciones', 'fecha'];

    /** Listado de evaluaciones, opcionalmente de un docente. */
    public function listar(?int $docenteId = null): array
    {
        $sql = 'SELECT e.*, ud.nombres, ud.apellidos, dd.especialidad
                FROM evaluaciones_docentes e
                INNER JOIN docentes dd ON dd.id = e.docente_id
                INNER JOIN usuarios  ud ON ud.id = dd.usuario_id
                WHERE 1 = 1';
        $params = [];

        if ($docenteId !== null) {
            $sql .= ' AND e.docente_id = ?';
            $params[] = $docenteId;
        }

        $sql .= ' ORDER BY e.fecha DESC, e.id DESC';

        $stmt = $this->pdo()->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    /** Promedio de puntajes por docente. */
    public function promedios(): array
    {
        $sql = 'SELECT d.id AS docente_id, u.nombres, u.apellidos,
                       COUNT(e.id) AS evaluaciones, ROUND(AVG(e.puntaje), 2) AS promedio
                FROM docentes d
                INNER JOIN usuarios u ON u.id = d.usuario_id
                LEFT  JOIN evaluaciones_docentes e ON e.docente_id = d.id
                GROUP BY d.id, u.nombres, u.apellidos
                ORDER BY promedio DESC, u.apellidos';

        return $this->pdo()->query($sql)->fetchAll();
    }
}