<?php
declare(strict_types=1);

/** Modulos del docente: perfil, cursos asignados y horario semanal. */
final class DocenteController
{
    /** GET /api/docente/perfil */
    public function perfil(): never
    {
        Auth::exigirRol('DOCENTE');
        Respuesta::json($this->datosPerfil(), 'Perfil del docente');
    }

    /** PUT /api/docente/perfil - actualiza datos de contacto y foto. */
    public function actualizarPerfil(): never
    {
        Auth::exigirRol('DOCENTE');

        $datos = $this->entrada();
        $permitidos = ['nombres', 'apellidos', 'email', 'telefono', 'foto'];
        $datos = array_intersect_key($datos, array_flip($permitidos));

        if ($datos === []) {
            Respuesta::error('No se envio ningun campo permitido', 400);
        }

        foreach (['nombres', 'apellidos'] as $campo) {
            if (isset($datos[$campo]) && trim((string)$datos[$campo]) === '') {
                Respuesta::error('El campo ' . $campo . ' no puede quedar vacio', 400);
            }
        }

        if (isset($datos['email']) && $datos['email'] !== '' && !filter_var($datos['email'], FILTER_VALIDATE_EMAIL)) {
            Respuesta::error('El correo electronico no tiene un formato valido', 400);
        }

        if (isset($datos['telefono'])) {
            $datos['telefono'] = preg_replace('/[^0-9+ ]/', '', (string)$datos['telefono']);
            if (mb_strlen($datos['telefono']) > 20) {
                Respuesta::error('El telefono admite 20 caracteres como maximo', 400);
            }
        }

        if (isset($datos['foto'])) {
            $datos['foto'] = $this->validarFoto((string)$datos['foto']);
        }

        $usuario = new Usuario();
        $usuario->actualizar(Auth::id(), $datos);

        $_SESSION['usuario'] = array_merge($_SESSION['usuario'], $datos);
        Respuesta::json($this->datosPerfil(), 'Perfil actualizado');
    }

    /** GET /api/docente/cursos */
    public function cursos(): never
    {
        Auth::exigirRol('DOCENTE');
        $cursos = (new Curso())->porDocente($this->docenteId());
        Respuesta::json($cursos, 'Cursos asignados: ' . count($cursos));
    }

    /** GET /api/docente/horario */
    public function horario(): never
    {
        Auth::exigirRol('DOCENTE');
        $horario = (new Horario())->porDocente($this->docenteId());

        $total = 0;
        foreach ($horario as $dia) {
            $total += count($dia);
        }

        Respuesta::json($horario, 'Horario semanal: ' . $total . ' clases');
    }

    /** GET /api/docente/estudiantes - alumnos de los cursos del docente. */
    public function estudiantes(): never
    {
        Auth::exigirRol('DOCENTE');
        $estudiantes = (new Estudiante())->porDocente($this->docenteId());
        Respuesta::json($estudiantes, 'Estudiantes a cargo: ' . count($estudiantes));
    }

    /** GET /api/docente/reportes - consolidado para el panel de reportes. */
    public function reportes(): never
    {
        Auth::exigirRol('DOCENTE');
        $docenteId = $this->docenteId();

        $cursos = (new Curso())->porDocente($docenteId);
        $porCurso = (new Asistencia())->resumenPorCurso($docenteId);
        $conteo = (new Incidencia())->conteoPorEstado($docenteId);

        // Promedio ponderado por la cantidad de registros de cada curso
        $registros = 0;
        $efectivas = 0.0;
        foreach ($porCurso as $curso) {
            $registros += (int)$curso['registros'];
            $efectivas += (int)$curso['presentes'] + (int)$curso['tardanzas'] * 0.5;
        }

        $porEstado = array_map(
            static fn(string $e): array => ['estado' => $e, 'total' => 0],
            ['pendiente', 'en_proceso', 'resuelta']
        );
        $totalIncidencias = 0;
        foreach ($conteo as $fila) {
            $totalIncidencias += (int)$fila['total'];
            foreach ($porEstado as $i => $estado) {
                if ($estado['estado'] === $fila['estado']) {
                    $porEstado[$i]['total'] = (int)$fila['total'];
                }
            }
        }

        Respuesta::json([
            'cursos_a_cargo'            => count($cursos),
            'estudiantes'               => count((new Estudiante())->porDocente($docenteId)),
            'asistencia_promedio'       => $registros > 0 ? round($efectivas / $registros * 100, 1) : 0.0,
            'asistencias_registradas'   => $registros,
            'incidencias_registradas'   => $totalIncidencias,
            'por_curso'                 => $porCurso,
            'incidencias_por_estado'    => $porEstado,
        ], 'Reporte del docente');
    }

    private function docenteId(): int
    {
        $id = (new Docente())->idDeUsuario(Auth::id());
        if ($id === 0) {
            Respuesta::error('El usuario no esta registrado como docente', 403);
        }
        return $id;
    }

    private function datosPerfil(): array
    {
        $usuario = (new Usuario())->porId(Auth::id());
        if ($usuario === null) {
            Respuesta::error('Usuario no encontrado', 404);
        }
        unset($usuario['password_hash']);

        $docente = (new Docente())->porUsuario(Auth::id());
        $usuario['docente'] = $docente === null ? null : [
            'id'           => (int)$docente['id'],
            'dni'          => $docente['dni'],
            'especialidad' => $docente['especialidad'],
        ];
        return $usuario;
    }

    /** La foto se guarda como data URL y debe ser una imagen pequena. */
    private function validarFoto(string $foto): ?string
    {
        if ($foto === '') {
            return null;
        }
        if (preg_match('#^data:image/(png|jpe?g|webp);base64,[A-Za-z0-9+/=]+$#', $foto) !== 1) {
            Respuesta::error('La foto debe ser una imagen PNG, JPG o WEBP', 400);
        }
        if (strlen($foto) > 400000) {
            Respuesta::error('La foto supera el tamano permitido (300 KB)', 400);
        }
        return $foto;
    }

    private function entrada(): array
    {
        $json = json_decode(file_get_contents('php://input') ?: '', true);
        return is_array($json) ? $json : $_POST;
    }
}