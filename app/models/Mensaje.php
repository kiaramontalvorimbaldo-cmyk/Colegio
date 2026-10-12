<?php
declare(strict_types=1);

/** Bandeja de mensajes entre usuarios y la direccion. */
final class Mensaje extends ModeloBase
{
    protected string $tabla = 'mensajes';
    protected array $campos = ['remitente_id', 'destinatario_id', 'destinatario_ugel_id', 'asunto', 'cuerpo'];

    /**
     * Bandeja del usuario: recibidos, enviados o ambos.
     */
    public function bandeja(int $usuarioId, string $carpeta = 'todos'): array
    {
        $condiciones = match ($carpeta) {
            'recibidos' => ['m.destinatario_id = :id'],
            'enviados'  => ['m.remitente_id = :id'],
            default     => ['(m.destinatario_id = :id OR m.remitente_id = :id)'],
        };

        $sql = 'SELECT m.*,
                       ur.nombres AS remitente_nombres,
                       ur.apellidos AS remitente_apellidos,
                       ud.nombres AS destinatario_nombres,
                       ud.apellidos AS destinatario_apellidos,
                       g.nombre AS destinatario_ugel
                FROM mensajes m
                INNER JOIN      usuarios ur ON ur.id = m.remitente_id
                LEFT  JOIN      usuarios ud ON ud.id = m.destinatario_id
                LEFT  JOIN ugel_contactos g ON g.id = m.destinatario_ugel_id
                WHERE ' . implode(' OR ', $condiciones) . '
                ORDER BY m.fecha DESC, m.id DESC';

        $stmt = $this->pdo()->prepare($sql);
        $stmt->execute(['id' => $usuarioId]);
        return $stmt->fetchAll();
    }
}