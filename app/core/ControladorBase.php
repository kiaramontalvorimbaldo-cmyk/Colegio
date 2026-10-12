<?php
declare(strict_types=1);

/** Controlador con CRUD generico; los modulos heredan y declinan su modelo. */
abstract class ControladorBase
{
    protected ?ModeloBase $modelo = null;

    /** Nombre de la clase modelo que usa el controlador. */
    abstract protected function claseModelo(): string;

    protected function modelo(): ModeloBase
    {
        if ($this->modelo === null) {
            $clase = $this->claseModelo();
            $this->modelo = new $clase();
        }
        return $this->modelo;
    }

    public function index(): never
    {
        Respuesta::json($this->modelo()->todos());
    }

    public function ver(int $id): never
    {
        $fila = $this->modelo()->porId($id);
        if ($fila === null) {
            Respuesta::error('Registro no encontrado', 404);
        }
        Respuesta::json($fila);
    }

    /** Crea (sin id) o actualiza (con id). */
    public function guardar(): never
    {
        $datos = $this->entrada();
        $id = isset($datos['id']) ? (int)$datos['id'] : 0;

        if ($id > 0) {
            unset($datos['id']);
            if ($this->modelo()->porId($id) === null) {
                Respuesta::error('Registro no encontrado', 404);
            }
            $this->modelo()->actualizar($id, $datos);
            Respuesta::json($this->modelo()->porId($id), 'Registro actualizado');
        }

        $nuevoId = $this->modelo()->crear($datos);
        Respuesta::creado($this->modelo()->porId($nuevoId), 'Registro creado');
    }

    public function borrar(int $id): never
    {
        if ($this->modelo()->eliminar($id) === false) {
            Respuesta::error('Registro no encontrado', 404);
        }
        Respuesta::json(null, 'Registro eliminado');
    }

    /** Lee el cuerpo de la peticion (JSON o formulario). */
    protected function entrada(): array
    {
        $crudo = file_get_contents('php://input') ?: '';
        $json  = json_decode($crudo, true);

        return is_array($json) ? $json : $_POST;
    }
}