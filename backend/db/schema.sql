-- =====================================================================
-- Esquema de la base de datos (SQLite)
-- Sistema de Administración Académica - I.E.P. Sagrado Corazón de Jesús
-- Ejecutar con: npm run seed
-- =====================================================================

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS roles (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre      TEXT NOT NULL UNIQUE,
  descripcion TEXT
);

CREATE TABLE IF NOT EXISTS usuarios (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  rol_id        INTEGER NOT NULL REFERENCES roles(id),
  usuario       TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  nombres       TEXT NOT NULL,
  apellidos     TEXT NOT NULL,
  email         TEXT UNIQUE,
  telefono      TEXT,
  foto          TEXT,
  activo        INTEGER NOT NULL DEFAULT 1 CHECK (activo IN (0, 1)),
  creado_en     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS docentes (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id   INTEGER NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
  dni          TEXT NOT NULL UNIQUE,
  especialidad TEXT NOT NULL,
  sueldo       REAL NOT NULL DEFAULT 0 CHECK (sueldo >= 0)
);

CREATE TABLE IF NOT EXISTS estudiantes (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  dni       TEXT NOT NULL UNIQUE,
  nombres   TEXT NOT NULL,
  apellidos TEXT NOT NULL,
  grado     TEXT NOT NULL,
  seccion   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cursos (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre     TEXT NOT NULL,
  grado      TEXT NOT NULL,
  seccion    TEXT NOT NULL,
  periodo    TEXT NOT NULL,
  docente_id INTEGER NOT NULL REFERENCES docentes(id),
  UNIQUE (nombre, grado, seccion, periodo)
);

CREATE TABLE IF NOT EXISTS horarios (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  curso_id    INTEGER NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
  dia         INTEGER NOT NULL CHECK (dia BETWEEN 1 AND 7),   -- 1 = lunes ... 7 = domingo
  hora_inicio TEXT NOT NULL,
  hora_fin    TEXT NOT NULL,
  aula        TEXT NOT NULL,
  CHECK (hora_fin > hora_inicio)
);

CREATE TABLE IF NOT EXISTS asistencias (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  curso_id       INTEGER NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
  estudiante_id  INTEGER NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
  fecha          TEXT NOT NULL,                              -- AAAA-MM-DD
  estado         TEXT NOT NULL DEFAULT 'presente'
                 CHECK (estado IN ('presente', 'tardanza', 'falta', 'justificada')),
  registrado_por INTEGER NOT NULL REFERENCES usuarios(id),
  creado_en      TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (curso_id, estudiante_id, fecha)
);

CREATE TABLE IF NOT EXISTS incidencias (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  estudiante_id     INTEGER NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
  docente_id        INTEGER NOT NULL REFERENCES docentes(id) ON DELETE CASCADE,
  tipo              TEXT NOT NULL DEFAULT 'conducta'
                    CHECK (tipo IN ('conducta', 'rendimiento', 'asistencia', 'otro')),
  descripcion       TEXT NOT NULL,
  fecha             TEXT NOT NULL,
  estado            TEXT NOT NULL DEFAULT 'pendiente'
                    CHECK (estado IN ('pendiente', 'en_proceso', 'resuelta')),
  respuesta_director TEXT,
  fecha_respuesta   TEXT
);

CREATE TABLE IF NOT EXISTS evaluaciones_docentes (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  docente_id    INTEGER NOT NULL REFERENCES docentes(id) ON DELETE CASCADE,
  director_id   INTEGER NOT NULL REFERENCES usuarios(id),
  puntaje       INTEGER NOT NULL CHECK (puntaje BETWEEN 1 AND 5),
  observaciones TEXT NOT NULL,
  fecha         TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ugel_contactos (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre   TEXT NOT NULL,
  cargo    TEXT,
  email    TEXT NOT NULL UNIQUE,
  telefono TEXT,
  direccion TEXT
);

CREATE TABLE IF NOT EXISTS mensajes (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  remitente_id         INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  destinatario_id      INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
  destinatario_ugel_id INTEGER REFERENCES ugel_contactos(id) ON DELETE CASCADE,
  asunto               TEXT NOT NULL,
  cuerpo               TEXT NOT NULL,
  fecha                TEXT NOT NULL DEFAULT (datetime('now')),
  leido                INTEGER NOT NULL DEFAULT 0 CHECK (leido IN (0, 1)),
  CHECK (
    (destinatario_id IS NOT NULL AND destinatario_ugel_id IS NULL) OR
    (destinatario_id IS NULL AND destinatario_ugel_id IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS plantillas_ugel (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre         TEXT NOT NULL UNIQUE,
  contenido_html TEXT NOT NULL,
  actualizado_en TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS parametros_economicos (
  id                INTEGER PRIMARY KEY CHECK (id = 1),
  pension_mensual   REAL NOT NULL DEFAULT 350 CHECK (pension_mensual > 0),
  num_estudiantes   INTEGER NOT NULL DEFAULT 30 CHECK (num_estudiantes >= 0),
  gastos_operativos REAL NOT NULL DEFAULT 4500 CHECK (gastos_operativos >= 0),
  meses             INTEGER NOT NULL DEFAULT 5 CHECK (meses BETWEEN 1 AND 12)
);

CREATE TABLE IF NOT EXISTS pagos (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  estudiante_id INTEGER NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
  mes           TEXT NOT NULL,               -- AAAA-MM
  monto         REAL NOT NULL CHECK (monto >= 0),
  estado        TEXT NOT NULL DEFAULT 'pagado' CHECK (estado IN ('pagado', 'pendiente')),
  UNIQUE (estudiante_id, mes)
);

CREATE INDEX IF NOT EXISTS idx_cursos_docente      ON cursos (docente_id);
CREATE INDEX IF NOT EXISTS idx_horarios_curso      ON horarios (curso_id, dia);
CREATE INDEX IF NOT EXISTS idx_asistencias_fecha   ON asistencias (fecha);
CREATE INDEX IF NOT EXISTS idx_incidencias_docente ON incidencias (docente_id, estado);
CREATE INDEX IF NOT EXISTS idx_mensajes_destino    ON mensajes (destinatario_id, leido);
CREATE INDEX IF NOT EXISTS idx_pagos_mes           ON pagos (mes, estado);
CREATE INDEX IF NOT EXISTS idx_estudiantes_grado    ON estudiantes (grado, seccion);