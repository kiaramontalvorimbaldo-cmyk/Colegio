<?php
declare(strict_types=1);

/** GET/POST /api/asistencias - toma de asistencia del docente por curso y fecha. */
final class AsistenciaController
{
    /** GET /api/asistencias?curso_id=1&fecha=2026-03-10 */
    public function index(): never
    {
        Auth::exigirRol('DOCENTE');

        $curso = $this->cursoDelDocente((int)($_GET['curso_id'] ?? 0));
        $fecha = $this->validarFecha((string)($_GET['fecha'] ?? ''));

        $filas = (new Asistencia())->porCursoYFecha(
            (int)$curso['id'],
            (string)$curso['grado'],
            (string)$curso['seccion'],
            $fecha
        );

        Respuesta::json([
            'curso'     => ['id' => (int)$curso['id'], 'nombre' => $curso['nombre'],
                            'grado' => $curso['grado'], 'seccion' => $curso['seccion']],
            'fecha'     => $fecha,
            'estudiantes' => $filas,
        ], 'Listado de ' . count($filas) . ' estudiantes');
    }

    /** POST /api/asistencias - guardado masivo y editable por fecha. */
    public function crear(): never
    {
        Auth::exigirRol('DOCENTE');

        $datos = $this->entrada();
        $curso = $this->cursoDelDocente((int)($datos['curso_id'] ?? 0));
        $fecha = $this->validarFecha((string)($datos['fecha'] ?? ''));
        $registros = $datos['registros'] ?? [];

        if (!is_array($registros) || $registros === []) {
            Respuesta::error('Envie al menos un registro de asistencia', 400);
        }

        // Solo se aceptan estudiantes del propio curso (grado y seccion).
        $permitidos = [];
        foreach ((new Estudiante())->porCriterios(['grado' => $curso['grado'], 'seccion' => $curso['seccion']]) as $estudiante) {
            $permitidos[(int)$estudiante['id']] = true;
        }

        $limpios = [];
        foreach ($registros as $registro) {
            $estudianteId = (int)($registro['estudiante_id'] ?? 0);
            $estado = (string)($registro['estado'] ?? '');

            if (!isset($permitidos[$estudianteId])) {
                Respuesta::error('El estudiante ' . $estudianteId . ' no pertenece al curso', 400);
            }
            if (!in_array($estado, Asistencia::ESTADOS, true)) {
                Respuesta::error('Estado de asistencia no valido: ' . $estado, 400);
            }
            $limpios[] = ['estudiante_id' => $estudianteId, 'estado' => $estado];
        }

        $guardados = (new Asistencia())->guardarMasivo((int)$curso['id'], $fecha, $limpios, Auth::id());
        Respuesta::json(['registros' => $guardados, 'fecha' => $fecha], 'Asistencia guardada: ' . $guardados . ' registros');
    }

    /** El curso debe pertenecer al docente de la sesion (si no, 403). */
    private function cursoDelDocente(int $cursoId): array
    {
        if ($cursoId <= 0) {
            Respuesta::error('Debe indicar el curso', 400);
        }

        $docenteId = (new Docente())->idDeUsuario(Auth::id());
        $curso = (new Curso())->conDocente($cursoId);

        if ($curso === null) {
            Respuesta::error('El curso no existe', 404);
        }
        if ((int)$curso['docente_id'] !== $docenteId) {
            Respuesta::error('El curso no esta asignado a su cuenta', 403);
        }
        return $curso;
    }

    private function validarFecha(string $fecha): string
    {
        $d = DateTime::createFromFormat('Y-m-d', $fecha);
        if ($d === false || $d->format('Y-m-d') !== $fecha) {
            Respuesta::error('La fecha debe tener el formato AAAA-MM-DD', 400);
        }
        return $fecha;
    }

    private function entrada(): array
    {
        $json = json_decode(file_get_contents('php://input') ?: '', true);
        return is_array($json) ? $json : $_POST;
    }
}