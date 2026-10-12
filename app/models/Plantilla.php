<?php
declare(strict_types=1);

/** Plantillas de documentos para la UGEL con marcadores {{...}}. */
final class Plantilla extends ModeloBase
{
    protected string $tabla = 'plantillas_ugel';
    protected array $campos = ['nombre', 'contenido_html'];

    /** Listado sin el contenido pesado, para la pantalla de seleccion. */
    public function resumen(): array
    {
        return $this->pdo()
            ->query('SELECT id, nombre, actualizado_en FROM plantillas_ugel ORDER BY nombre')
            ->fetchAll();
    }

    /**
     * Genera el documento reemplazando los marcadores por los datos institucionales.
     * Marcadores admitidos: {{institucion}}, {{director}}, {{fecha}}, {{periodo}}, {{sistema}}
     */
    public function generar(int $id, array $datos): ?array
    {
        $plantilla = $this->porId($id);
        if ($plantilla === null) {
            return null;
        }

        $contenido = (string)$plantilla['contenido_html'];

        // El documento se muestra en la pantalla: se retiran scripts y manejadores.
        $contenido = self::sanear($contenido);

        foreach ($datos as $marcador => $valor) {
            $contenido = str_replace('{{' . $marcador . '}}', htmlspecialchars((string)$valor, ENT_QUOTES), $contenido);
        }

        $restantes = [];
        if (preg_match_all('/\{\{(\w+)\}\}/', $contenido, $coincidencias) > 0) {
            $restantes = array_values(array_unique($coincidencias[1]));
        }

        $plantilla['contenido_html'] = $contenido;
        $plantilla['marcadores_pendientes'] = $restantes;
        return $plantilla;
    }

    /** Elimina scripts, estilos y manejadores de evento del HTML de la plantilla. */
    private static function sanear(string $html): string
    {
        $html = preg_replace('#<\s*(script|style|iframe|object|embed)\b[^>]*>.*?<\s*/\s*\1\s*>#is', '', $html);
        $html = preg_replace('#<\s*(script|style|iframe|object|embed)\b[^>]*/?>#is', '', (string)$html);
        $html = preg_replace('#\son[a-z]+\s*=\s*("[^"]*"|\'[^\']*\'|[^\s>]+)#i', '', (string)$html);
        $html = preg_replace('#(href|src)\s*=\s*("|\')?\s*javascript:[^"\'>\s]*("|\')?#i', '', (string)$html);
        return (string)$html;
    }
}