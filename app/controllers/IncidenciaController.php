<?php
declare(strict_types=1);

/** GET/POST/PUT /api/incidencias - registro docente y gestion de la direccion. */
final class IncidenciaController
{
    /** GET /api/incidencias?estado=  (docente: las suyas | director: todas) */
    public function index(): never
    {
        Auth::exigirRol('DOCENTE', 'DIRECTOR');
        $estado = (string)($_GET['estado'] ?? '');

        if ($estado !== '' && !in_array($estado, ['pendiente', 'en_proceso', 'resuelta'], true)) {
            Respuesta::error('Estado de incidencia no valido', 400);
        }

        $modelo = new Incidencia();
        $incidencias = Auth::esDirector()
            ? $modelo->listarTodas($estado)
            : $modelo->porDocente($this->docenteId(), $estado);

        Respuesta::json($incidencias, 'Incidencias registradas: ' . count($incidencias));
    }

    /** PUT /api/incidencias/{id} - la direccion cambia estado y responde. */
    public function actualizar(int $id): never
    {
        Auth::exigirRol('DIRECTOR');

        $modelo = new Incidencia();
        $incidencia = $modelo->porId($id);
        if ($incidencia === null) {
            Respuesta::error('Incidencia no encontrada', 404);
        }

        $datos = $this->entrada();
        $permitidos = ['estado', 'respuesta_director'];
        $datos = array_intersect_key($datos, array_flip($permitidos));

        if (isset($datos['estado'])) {
            if (!in_array($datos['estado'], ['pendiente', 'en_proceso', 'resuelta'], true)) {
                Respuesta::error('Estado de incidencia no valido', 400);
            }
        }

        if (isset($datos['respuesta_director'])) {
            $datos['respuesta_director'] = trim((string)$datos['respuesta_director']);
            if ($datos['respuesta_director'] !== '' && mb_strlen($datos['respuesta_director']) < 5) {
                Respuesta::error('La respuesta debe tener al menos 5 caracteres', 400);
            }
            if ($datos['respuesta_director'] === '') {
                $datos['respuesta_director'] = null;
            }
        }

        if ($datos === []) {
            Respuesta::error('No se envio ningun campo permitido', 400);
        }

        // Al resolver la incidencia se registra la fecha de respuesta
        $estadoFinal = $datos['estado'] ?? $incidencia['estado'];
        $fechaRespuesta = $estadoFinal === 'resuelta' ? date('Y-m-d H:i:s') : $incidencia['fecha_respuesta'];

        $modelo->actualizarEstado(
            $id,
            $estadoFinal,
            $datos['respuesta_director'] ?? $incidencia['respuesta_director'],
            $fechaRespuesta
        );

        Respuesta::json($modelo->porId($id), 'Incidencia actualizada');
    }

    /** POST /api/incidencias - toda incidencia nace en estado pendiente. */
    public function crear(): never
    {
        Auth::exigirRol('DOCENTE');

        $datos = $this->entrada();
        $estudianteId = (int)($datos['estudiante_id'] ?? 0);
        $tipo = (string)($datos['tipo'] ?? '');
        $descripcion = trim((string)($datos['descripcion'] ?? ''));
        $fecha = (string)($datos['fecha'] ?? date('Y-m-d'));

        if ($estudianteId <= 0) {
            Respuesta::error('Debe seleccionar un estudiante', 400);
        }
        if (!in_array($tipo, Incidencia::TIPOS, true)) {
            Respuesta::error('Tipo de incidencia no valido', 400);
        }
        if (mb_strlen($descripcion) < 10) {
            Respuesta::error('La descripcion debe tener al menos 10 caracteres', 400);
        }
        if (DateTime::createFromFormat('Y-m-d', $fecha) === false) {
            Respuesta::error('La fecha debe tener el formato AAAA-MM-DD', 400);
        }

        $modelo = new Incidencia();
        $id = $modelo->crear([
            'estudiante_id' => $estudianteId,
            'docente_id'    => $this->docenteId(),
            'tipo'          => $tipo,
            'descripcion'   => $descripcion,
            'fecha'         => $fecha,
            'estado'        => 'pendiente',
        ]);

        Respuesta::creado($modelo->porId($id), 'Incidencia registrada');
    }

    private function docenteId(): int
    {
        $id = (new Docente())->idDeUsuario(Auth::id());
        if ($id === 0) {
            Respuesta::error('El usuario no esta registrado como docente', 403);
        }
        return $id;
    }

    private function entrada(): array
    {
        $json = json_decode(file_get_contents('php://input') ?: '', true);
        return is_array($json) ? $json : $_POST;
    }
}