<?php
declare(strict_types=1);

/** Modelo de horarios semanales por curso. */
final class Horario extends ModeloBase
{
    protected string $tabla = 'horarios';
    protected array $campos = ['curso_id', 'dia', 'hora_inicio', 'hora_fin', 'aula'];

    public const DIAS = [1 => 'Lunes', 2 => 'Martes', 3 => 'Miercoles', 4 => 'Jueves', 5 => 'Viernes', 6 => 'Sabado', 7 => 'Domingo'];

    /** Horario del docente, agrupado por dia (1 a 7). */
    public function porDocente(int $docenteId): array
    {
        $sql = 'SELECT h.*, c.nombre AS curso, c.grado, c.seccion
                FROM horarios h
                INNER JOIN cursos c ON c.id = h.curso_id
                WHERE c.docente_id = ?
                ORDER BY h.dia, h.hora_inicio';

        $stmt = $this->pdo()->prepare($sql);
        $stmt->execute([$docenteId]);

        $agrupado = array_fill_keys(array_keys(self::DIAS), []);
        foreach ($stmt->fetchAll() as $fila) {
            $dia = (int)$fila['dia'];
            if (isset($agrupado[$dia])) {
                $fila['dia_nombre'] = self::DIAS[$dia];
                $agrupado[$dia][] = $fila;
            }
        }
        return $agrupado;
    }

    /** Listado completo con curso y docente (pantalla de la direccion). */
    public function listar(): array
    {
        $sql = 'SELECT h.*, c.nombre AS curso, c.grado, c.seccion, c.docente_id,
                       u.nombres AS docente_nombres, u.apellidos AS docente_apellidos
                FROM horarios h
                INNER JOIN cursos c ON c.id = h.curso_id
                INNER JOIN docentes d ON d.id = c.docente_id
                INNER JOIN usuarios u ON u.id = d.usuario_id
                ORDER BY h.dia, h.hora_inicio';

        return $this->pdo()->query($sql)->fetchAll();
    }

    /**
     * Busca cruces: mismo docente o misma aula, mismo dia y rangos solapados.
     * Devuelve la fila que genera el conflicto.
     */
    public function buscarCruce(
        int $dia,
        string $horaInicio,
        string $horaFin,
        string $aula,
        int $docenteId,
        int $excluirId = 0
    ): ?array {
        $sql = 'SELECT h.*, c.nombre AS curso, c.docente_id,
                       u.nombres AS docente_nombres, u.apellidos AS docente_apellidos
                FROM horarios h
                INNER JOIN cursos c ON c.id = h.curso_id
                INNER JOIN docentes d ON d.id = c.docente_id
                INNER JOIN usuarios u ON u.id = d.usuario_id
                WHERE h.dia = ?
                  AND h.hora_inicio < ?
                  AND h.hora_fin > ?
                  AND (c.docente_id = ? OR h.aula = ?)
                  AND h.id <> ?';

        $stmt = $this->pdo()->prepare($sql);
        $stmt->execute([$dia, $horaFin, $horaInicio, $docenteId, $aula, $excluirId]);

        $fila = $stmt->fetch();
        return $fila === false ? null : $fila;
    }
}