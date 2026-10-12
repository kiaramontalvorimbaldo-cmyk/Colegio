<?php
declare(strict_types=1);

/** GET/POST /api/evaluaciones - evaluacion de docentes (1 a 5). */
final class EvaluacionController
{
    /** GET /api/evaluaciones?docente_id=N */
    public function index(): never
    {
        Auth::exigirRol('DIRECTOR');

        $docenteId = (int)($_GET['docente_id'] ?? 0);
        $modelo = new Evaluacion();

        Respuesta::json([
            'evaluaciones' => $modelo->listar($docenteId > 0 ? $docenteId : null),
            'promedios'    => $modelo->promedios(),
        ], 'Evaluaciones de docentes');
    }

    /** POST /api/evaluaciones */
    public function crear(): never
    {
        Auth::exigirRol('DIRECTOR');

        $datos = $this->entrada();
        $docenteId = (int)($datos['docente_id'] ?? 0);
        $puntaje = (int)($datos['puntaje'] ?? 0);
        $observaciones = trim((string)($datos['observaciones'] ?? ''));
        $fecha = (string)($datos['fecha'] ?? date('Y-m-d'));

        if ($docenteId <= 0 || (new Docente())->porId($docenteId) === null) {
            Respuesta::error('Debe seleccionar un docente valido', 400);
        }
        if ($puntaje < 1 || $puntaje > 5) {
            Respuesta::error('El puntaje debe ser un numero entero entre 1 y 5', 400);
        }
        if (mb_strlen($observaciones) < 10) {
            Respuesta::error('La observacion es obligatoria (minimo 10 caracteres)', 400);
        }
        if (DateTime::createFromFormat('Y-m-d', $fecha) === false) {
            Respuesta::error('La fecha debe tener el formato AAAA-MM-DD', 400);
        }

        $modelo = new Evaluacion();
        $id = $modelo->crear([
            'docente_id'    => $docenteId,
            'director_id'   => Auth::id(),
            'puntaje'       => $puntaje,
            'observaciones' => $observaciones,
            'fecha'         => $fecha,
        ]);

        Respuesta::creado($modelo->porId($id), 'Evaluacion registrada');
    }

    private function entrada(): array
    {
        $json = json_decode(file_get_contents('php://input') ?: '', true);
        return is_array($json) ? $json : $_POST;
    }
}