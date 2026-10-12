<?php
declare(strict_types=1);

/**
 * Enrutador de la API.
 * Las rutas llegan como /api/{recurso}[/{id}] y se traducen a [Clase::metodo].
 */
final class Router
{
    /** @var array<int, array{metodo:string, patron:string, ruta:string, control:string}> */
    private array $rutas = [];

    public function agregar(string $metodo, string $ruta, string $controlador, string $accion): self
    {
        $ruta = '/' . trim($ruta, '/');
        $patron = preg_quote($ruta, '#');
        $patron = preg_replace('#\\\\\{(\w+)\\\\\}#', '(?P<$1>[^/]+)', $patron);

        $this->rutas[] = [
            'metodo'  => strtoupper($metodo),
            'patron'  => '#^' . $patron . '$#',
            'ruta'    => $ruta,
            'control' => $controlador . '@' . $accion,
        ];
        return $this;
    }

    public function despachar(): void
    {
        $metodo = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
        $ruta   = '/' . trim((string)($_GET['ruta'] ?? ''), '/');

        foreach ($this->rutas as $item) {
            if (!preg_match($item['patron'], $ruta, $coincidencias)) {
                continue;
            }
            if ($item['metodo'] !== $metodo) {
                Respuesta::error("Metodo $metodo no permitido en $item[ruta].", 404);
            }

            $args = [];
            foreach ($coincidencias as $clave => $valor) {
                if (is_string($clave)) {
                    $args[$clave] = $valor;
                }
            }

            [$clase, $accion] = explode('@', $item['control']);
            $controlador = new $clase();
            $controlador->$accion(...$args);
            return;
        }

        Respuesta::error('Ruta no encontrada: /api' . $ruta, 404);
    }
}