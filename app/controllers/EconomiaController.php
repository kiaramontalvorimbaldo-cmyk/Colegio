<?php
declare(strict_types=1);

/** GET /api/economia/resumen · PUT /api/economia/parametros */
final class EconomiaController
{
    /** Indicadores economicos segun las formulas del proyecto. */
    public function resumen(): never
    {
        Auth::exigirRol('DIRECTOR');

        $modelo = new ParametroEconomico();
        $p = $modelo->actuales();
        $recaudacion = $modelo->recaudacion();

        $estudiantes = (int)$p['num_estudiantes'];
        $pension = (float)$p['pension_mensual'];
        $meses = (int)$p['meses'];
        $gastos = (float)$p['gastos_operativos'];

        $teorica = $estudiantes * $pension * $meses;            // teoria
        $efectiva = (float)$recaudacion['efectiva'];           // cobrado
        $pendiente = (float)$recaudacion['pendiente'];
        $morosidad = $teorica > 0 ? round((($teorica - $efectiva) / $teorica) * 100, 2) : 0.0;
        $planilla = $modelo->planilla();                        // sueldos
        $balance = $efectiva - $planilla - $gastos;             // balance neto
        $equilibrio = $pension > 0 ? round(($planilla + $gastos) / $pension, 1) : 0.0;

        Respuesta::json([
            'parametros' => [
                'pension_mensual'   => $pension,
                'num_estudiantes'  => $estudiantes,
                'gastos_operativos' => $gastos,
                'meses'             => $meses,
            ],
            'teorica'            => round($teorica, 2),
            'efectiva'           => round($efectiva, 2),
            'pendiente'          => round($pendiente, 2),
            'morosidad_pct'     => $morosidad,
            'planilla'           => round($planilla, 2),
            'gastos_operativos'  => round($gastos, 2),
            'balance_neto'       => round($balance, 2),
            'punto_equilibrio'   => $equilibrio,
            'supera_equilibrio' => $estudiantes >= $equilibrio,
            'pagos_mes'          => $modelo->recaudacionMensual(),
        ], 'Resumen economico');
    }

    /** Edita los parametros y recalcula los indicadores. */
    public function parametros(): never
    {
        Auth::exigirRol('DIRECTOR');

        $datos = $this->entrada();
        $permitidos = ['pension_mensual', 'num_estudiantes', 'gastos_operativos', 'meses'];
        $valores = array_intersect_key($datos, array_flip($permitidos));

        if ($valores === []) {
            Respuesta::error('No se envio ningun parametro editable', 400);
        }

        if (isset($valores['pension_mensual']) && (float)$valores['pension_mensual'] <= 0) {
            Respuesta::error('La pension mensual debe ser mayor que cero', 400);
        }
        if (isset($valores['num_estudiantes']) && (int)$valores['num_estudiantes'] < 0) {
            Respuesta::error('El numero de estudiantes no puede ser negativo', 400);
        }
        if (isset($valores['gastos_operativos']) && (float)$valores['gastos_operativos'] < 0) {
            Respuesta::error('Los gastos operativos no pueden ser negativos', 400);
        }
        if (isset($valores['meses'])) {
            $meses = (int)$valores['meses'];
            if ($meses < 1 || $meses > 12) {
                Respuesta::error('El periodo debe estar entre 1 y 12 meses', 400);
            }
            $valores['meses'] = $meses;
        }

        (new ParametroEconomico())->actualizar(1, $valores);

        // Se devuelve el resumen recalculado con los nuevos valores
        $controlador = new self();
        $controlador->resumen();
    }

    private function entrada(): array
    {
        $json = json_decode(file_get_contents('php://input') ?: '', true);
        return is_array($json) ? $json : $_POST;
    }
}