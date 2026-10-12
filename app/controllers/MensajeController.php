<?php
declare(strict_types=1);

/** GET/POST /api/mensajes - bandeja y redaccion de mensajes. */
final class MensajeController
{
    /** GET /api/mensajes?carpeta=recibidos|enviados|todos */
    public function index(): never
    {
        Auth::exigirRol('DOCENTE', 'DIRECTOR');
        $carpeta = (string)($_GET['carpeta'] ?? 'todos');
        $mensajes = (new Mensaje())->bandeja(Auth::id(), $carpeta);

        $noLeidos = 0;
        foreach ($mensajes as $mensaje) {
            if ((int)$mensaje['leido'] === 0 && (int)$mensaje['destinatario_id'] === Auth::id()) {
                $noLeidos++;
            }
        }

        Respuesta::json(['mensajes' => $mensajes, 'no_leidos' => $noLeidos], 'Bandeja de mensajes');
    }

    /** POST /api/mensajes - docente hacia la direccion; director hacia docentes o UGEL. */
    public function crear(): never
    {
        Auth::exigirRol('DOCENTE', 'DIRECTOR');

        $datos = $this->entrada();
        $asunto = trim((string)($datos['asunto'] ?? ''));
        $cuerpo = trim((string)($datos['cuerpo'] ?? ''));

        if ($asunto === '' || $cuerpo === '') {
            Respuesta::error('El asunto y el cuerpo del mensaje son obligatorios', 400);
        }
        if (mb_strlen($asunto) > 120 || mb_strlen($cuerpo) > 2000) {
            Respuesta::error('El asunto admite 120 y el cuerpo 2000 caracteres', 400);
        }

        $destino = Auth::esDirector() ? $this->destinoDirector($datos) : $this->destinoDocente($datos);

        $modelo = new Mensaje();
        $id = $modelo->crear([
            'remitente_id' => Auth::id(),
            'asunto'       => $asunto,
            'cuerpo'       => $cuerpo,
        ] + $destino);

        Respuesta::creado($modelo->porId($id), 'Mensaje enviado');
    }

    /** GET /api/ugel/contactos */
    public function contactos(): never
    {
        Auth::exigirRol('DIRECTOR');
        Respuesta::json((new Mensaje())->ugelContactos(), 'Contactos de la UGEL');
    }

    /** El docente escribe solo a la direccion activa. */
    private function destinoDocente(array $datos): array
    {
        $direccion = (new Usuario())->porRol('DIRECTOR');
        if ($direccion === []) {
            Respuesta::error('No hay una direccion activa registrada', 400);
        }

        $destino = (int)$direccion[0]['id'];
        $solicitado = (int)($datos['destinatario_id'] ?? 0);
        if ($solicitado > 0 && $solicitado !== $destino) {
            Respuesta::error('El docente solo puede enviar mensajes a la direccion', 403);
        }

        return ['destinatario_id' => $destino];
    }

    /** El director elige entre un docente o un contacto de la UGEL. */
    private function destinoDirector(array $datos): array
    {
        $tipo = (string)($datos['tipo_destino'] ?? 'usuario');

        if ($tipo === 'ugel') {
            $ugelId = (int)($datos['destinatario_ugel_id'] ?? 0);
            $stmt = Conexion::obtener()->prepare('SELECT COUNT(*) FROM ugel_contactos WHERE id = ?');
            $stmt->execute([$ugelId]);
            if ($ugelId <= 0 || (int)$stmt->fetchColumn() === 0) {
                Respuesta::error('Debe seleccionar un contacto de la UGEL', 400);
            }
            return ['destinatario_ugel_id' => $ugelId];
        }

        $docenteId = (int)($datos['destinatario_id'] ?? 0);
        if ((new Docente())->porId($docenteId) === null) {
            Respuesta::error('Debe seleccionar un docente valido', 400);
        }
        return ['destinatario_id' => $docenteId];
    }

    private function entrada(): array
    {
        $json = json_decode(file_get_contents('php://input') ?: '', true);
        return is_array($json) ? $json : $_POST;
    }
}