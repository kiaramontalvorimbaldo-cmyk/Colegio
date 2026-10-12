<?php
declare(strict_types=1);

/** Modelo de incidencias disciplinarias y de rendimiento. */
final class Incidencia extends ModeloBase
{
    protected string $tabla = 'incidencias';
    protected array $campos = ['estudiante_id', 'docente_id', 'tipo', 'descripcion', 'fecha', 'estado'];

    public const TIPOS = ['conducta', 'rendimiento', 'asistencia', 'otro'];

    /** Incidencias registradas por un docente, con datos del estudiante. */
    public function porDocente(int $docenteId, ?string $estado = null): array
    {
        $sql = 'SELECT i.*, e.nombres, e.apellidos, e.grado, e.seccion
                FROM incidencias i
                INNER JOIN estudiantes e ON e.id = i.estudiante_id
                WHERE i.docente_id = ?';
        $params = [$docenteId];

        if ($estado !== null && $estado !== '') {
            $sql .= ' AND i.estado = ?';
            $params[] = $estado;
        }

        $sql .= ' ORDER BY i.fecha DESC, i.id DESC';

        $stmt = $this->pdo()->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    /** Conteo por estado para el reporte del docente. */
    public function conteoPorEstado(int $docenteId): array
    {
        $sql = 'SELECT estado, COUNT(*) AS total
                FROM incidencias WHERE docente_id = ?
                GROUP BY estado';

        $stmt = $this->pdo()->prepare($sql);
        $stmt->execute([$docenteId]);
        return $stmt->fetchAll();
    }
}