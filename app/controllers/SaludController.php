<?php
declare(strict_types=1);

/** Endpoint de prueba del Sprint 1: comprueba la API y la conexion unica. */
final class SaludController
{
    public function indice(): never
    {
        $pdo = Conexion::obtener();
        $pdo->query('SELECT 1');

        // Demuestra del Singleton: reintentar la inicializacion no crea otro enlace.
        $primera = Conexion::obtener();
        Conexion::inicializar(Conexion::configuracion());
        $segunda = Conexion::obtener();

        $tablas = (int)$pdo->query(
            'SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE()'
        )->fetchColumn();

        Respuesta::json([
            'servicio'       => 'API Administracion Academica - I.E.P. Sagrado Corazon de Jesus',
            'version'        => '1.0.0',
            'sprint'         => 1,
            'php'            => PHP_VERSION,
            'base_datos'     => $pdo->query('SELECT DATABASE()')->fetchColumn(),
            'mysql'          => $pdo->getAttribute(PDO::ATTR_SERVER_VERSION),
            'tablas'         => $tablas,
            'conexion_unica' => $primera === $segunda ? 'si' : 'no',
            'conexion_id'    => Conexion::identificador(),
        ], 'Servicio operativo');
    }
}