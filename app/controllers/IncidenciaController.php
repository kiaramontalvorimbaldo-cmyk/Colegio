<?php
declare(strict_types=1);

/** GET/POST /api/incidencias - el docente registra y lista sus incidencias. */
final class IncidenciaController
{
    /** GET /api/incidencias?estado=pendiente */
    public function index(): never
    {
        Auth::exigirRol('DOCENTE');
        $estado = (string)($_GET['estado'] ?? '');

        if ($estado !== '' && !in_array($estado, ['pendiente', 'en_proceso', 'resuelta'], true)) {
            Respuesta::error('Estado de incidencia no valido', 400);
        }

        $incidencias = (new Incidencia())->porDocente($this->docenteId(), $estado);
        Respuesta::json($incidencias, 'Incidencias registradas: ' . count($incidencias));
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