<?php
declare(strict_types=1);

/**
 * CRUD generico con sentencias preparadas.
 * Los modelos heredan y declinan tabla, campos y clave primaria.
 */
abstract class ModeloBase
{
    protected string $tabla = '';
    protected array $campos = [];
    protected string $pk = 'id';

    protected function pdo(): PDO
    {
        return Conexion::obtener();
    }

    /** @return array<int, array<string,mixed>> */
    public function todos(?string $orden = null, ?int $limite = null): array
    {
        $sql = 'SELECT * FROM ' . $this->tabla();
        if ($orden !== null) {
            $sql .= ' ORDER BY ' . $this->columnaOrden($orden);
        }
        if ($limite !== null) {
            $sql .= ' LIMIT ' . max(1, $limite);
        }
        return $this->pdo()->query($sql)->fetchAll();
    }

    public function porId(int $id): ?array
    {
        $sql = 'SELECT * FROM ' . $this->tabla() . ' WHERE ' . $this->pk . ' = ? LIMIT 1';
        $stmt = $this->pdo()->prepare($sql);
        $stmt->execute([$id]);
        $fila = $stmt->fetch();
        return $fila === false ? null : $fila;
    }

    /**
     * Busca por criterios: ['columna' => valor, 'otro >=' => valor]
     * @return array<int, array<string,mixed>>
     */
    public function porCriterios(array $criterios, ?string $orden = null): array
    {
        [$donde, $params] = $this->construirWhere($criterios);
        $sql = 'SELECT * FROM ' . $this->tabla() . ' ' . $donde;
        if ($orden !== null) {
            $sql .= ' ORDER BY ' . $this->columnaOrden($orden);
        }
        $stmt = $this->pdo()->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function contar(array $criterios = []): int
    {
        [$donde, $params] = $this->construirWhere($criterios);
        $stmt = $this->pdo()->prepare('SELECT COUNT(*) FROM ' . $this->tabla() . ' ' . $donde);
        $stmt->execute($params);
        return (int)$stmt->fetchColumn();
    }

    public function existe(array $criterios): bool
    {
        return $this->contar($criterios) > 0;
    }

    /** Inserta y devuelve el id generado. */
    public function crear(array $datos): int
    {
        $datos = $this->soloCampos($datos);
        if ($datos === []) {
            throw new InvalidArgumentException('No se envio ningun campo valido para ' . $this->tabla . '.');
        }

        $columnas = array_keys($datos);
        $sql = 'INSERT INTO ' . $this->tabla()
            . ' (' . implode(', ', $columnas) . ')'
            . ' VALUES (' . implode(', ', array_map(static fn(string $c): string => ':' . $c, $columnas)) . ')';

        $stmt = $this->pdo()->prepare($sql);
        $stmt->execute($datos);
        return (int)$this->pdo()->lastInsertId();
    }

    /** Actualiza por clave primaria. */
    public function actualizar(int $id, array $datos): bool
    {
        $datos = $this->soloCampos($datos);
        if ($datos === []) {
            return false;
        }

        $asignaciones = [];
        foreach (array_keys($datos) as $columna) {
            $asignaciones[] = $columna . ' = :' . $columna;
        }

        $sql = 'UPDATE ' . $this->tabla() . ' SET ' . implode(', ', $asignaciones)
            . ' WHERE ' . $this->pk . ' = :id_pk';

        $stmt = $this->pdo()->prepare($sql);
        $datos['id_pk'] = $id;
        $stmt->execute($datos);
        return $stmt->rowCount() > 0;
    }

    public function eliminar(int $id): bool
    {
        $stmt = $this->pdo()->prepare('DELETE FROM ' . $this->tabla() . ' WHERE ' . $this->pk . ' = ?');
        $stmt->execute([$id]);
        return $stmt->rowCount() > 0;
    }

    /** Conserva solo los campos declarados por el modelo. */
    public function soloCampos(array $datos): array
    {
        if ($this->campos === []) {
            return $datos;
        }
        return array_intersect_key($datos, array_flip($this->campos));
    }

    /** @return array{0:string,1:array} */
    protected function construirWhere(array $criterios): array
    {
        if ($criterios === []) {
            return ['', []];
        }

        $partes = [];
        $params = [];
        foreach ($criterios as $campo => $valor) {
            $partes[] = $this->columna($campo) . ' = ?';
            $params[] = $valor;
        }
        return ['WHERE ' . implode(' AND ', $partes), $params];
    }

    /** Valida el nombre de la tabla contra la lista de campos. */
    protected function tabla(): string
    {
        return $this->columna($this->tabla);
    }

    protected function columna(string $campo): string
    {
        $campo = trim($campo);
        if (preg_match('/^[a-z_][a-z0-9_]*$/i', $campo) !== 1) {
            throw new InvalidArgumentException('Nombre de campo no permitido: ' . $campo);
        }
        return $campo;
    }

    protected function columnaOrden(string $orden): string
    {
        $partes = [];
        foreach (explode(',', $orden) as $trozo) {
            $trozo = trim($trozo);
            if ($trozo === '') {
                continue;
            }
            $piezas = preg_split('/\s+/', $trozo);
            $columna = $this->columna((string)array_shift($piezas));
            $direccion = strtoupper((string)($piezas[0] ?? 'ASC'));
            $partes[] = $columna . ' ' . ($direccion === 'DESC' ? 'DESC' : 'ASC');
        }
        return implode(', ', $partes);
    }
}