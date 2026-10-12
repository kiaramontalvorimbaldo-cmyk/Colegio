<?php
declare(strict_types=1);

/** CRUD /api/horarios - con validacion de cruces de docente y aula. */
final class HorarioController
{
    /** GET /api/horarios */
    public function index(): never
    {
        Auth::exigirRol('DIRECTOR');
        $horarios = (new Horario())->listar();
        Respuesta::json($horarios, 'Horarios: ' . count($horarios));
    }

    /** POST /api/horarios */
    public function crear(): never
    {
        Auth::exigirRol('DIRECTOR');
        $this->guardar(0);
    }

    /** PUT /api/horarios/{id} */
    public function actualizar(int $id): never
    {
        Auth::exigirRol('DIRECTOR');
        $this->guardar($id);
    }

    /** DELETE /api/horarios/{id} */
    public function borrar(int $id): never
    {
        Auth::exigirRol('DIRECTOR');

        $modelo = new Horario();
        if ($modelo->porId($id) === null) {
            Respuesta::error('Horario no encontrado', 404);
        }
        $modelo->eliminar($id);
        Respuesta::json(null, 'Horario eliminado');
    }

    private function guardar(int $id): never
    {
        $datos = $this->entrada();
        $campos = [
            'curso_id'    => (int)($datos['curso_id'] ?? 0),
            'dia'         => (int)($datos['dia'] ?? 0),
            'hora_inicio' => substr(trim((string)($datos['hora_inicio'] ?? '')), 0, 5),
            'hora_fin'    => substr(trim((string)($datos['hora_fin'] ?? '')), 0, 5),
            'aula'        => strtoupper(trim((string)($datos['aula'] ?? ''))),
        ];

        $curso = (new Curso())->conDocente($campos['curso_id']);
        if ($curso === null) {
            Respuesta::error('Debe seleccionar un curso valido', 400);
        }
        if (!isset(Horario::DIAS[$campos['dia']])) {
            Respuesta::error('El dia debe estar entre 1 (lunes) y 7 (domingo)', 400);
        }
        if (preg_match('/^\d{2}:\d{2}$/', $campos['hora_inicio']) !== 1
            || preg_match('/^\d{2}:\d{2}$/', $campos['hora_fin']) !== 1) {
            Respuesta::error('Las horas deben tener el formato HH:MM', 400);
        }
        if ($campos['hora_fin'] <= $campos['hora_inicio']) {
            Respuesta::error('La hora de fin debe ser mayor que la hora de inicio', 400);
        }
        if ($campos['aula'] === '') {
            Respuesta::error('El aula es obligatoria', 400);
        }

        // Cruce: el docente no puede tener dos clases ni el aula puede estar ocupada
        $cruce = (new Horario())->buscarCruce(
            $campos['dia'],
            $campos['hora_inicio'],
            $campos['hora_fin'],
            $campos['aula'],
            (int)$curso['docente_id'],
            $id
        );

        if ($cruce !== null) {
            $mismoDocente = (int)$cruce['docente_id'] === (int)$curso['docente_id'];
            $motivo = $mismoDocente ? 'el docente ya tiene' : 'el aula ya esta ocupada en';
            Respuesta::error(sprintf(
                'No se puede registrar: %s el %s de %s a %s (%s, aula %s).',
                $motivo,
                Horario::DIAS[$campos['dia']],
                substr((string)$cruce['hora_inicio'], 0, 5),
                substr((string)$cruce['hora_fin'], 0, 5),
                $cruce['curso'],
                $cruce['aula']
            ), 400);
        }

        $modelo = new Horario();
        if ($id > 0) {
            if ($modelo->porId($id) === null) {
                Respuesta::error('Horario no encontrado', 404);
            }
            $modelo->actualizar($id, $campos);
            Respuesta::json($modelo->porId($id), 'Horario actualizado');
        }

        $nuevoId = $modelo->crear($campos);
        Respuesta::creado($modelo->porId($nuevoId), 'Horario creado');
    }

    private function entrada(): array
    {
        $json = json_decode(file_get_contents('php://input') ?: '', true);
        return is_array($json) ? $json : $_POST;
    }
}