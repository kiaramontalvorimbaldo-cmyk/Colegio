<?php
declare(strict_types=1);

/** Parametros economicos de la institucion (fila unica). */
final class ParametroEconomico extends ModeloBase
{
    protected string $tabla = 'parametros_economicos';
    protected array $campos = ['pension_mensual', 'num_estudiantes', 'gastos_operativos', 'meses'];

    /** Fila vigente de parametros. */
    public function actuales(): array
    {
        $fila = $this->porId(1);
        if ($fila === null) {
            throw new RuntimeException('No se han configurado los parametros economicos');
        }
        return $fila;
    }

    /** Totales de recaudacion: efectiva (pagado) y pendiente. */
    public function recaudacion(): array
    {
        $sql = 'SELECT
                    COALESCE(SUM(monto), 0) AS total,
                    COALESCE(SUM(CASE WHEN estado = "pagado" THEN monto ELSE 0 END), 0) AS efectiva,
                    COALESCE(SUM(CASE WHEN estado = "pendiente" THEN monto ELSE 0 END), 0) AS pendiente,
                    COUNT(*) AS registros
                FROM pagos';

        return $this->pdo()->query($sql)->fetch();
    }

    /** Recaudacion por mes para el grafico. */
    public function recaudacionMensual(): array
    {
        $sql = 'SELECT mes,
                       COALESCE(SUM(CASE WHEN estado = "pagado" THEN monto ELSE 0 END), 0) AS efectiva,
                       COALESCE(SUM(CASE WHEN estado = "pendiente" THEN monto ELSE 0 END), 0) AS pendiente
                FROM pagos
                GROUP BY mes
                ORDER BY mes';

        return $this->pdo()->query($sql)->fetchAll();
    }

    /** Planilla mensual: suma de sueldos de los docentes. */
    public function planilla(): float
    {
        return (float)$this->pdo()->query('SELECT COALESCE(SUM(sueldo), 0) FROM docentes')->fetchColumn();
    }
}