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

    /** Listado general para la direccion, con estudiante y docente. */
    public function listarTodas(?string $estado = null): array
    {
        $sql = 'SELECT i.*, e.nombres, e.apellidos, e.grado, e.seccion,
                       u.nombres AS docente_nombres, u.apellidos AS docente_apellidos
                FROM incidencias i
                INNER JOIN estudiantes e ON e.id = i.estudiante_id
                INNER JOIN docentes  d ON d.id = i.docente_id
                INNER JOIN usuarios   u ON u.id = d.usuario_id
                WHERE 1 = 1';
        $params = [];

        if ($estado !== null && $estado !== '') {
            $sql .= ' AND i.estado = ?';
            $params[] = $estado;
        }

        $sql .= ' ORDER BY FIELD(i.estado, "pendiente", "en_proceso", "resuelta"), i.fecha DESC';

        $stmt = $this->pdo()->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    /** Conteo global por estado (panel de la direccion). */
    public function conteoGlobal(): array
    {
        return $this->pdo()
            ->query('SELECT estado, COUNT(*) AS total FROM incidencias GROUP BY estado')
            ->fetchAll();
    }

    /** Actualiza estado y respuesta de la direccion sobre una incidencia. */
    public function actualizarEstado(int $id, string $estado, ?string $respuesta, ?string $fechaRespuesta): bool
    {
        $sql = 'UPDATE incidencias SET estado = ?, respuesta_director = ?, fecha_respuesta = ? WHERE id = ?';
        $stmt = $this->pdo()->prepare($sql);
        $stmt->execute([$estado, $respuesta, $fechaRespuesta, $id]);
        return $stmt->rowCount() > 0;
    }
}