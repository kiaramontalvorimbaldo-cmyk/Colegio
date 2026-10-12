<?php
declare(strict_types=1);

/** GET /api/director/resumen - indicadores del panel de la direccion. */
final class DirectorController
{
    public function resumen(): never
    {
        Auth::exigirRol('DIRECTOR');

        $pdo = Conexion::obtener();
        $conteo = [];
        foreach ((new Incidencia())->conteoGlobal() as $fila) {
            $conteo[$fila['estado']] = (int)$fila['total'];
        }

        $asistencia = $pdo->query(
            'SELECT COUNT(*) AS registros,
                    SUM(estado = "presente") AS presentes,
                    SUM(estado = "tardanza") AS tardanzas
             FROM asistencias'
        )->fetch();

        $registros = (int)$asistencia['registros'];
        $efectivas = (int)$asistencia['presentes'] + (int)$asistencia['tardanzas'] * 0.5;

        Respuesta::json([
            'incidencias' => [
                'pendientes' => $conteo['pendiente'] ?? 0,
                'proceso'    => $conteo['en_proceso'] ?? 0,
                'resueltas'  => $conteo['resuelta'] ?? 0,
                'total'      => array_sum($conteo),
            ],
            'docentes'    => (int)$pdo->query('SELECT COUNT(*) FROM docentes')->fetchColumn(),
            'cursos'      => (int)$pdo->query('SELECT COUNT(*) FROM cursos')->fetchColumn(),
            'estudiantes' => (int)$pdo->query('SELECT COUNT(*) FROM estudiantes')->fetchColumn(),
            'asistencia_promedio' => $registros > 0 ? round($efectivas / $registros * 100, 1) : 0.0,
        ], 'Resumen de la direccion');
    }
}