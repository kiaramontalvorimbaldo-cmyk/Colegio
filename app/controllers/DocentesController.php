<?php
declare(strict_types=1);

/** GET/POST /api/docentes - gestion docente con credenciales automaticas. */
final class DocentesController
{
    /** GET /api/docentes */
    public function index(): never
    {
        Auth::exigirRol('DIRECTOR');
        $docentes = (new Docente())->listar();
        Respuesta::json($docentes, 'Docentes registrados: ' . count($docentes));
    }

    /**
     * POST /api/docentes - alta con usuario y contrasena generados.
     * La contrasena en texto plano se muestra UNA sola vez.
     */
    public function crear(): never
    {
        Auth::exigirRol('DIRECTOR');

        $datos = $this->entrada();
        $nombres = trim((string)($datos['nombres'] ?? ''));
        $apellidos = trim((string)($datos['apellidos'] ?? ''));
        $dni = trim((string)($datos['dni'] ?? ''));
        $especialidad = trim((string)($datos['especialidad'] ?? ''));
        $email = trim((string)($datos['email'] ?? ''));
        $telefono = trim((string)($datos['telefono'] ?? ''));
        $sueldo = (float)($datos['sueldo'] ?? 0);

        if ($nombres === '' || $apellidos === '') {
            Respuesta::error('Los nombres y apellidos son obligatorios', 400);
        }
        if (preg_match('/^[0-9]{8}$/', $dni) !== 1) {
            Respuesta::error('El DNI debe tener 8 digitos', 400);
        }
        if ($especialidad === '') {
            Respuesta::error('La especialidad es obligatoria', 400);
        }
        if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Respuesta::error('El correo electronico no tiene un formato valido', 400);
        }
        if ($sueldo < 0) {
            Respuesta::error('El sueldo no puede ser negativo', 400);
        }

        $docentes = new Docente();
        if ($docentes->existe(['dni' => $dni])) {
            Respuesta::error('Ya existe un docente registrado con ese DNI', 400);
        }
        if ($email !== '' && (new Usuario())->existe(['email' => $email])) {
            Respuesta::error('Ya existe un usuario registrado con ese correo', 400);
        }

        $nombreUsuario = $this->generarUsuario($nombres, $apellidos, $docentes);
        $clave = $this->generarClave();

        $pdo = Conexion::obtener();
        $pdo->beginTransaction();
        try {
            $usuarios = new Usuario();
            $usuarioId = $usuarios->crear([
                'rol_id'        => $this->rolDocente(),
                'usuario'       => $nombreUsuario,
                'password_hash' => password_hash($clave, PASSWORD_DEFAULT),
                'nombres'       => $nombres,
                'apellidos'     => $apellidos,
                'email'         => $email !== '' ? $email : null,
                'telefono'      => $telefono !== '' ? $telefono : null,
                'activo'        => 1,
            ]);

            $docenteId = $docentes->crear([
                'usuario_id'   => $usuarioId,
                'dni'          => $dni,
                'especialidad' => $especialidad,
                'sueldo'       => $sueldo,
            ]);

            $pdo->commit();
        } catch (Throwable $e) {
            $pdo->rollBack();
            Respuesta::error('No se pudo registrar al docente: ' . $e->getMessage(), 400);
        }

        Respuesta::creado([
            'id'            => $docenteId,
            'usuario'       => $nombreUsuario,
            'contrasena'    => $clave,
            'nombres'       => $nombres,
            'apellidos'     => $apellidos,
            'dni'           => $dni,
            'especialidad'  => $especialidad,
            'aviso'         => 'Anote estas credenciales: la contrasena solo se muestra ahora',
        ], 'Docente registrado');
    }

    /** Usuario sugerido: inicial + primer apellido + 2 digitos. */
    private function generarUsuario(string $nombres, string $apellidos, Docente $docentes): string
    {
        $inicial = function_exists('mb_substr') ? mb_substr($nombres, 0, 1) : substr($nombres, 0, 1);
        $apellido = function_exists('mb_substr') ? mb_substr($apellidos, 0, 8) : substr($apellidos, 0, 8);

        $base = strtolower($this->sinTildes($inicial . $apellido));
        $base = preg_replace('/[^a-z0-9]/', '', $base);

        for ($intento = 0; $intento < 20; $intento++) {
            $candidato = $base . random_int(10, 99);
            if (!$docentes->existeUsuario($candidato)) {
                return $candidato;
            }
        }

        return $base . random_int(100, 999);
    }

    /** Contrasena aleatoria de 10 caracteres. */
    private function generarClave(): string
    {
        $alfabeto = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
        $clave = '';
        for ($i = 0; $i < 10; $i++) {
            $clave .= $alfabeto[random_int(0, strlen($alfabeto) - 1)];
        }
        return $clave;
    }

    private function sinTildes(string $texto): string
    {
        $mapa = ['á'=>'a','é'=>'e','í'=>'i','ó'=>'o','ú'=>'u','Á'=>'A','É'=>'E','Í'=>'I','Ó'=>'O','Ú'=>'U','ñ'=>'n','Ñ'=>'N'];
        return strtr($texto, $mapa);
    }

    private function rolDocente(): int
    {
        $stmt = Conexion::obtener()->query("SELECT id FROM roles WHERE nombre = 'DOCENTE'");
        return (int)$stmt->fetchColumn();
    }

    private function entrada(): array
    {
        $json = json_decode(file_get_contents('php://input') ?: '', true);
        return is_array($json) ? $json : $_POST;
    }
}