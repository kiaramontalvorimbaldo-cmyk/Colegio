-- =====================================================================
-- Sprint 1 - Esquema de base de datos
-- Sistema de Administracion Academica - I.E.P. Sagrado Corazon de Jesus
-- Motor: MySQL / MariaDB (XAMPP). Charset: utf8mb4
-- Ejecutar en phpMyAdmin: primero este archivo, luego 02_seed.sql
-- =====================================================================

DROP DATABASE IF EXISTS sagrado_corazon;
CREATE DATABASE sagrado_corazon CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sagrado_corazon;

-- ---------------------------------------------------------------- roles
CREATE TABLE roles (
    id          TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre      VARCHAR(30) NOT NULL UNIQUE,
    descripcion VARCHAR(120) NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------- usuarios
CREATE TABLE usuarios (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    rol_id        TINYINT UNSIGNED NOT NULL,
    usuario       VARCHAR(30) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nombres       VARCHAR(60) NOT NULL,
    apellidos     VARCHAR(60) NOT NULL,
    email         VARCHAR(100) NULL UNIQUE,
    telefono      VARCHAR(20) NULL,
    foto          VARCHAR(255) NULL,
    activo        TINYINT(1) NOT NULL DEFAULT 1,
    creado_en     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuarios_rol FOREIGN KEY (rol_id) REFERENCES roles(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    INDEX idx_usuarios_rol (rol_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------- docentes
CREATE TABLE docentes (
    id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario_id   INT UNSIGNED NOT NULL UNIQUE,
    dni          CHAR(8) NOT NULL UNIQUE,
    especialidad VARCHAR(80) NOT NULL,
    sueldo       DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    CONSTRAINT fk_docentes_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    INDEX idx_docentes_especialidad (especialidad)
) ENGINE=InnoDB;

-- ---------------------------------------------------------- estudiantes
CREATE TABLE estudiantes (
    id        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    dni       CHAR(8) NOT NULL UNIQUE,
    nombres   VARCHAR(60) NOT NULL,
    apellidos VARCHAR(60) NOT NULL,
    grado     VARCHAR(20) NOT NULL,
    seccion   VARCHAR(10) NOT NULL,
    INDEX idx_estudiantes_grado (grado, seccion),
    INDEX idx_estudiantes_apellidos (apellidos)
) ENGINE=InnoDB;

-- --------------------------------------------------------------- cursos
CREATE TABLE cursos (
    id        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre    VARCHAR(80) NOT NULL,
    grado     VARCHAR(20) NOT NULL,
    seccion   VARCHAR(10) NOT NULL,
    periodo   VARCHAR(20) NOT NULL,
    docente_id INT UNSIGNED NOT NULL,
    CONSTRAINT fk_cursos_docente FOREIGN KEY (docente_id) REFERENCES docentes(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    UNIQUE uq_cursos (nombre, grado, seccion, periodo),
    INDEX idx_cursos_docente (docente_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------- horarios
-- dia: 1 = lunes ... 7 = domingo
CREATE TABLE horarios (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    curso_id    INT UNSIGNED NOT NULL,
    dia         TINYINT UNSIGNED NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin    TIME NOT NULL,
    aula        VARCHAR(20) NOT NULL,
    CONSTRAINT fk_horarios_curso FOREIGN KEY (curso_id) REFERENCES cursos(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT chk_horarios_dia CHECK (dia BETWEEN 1 AND 7),
    CONSTRAINT chk_horarios_rango CHECK (hora_fin > hora_inicio),
    INDEX idx_horarios_curso (curso_id),
    INDEX idx_horarios_dia_aula (dia, aula)
) ENGINE=InnoDB;

-- ----------------------------------------------------------- asistencias
CREATE TABLE asistencias (
    id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    curso_id       INT UNSIGNED NOT NULL,
    estudiante_id  INT UNSIGNED NOT NULL,
    fecha          DATE NOT NULL,
    estado         ENUM('presente','tardanza','falta','justificada') NOT NULL DEFAULT 'presente',
    registrado_por INT UNSIGNED NOT NULL,
    creado_en      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_asistencias_curso FOREIGN KEY (curso_id) REFERENCES cursos(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_asistencias_estudiante FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_asistencias_usuario FOREIGN KEY (registrado_por) REFERENCES usuarios(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    UNIQUE uq_asistencia (curso_id, estudiante_id, fecha),
    INDEX idx_asistencias_fecha (fecha)
) ENGINE=InnoDB;

-- ----------------------------------------------------------- incidencias
CREATE TABLE incidencias (
    id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    estudiante_id     INT UNSIGNED NOT NULL,
    docente_id        INT UNSIGNED NOT NULL,
    tipo              ENUM('conducta','rendimiento','asistencia','otro') NOT NULL DEFAULT 'conducta',
    descripcion       TEXT NOT NULL,
    fecha             DATE NOT NULL,
    estado            ENUM('pendiente','en_proceso','resuelta') NOT NULL DEFAULT 'pendiente',
    respuesta_director TEXT NULL,
    fecha_respuesta   DATETIME NULL,
    CONSTRAINT fk_incidencias_estudiante FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_incidencias_docente FOREIGN KEY (docente_id) REFERENCES docentes(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    INDEX idx_incidencias_docente (docente_id),
    INDEX idx_incidencias_estado (estado)
) ENGINE=InnoDB;

-- --------------------------------------------------- evaluaciones_docentes
CREATE TABLE evaluaciones_docentes (
    id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    docente_id   INT UNSIGNED NOT NULL,
    director_id  INT UNSIGNED NOT NULL,
    puntaje      TINYINT UNSIGNED NOT NULL,
    observaciones VARCHAR(255) NOT NULL,
    fecha        DATE NOT NULL,
    CONSTRAINT fk_evaluaciones_docente FOREIGN KEY (docente_id) REFERENCES docentes(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_evaluaciones_director FOREIGN KEY (director_id) REFERENCES usuarios(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT chk_evaluaciones_puntaje CHECK (puntaje BETWEEN 1 AND 5),
    INDEX idx_evaluaciones_docente (docente_id, fecha)
) ENGINE=InnoDB;

-- ------------------------------------------------------- ugel_contactos
CREATE TABLE ugel_contactos (
    id        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre    VARCHAR(80) NOT NULL,
    cargo     VARCHAR(60) NULL,
    email     VARCHAR(100) NOT NULL UNIQUE,
    telefono  VARCHAR(20) NULL,
    direccion VARCHAR(150) NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------- mensajes
-- destino: usuarios (destinatario_id) o UGEL (destinatario_ugel_id), solo uno
CREATE TABLE mensajes (
    id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    remitente_id        INT UNSIGNED NOT NULL,
    destinatario_id     INT UNSIGNED NULL,
    destinatario_ugel_id INT UNSIGNED NULL,
    asunto              VARCHAR(120) NOT NULL,
    cuerpo              TEXT NOT NULL,
    fecha               DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    leido               TINYINT(1) NOT NULL DEFAULT 0,
    CONSTRAINT fk_mensajes_remitente FOREIGN KEY (remitente_id) REFERENCES usuarios(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_mensajes_destinatario FOREIGN KEY (destinatario_id) REFERENCES usuarios(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_mensajes_ugel FOREIGN KEY (destinatario_ugel_id) REFERENCES ugel_contactos(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT chk_mensajes_destino CHECK (
        (destinatario_id IS NOT NULL AND destinatario_ugel_id IS NULL) OR
        (destinatario_id IS NULL AND destinatario_ugel_id IS NOT NULL)
    ),
    INDEX idx_mensajes_destinatario (destinatario_id, leido),
    INDEX idx_mensajes_ugel (destinatario_ugel_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------- plantillas_ugel
CREATE TABLE plantillas_ugel (
    id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre         VARCHAR(80) NOT NULL UNIQUE,
    contenido_html MEDIUMTEXT NOT NULL,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------- parametros_economicos
CREATE TABLE parametros_economicos (
    id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    pension_mensual    DECIMAL(10,2) NOT NULL DEFAULT 350.00,
    num_estudiantes    INT UNSIGNED NOT NULL DEFAULT 30,
    gastos_operativos  DECIMAL(10,2) NOT NULL DEFAULT 4500.00,
    meses              TINYINT UNSIGNED NOT NULL DEFAULT 5,
    actualizado_en     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_parametros_meses CHECK (meses BETWEEN 1 AND 12)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------- pagos
CREATE TABLE pagos (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    estudiante_id INT UNSIGNED NOT NULL,
    mes           CHAR(7) NOT NULL,               -- formato AAAA-MM
    monto         DECIMAL(10,2) NOT NULL,
    estado        ENUM('pagado','pendiente') NOT NULL DEFAULT 'pagado',
    CONSTRAINT fk_pagos_estudiante FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    UNIQUE uq_pago (estudiante_id, mes),
    INDEX idx_pagos_mes (mes, estado)
) ENGINE=InnoDB;