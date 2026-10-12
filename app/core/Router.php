<?php
declare(strict_types=1);

/**
 * Enrutador de la API.
 * Las rutas llegan como /api/{recurso}[/{id}] y se traducen a [Clase::metodo].
 */
final class Router
{
    /** @var array<int, array{metodo:string, patron:string, ruta:string, control:string, roles:array}> */
    private array $rutas = [];

    /** @param string[] $roles Roles autorizados; vacio = ruta publica */
    public function agregar(string $metodo, string $ruta, string $controlador, string $accion, array $roles = []): self
    {
        $ruta = '/' . trim($ruta, '/');
        $patron = preg_quote($ruta, '#');
        $patron = preg_replace('#\\\\\{(\w+)\\\\\}#', '(?P<$1>[^/]+)', $patron);

        $this->rutas[] = [
            'metodo'  => strtoupper($metodo),
            'patron'  => '#^' . $patron . '$#',
            'ruta'    => $ruta,
            'control' => $controlador . '@' . $accion,
            'roles'   => $roles,
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
            if ($item['roles'] !== []) {
                Auth::exigirRol(...$item['roles']); // middleware de roles
            }
            $controlador = new $clase();
            $controlador->$accion(...$args);
            return;
        }

        Respuesta::error('Ruta no encontrada: /api' . $ruta, 404);
    }
}