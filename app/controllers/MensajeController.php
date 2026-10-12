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

    /** POST /api/mensajes - el docente redacta hacia la direccion. */
    public function crear(): never
    {
        Auth::exigirRol('DOCENTE');

        $datos = $this->entrada();
        $asunto = trim((string)($datos['asunto'] ?? ''));
        $cuerpo = trim((string)($datos['cuerpo'] ?? ''));
        $destinatarioId = (int)($datos['destinatario_id'] ?? 0);

        if ($asunto === '' || $cuerpo === '') {
            Respuesta::error('El asunto y el cuerpo del mensaje son obligatorios', 400);
        }
        if (mb_strlen($asunto) > 120 || mb_strlen($cuerpo) > 2000) {
            Respuesta::error('El asunto admite 120 y el cuerpo 2000 caracteres', 400);
        }

        // El docente solo puede escribir a la direccion activa.
        $direccion = (new Usuario())->porRol('DIRECTOR');
        if ($direccion === []) {
            Respuesta::error('No hay una direccion activa registrada', 400);
        }
        $destino = (int)$direccion[0]['id'];
        if ($destinatarioId > 0 && $destinatarioId !== $destino) {
            Respuesta::error('El docente solo puede enviar mensajes a la direccion', 403);
        }

        $modelo = new Mensaje();
        $id = $modelo->crear([
            'remitente_id'    => Auth::id(),
            'destinatario_id' => $destino,
            'asunto'          => $asunto,
            'cuerpo'          => $cuerpo,
        ]);

        Respuesta::creado($modelo->porId($id), 'Mensaje enviado a la direccion');
    }

    private function entrada(): array
    {
        $json = json_decode(file_get_contents('php://input') ?: '', true);
        return is_array($json) ? $json : $_POST;
    }
}