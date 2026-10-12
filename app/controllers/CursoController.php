<?php
declare(strict_types=1);

/** CRUD /api/cursos - gestion de cursos por la direccion. */
final class CursoController
{
    /** GET /api/cursos */
    public function index(): never
    {
        Auth::exigirRol('DIRECTOR');

        $sql = 'SELECT c.*, u.nombres AS docente_nombres, u.apellidos AS docente_apellidos,
                       (SELECT COUNT(*) FROM horarios h WHERE h.curso_id = c.id) AS horas_semana
                FROM cursos c
                INNER JOIN docentes d ON d.id = c.docente_id
                INNER JOIN usuarios  u ON u.id = d.usuario_id
                ORDER BY c.grado, c.seccion';

        $cursos = Conexion::obtener()->query($sql)->fetchAll();
        Respuesta::json($cursos, 'Cursos: ' . count($cursos));
    }

    /** POST /api/cursos */
    public function crear(): never
    {
        Auth::exigirRol('DIRECTOR');
        $this->guardar(0);
    }

    /** PUT /api/cursos/{id} */
    public function actualizar(int $id): never
    {
        Auth::exigirRol('DIRECTOR');
        $this->guardar($id);
    }

    /** DELETE /api/cursos/{id} */
    public function borrar(int $id): never
    {
        Auth::exigirRol('DIRECTOR');

        $modelo = new Curso();
        if ($modelo->porId($id) === null) {
            Respuesta::error('Curso no encontrado', 404);
        }
        if (!$modelo->eliminar($id)) {
            Respuesta::error('No se pudo eliminar el curso', 400);
        }
        Respuesta::json(null, 'Curso eliminado');
    }

    private function guardar(int $id): never
    {
        $datos = $this->entrada();
        $campos = [
            'nombre'      => trim((string)($datos['nombre'] ?? '')),
            'grado'       => trim((string)($datos['grado'] ?? '')),
            'seccion'     => strtoupper(trim((string)($datos['seccion'] ?? ''))),
            'periodo'     => trim((string)($datos['periodo'] ?? '')),
            'docente_id'  => (int)($datos['docente_id'] ?? 0),
        ];

        foreach (['nombre', 'grado', 'seccion', 'periodo'] as $campo) {
            if ($campos[$campo] === '') {
                Respuesta::error('El campo ' . $campo . ' es obligatorio', 400);
            }
        }
        if ((new Docente())->porId($campos['docente_id']) === null) {
            Respuesta::error('Debe seleccionar un docente valido', 400);
        }

        $modelo = new Curso();
        foreach ($modelo->porCriterios($campos) as $igual) {
            if ((int)$igual['id'] !== $id) {
                Respuesta::error('Ya existe ese curso en el mismo grado, seccion y periodo', 400);
            }
        }

        if ($id > 0) {
            if ($modelo->porId($id) === null) {
                Respuesta::error('Curso no encontrado', 404);
            }
            $modelo->actualizar($id, $campos);
            Respuesta::json($modelo->porId($id), 'Curso actualizado');
        }

        $nuevoId = $modelo->crear($campos);
        Respuesta::creado($modelo->porId($nuevoId), 'Curso creado');
    }

    private function entrada(): array
    {
        $json = json_decode(file_get_contents('php://input') ?: '', true);
        return is_array($json) ? $json : $_POST;
    }
}