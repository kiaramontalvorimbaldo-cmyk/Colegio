<?php
declare(strict_types=1);

/** Modelo de asistencias por curso y fecha (clave unica curso+estudiante+fecha). */
final class Asistencia extends ModeloBase
{
    protected string $tabla = 'asistencias';
    protected array $campos = ['curso_id', 'estudiante_id', 'fecha', 'estado', 'registrado_por'];

    public const ESTADOS = ['presente', 'tardanza', 'falta', 'justificada'];

    /**
     * Estudiantes del curso con su estado del dia (LEFT JOIN sobre la fecha).
     */
    public function porCursoYFecha(int $cursoId, string $grado, string $seccion, string $fecha): array
    {
        $sql = 'SELECT e.id, e.dni, e.nombres, e.apellidos,
                       a.id AS asistencia_id, IFNULL(a.estado, "pendiente") AS estado
                FROM estudiantes e
                LEFT JOIN asistencias a
                       ON a.estudiante_id = e.id AND a.curso_id = ? AND a.fecha = ?
                WHERE e.grado = ? AND e.seccion = ?
                ORDER BY e.apellidos, e.nombres';

        $stmt = $this->pdo()->prepare($sql);
        $stmt->execute([$cursoId, $fecha, $grado, $seccion]);
        return $stmt->fetchAll();
    }

    /**
     * Guarda la lista masiva: inserta o actualiza segun la clave unica.
     */
    public function guardarMasivo(int $cursoId, string $fecha, array $registros, int $usuarioId): int
    {
        $sql = 'INSERT INTO asistencias (curso_id, estudiante_id, fecha, estado, registrado_por)
                VALUES (?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE estado = VALUES(estado), registrado_por = VALUES(registrado_por)';

        $stmt = $this->pdo()->prepare($sql);
        $guardados = 0;

        foreach ($registros as $registro) {
            $stmt->execute([
                $cursoId,
                (int)$registro['estudiante_id'],
                $fecha,
                $registro['estado'],
                $usuarioId,
            ]);
            $guardados++;
        }
        return $guardados;
    }

    /** Porcentaje de asistencia por curso del docente. */
    public function resumenPorCurso(int $docenteId): array
    {
        $sql = 'SELECT c.id, c.nombre, c.grado, c.seccion,
                       COUNT(a.id) AS registros,
                       SUM(a.estado = "presente") AS presentes,
                       SUM(a.estado = "tardanza") AS tardanzas,
                       SUM(a.estado = "falta") AS faltas,
                       SUM(a.estado = "justificada") AS justificadas
                FROM cursos c
                LEFT JOIN asistencias a ON a.curso_id = c.id
                WHERE c.docente_id = ?
                GROUP BY c.id, c.nombre, c.grado, c.seccion
                ORDER BY c.grado, c.seccion';

        $stmt = $this->pdo()->prepare($sql);
        $stmt->execute([$docenteId]);

        $filas = $stmt->fetchAll();

        foreach ($filas as $i => $fila) {
            $registros = (int)$fila['registros'];
            $presentes = (int)$fila['presentes'];
            $tardanzas = (int)$fila['tardanzas'];

            // La tardanza cuenta como asistencia parcial (0.5)
            $efectivas = $presentes + $tardanzas * 0.5;
            $filas[$i]['porcentaje'] = $registros > 0 ? round($efectivas / $registros * 100, 1) : 0.0;
        }
        return $filas;
    }
}