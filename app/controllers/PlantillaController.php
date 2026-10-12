<?php
declare(strict_types=1);

/** GET /api/plantillas · GET /api/plantillas/{id}/generar */
final class PlantillaController
{
    /** GET /api/plantillas */
    public function index(): never
    {
        Auth::exigirRol('DIRECTOR');
        $plantillas = (new Plantilla())->resumen();
        Respuesta::json($plantillas, 'Plantillas UGEL: ' . count($plantillas));
    }

    /** GET /api/plantillas/{id}/generar - documento con los datos ya puestos. */
    public function generar(int $id): never
    {
        Auth::exigirRol('DIRECTOR');

        $datos = [
            'institucion' => (string)($GLOBALS['CONFIG']['app']['nombre'] ?? 'Institucion Educativa'),
            'director'    => Auth::usuario()['nombres'] . ' ' . Auth::usuario()['apellidos'],
            'fecha'       => date('d/m/Y'),
            'periodo'     => $this->periodoActual(),
            'sistema'     => (string)($GLOBALS['CONFIG']['app']['sistema'] ?? ''),
        ];

        $plantilla = (new Plantilla())->generar($id, $datos);
        if ($plantilla === null) {
            Respuesta::error('Plantilla no encontrada', 404);
        }

        Respuesta::json([
            'id'                  => (int)$plantilla['id'],
            'nombre'              => $plantilla['nombre'],
            'contenido_html'      => $plantilla['contenido_html'],
            'marcadores_pendientes' => $plantilla['marcadores_pendientes'],
            'datos_institucionales' => $datos,
        ], 'Documento generado');
    }

    private function periodoActual(): string
    {
        $periodo = (new Curso())->todos('periodo', 1);
        return $periodo === [] ? date('Y') : (string)$periodo[0]['periodo'];
    }
}