-- =====================================================================
-- Sprint 1 - Datos de prueba (seed)
-- Sistema de Administracion Academica - I.E.P. Sagrado Corazon de Jesus
-- Ejecutar en phpMyAdmin DESPUES de 01_schema.sql
-- Credenciales: director / Director123*   |   docente / Docente123*
-- =====================================================================
USE sagrado_corazon;
SET NAMES utf8mb4;

-- ---------------------------------------------------------------- roles
INSERT INTO roles (id, nombre, descripcion) VALUES
(1, 'DOCENTE',  'Docente de aula: cursos, horarios, asistencia e incidencias'),
(2, 'DIRECTOR', 'Directivo: incidencias, evaluacion docente, cursos y economia');

-- ------------------------------------------------------------- usuarios
INSERT INTO usuarios (id, rol_id, usuario, password_hash, nombres, apellidos, email, telefono) VALUES
(1, 2, 'director', '$2y$10$nUpWPvS0MDNjJVBhnbhGaeR/5NfK0bjzH634G/2UTEFGX/FL/3HdW', 'Maria',   'Fernandez Caisa',  'director@sagradocorazon.edu.pe', '900111222'),
(2, 1, 'docente',  '$2y$10$XvaNMh4LbsGN5C/.2YXLEebvNAqk.BeFgZKJ6GLdUjomPEWMqvlBO', 'Carlos', 'Quispe Rojas',    'cquispe@sagradocorazon.edu.pe',  '900222333'),
(3, 1, 'jramirez', '$2y$10$XvaNMh4LbsGN5C/.2YXLEebvNAqk.BeFgZKJ6GLdUjomPEWMqvlBO', 'Lucia',  'Ramirez Diaz',    'lramirez@sagradocorazon.edu.pe', '900222444'),
(4, 1, 'mflores',  '$2y$10$XvaNMh4LbsGN5C/.2YXLEebvNAqk.BeFgZKJ6GLdUjomPEWMqvlBO', 'Jorge',  'Flores Aguilar',  'jflores@sagradocorazon.edu.pe',  '900222555');

-- ------------------------------------------------------------- docentes
INSERT INTO docentes (id, usuario_id, dni, especialidad, sueldo) VALUES
(1, 2, '45218763', 'Programacion y Multimedia', 1800.00),
(2, 3, '48125374', 'Matematicas',                1600.00),
(3, 4, '70918452', 'Lengua y Comunicacion',      1500.00);

-- ---------------------------------------------------------- estudiantes
INSERT INTO estudiantes (id, dni, nombres, apellidos, grado, seccion) VALUES
(1,  '73120548', 'Ana',      'Gamarra Ruiz',    '5to', 'A'),
(2,  '73120549', 'Luis',     'Chavez Paredes',  '5to', 'A'),
(3,  '73120550', 'Maria',    'Torres Mejia',    '5to', 'A'),
(4,  '73120551', 'Jose',     'Alvarado Sequeira','5to','A'),
(5,  '73120552', 'Lucia',    'Castro Mendoza',  '5to', 'A'),
(6,  '73120553', 'Diego',    'Ramirez Silva',   '5to', 'A'),
(7,  '73120554', 'Rosa',     'Espinoza Lara',   '5to', 'A'),
(8,  '73120555', 'Carlos',   'Munarriz Vega',   '5to', 'A'),
(9,  '73120556', 'Sofia',    'Bermudez Gil',    '5to', 'A'),
(10, '73120557', 'Andres',   'Quiroz Medina',   '5to', 'A'),
(11, '73120558', 'Karla',    'Ayala Ponce',     '5to', 'B'),
(12, '73120559', 'Pedro',    'Salazar Yupanqui', '5to', 'B'),
(13, '73120560', 'Elena',    'Rojas Alvarado',  '5to', 'B'),
(14, '73120561', 'Miguel',   'Cordova Sanchez', '5to', 'B'),
(15, '73120562', 'Milagros', 'Damian Nunez',    '5to', 'B'),
(16, '73120563', 'Renzo',    'Palomino Vega',   '5to', 'B'),
(17, '73120564', 'Gabriela', 'Tapia Oblando',   '5to', 'B'),
(18, '73120565', 'Iván',     'Gutierrez Arana', '6to', 'A'),
(19, '73120566', 'Nicole',   'Perez Alvarado',  '6to', 'A'),
(20, '73120567', 'Santiago', 'Ledesma Quiroz',  '6to', 'A'),
(21, '73120568', 'Camila',   'Vasquez Rios',    '6to', 'A'),
(22, '73120569', 'Sebastian','Moro Cornejo',     '6to', 'A'),
(23, '73120570', 'Fernanda', 'Zapata Huerta',   '6to', 'A'),
(24, '73120571', 'Bruno',    'Condori Mamani',  '6to', 'B'),
(25, '73120572', 'Valeria',  'Reyes Bravo',     '6to', 'B'),
(26, '73120573', 'Alonso',   'Pinedo Salcedo',  '6to', 'B'),
(27, '73120574', 'Tatiana',  'Castro Miranda',  '6to', 'B'),
(28, '73120575', 'Horacio',  'Bustamante Diaz', '6to', 'B'),
(29, '73120576', 'Lourdes',  'Chira Arteaga',   '6to', 'B'),
(30, '73120577', 'Wilson',   'Farias Niquen',   '6to', 'B');

-- --------------------------------------------------- parametros de la BD
INSERT INTO parametros_economicos (id, pension_mensual, num_estudiantes, gastos_operativos, meses) VALUES
(1, 350.00, 30, 4500.00, 5);

-- --------------------------------------------------------------- cursos
INSERT INTO cursos (id, nombre, grado, seccion, periodo, docente_id) VALUES
(1, 'Programacion Grafica y Multimedia I', '5to', 'A', '2026-1', 1),
(2, 'Programacion Grafica y Multimedia I', '5to', 'B', '2026-1', 1),
(3, 'Matematica',                          '6to', 'A', '2026-1', 2),
(4, 'Lengua y Comunicacion',               '6to', 'A', '2026-1', 3),
(5, 'Lengua y Comunicacion',               '6to', 'B', '2026-1', 3);

-- ------------------------------------------------------------- horarios
INSERT INTO horarios (curso_id, dia, hora_inicio, hora_fin, aula) VALUES
(1, 1, '07:00', '08:30', 'A-201'),
(1, 3, '09:00', '10:30', 'Lab-Computo'),
(2, 2, '07:00', '08:30', 'A-201'),
(2, 4, '09:00', '10:30', 'Lab-Computo'),
(3, 1, '09:00', '10:30', 'B-102'),
(3, 5, '07:00', '08:30', 'B-102'),
(4, 2, '09:00', '10:30', 'A-103'),
(4, 4, '07:00', '08:30', 'A-103'),
(5, 3, '07:00', '08:30', 'A-104'),
(5, 5, '09:00', '10:30', 'A-104');

-- ----------------------------------------------------------- incidencias
INSERT INTO incidencias (estudiante_id, docente_id, tipo, descripcion, fecha, estado, respuesta_director, fecha_respuesta) VALUES
(2,  1, 'conducta',    'Discusion con companero durante el desarrollo de la clase.',                 '2026-03-03', 'resuelta',   'Se converso con el tutor del aula. Comportamiento en mejora.', '2026-03-04 09:15:00'),
(6,  1, 'asistencia',  'Ausencia injustificada por tres dias consecutivos.',                        '2026-03-05', 'en_proceso', NULL, NULL),
(11, 2, 'rendimiento', 'Bajo rendimiento en operaciones algebraicas; no entrega tareas.',             '2026-03-06', 'pendiente',  NULL, NULL),
(19, 3, 'conducta',    'Uso de celular en clase de forma reiterada.',                               '2026-03-09', 'pendiente',  NULL, NULL),
(27, 3, 'otro',        'Entrego el trabajo de comunicacion con datos incompletos y fuera de fecha.', '2026-03-11', 'resuelta',   'Se reprogramo la exposicion grupal.', '2026-03-12 11:40:00');

-- ------------------------------------------------- evaluaciones docentes
INSERT INTO evaluaciones_docentes (docente_id, director_id, puntaje, observaciones, fecha) VALUES
(1, 1, 5, 'Excelente manejo de aula y uso del laboratorio de computo.', '2026-03-02'),
(1, 1, 4, 'Cumple con la programacion establecida y sus clases son puntuales.', '2026-04-02'),
(2, 1, 4, 'Buen manejo de los materiales de matematica.', '2026-03-02'),
(3, 1, 3, 'Debe mejorar la evaluacion de tareas y la participacion de los estudiantes.', '2026-03-07');

-- ------------------------------------------------------- ugel_contactos
INSERT INTO ugel_contactos (id, nombre, cargo, email, telefono, direccion) VALUES
(1, 'UGEL Chiclayo', 'Oficina de Innovacion Educational', 'ugel.chiclayo@educacion.gob.pe', '900333444', 'Av. Balta 1200, Chiclayo');

-- ------------------------------------------------------------- mensajes
INSERT INTO mensajes (remitente_id, destinatario_id, asunto, cuerpo, fecha, leido) VALUES
(2, 1, 'Solicitud de material para el laboratorio', 'Estimada senora, necesito un proyector adicional para el laboratorio de computo del 5to grado.', '2026-03-10 08:20:00', 1),
(3, 1, 'Reporte de asistencia de 6to A',           'Adjunto el detalle de asistencias de la semana del 6to grado A.', '2026-03-11 10:05:00', 1),
(1, 2, 'Respuesta sobre el horario de recuperacion', 'Por favor confirmar la clase de recuperacion del dia jueves a las 11:00 am.', '2026-03-12 09:00:00', 0);

INSERT INTO mensajes (remitente_id, destinatario_ugel_id, asunto, cuerpo, fecha, leido) VALUES
(1, 1, 'Informe academico del periodo 2026-1', 'Adjuntamos el informe de gestion academica correspondiente al periodo 2026-1.', '2026-03-13 10:30:00', 0);

-- ------------------------------------------------------- plantillas UGEL
INSERT INTO plantillas_ugel (id, nombre, contenido_html) VALUES
(1, 'Oficio de informe de gestion academica',
 '<h2 style="text-align:center">OFICIO DE INFORME</h2>
  <p><strong>Señor/a:</strong> Director(a) de la {{institucion}}</p>
  <p><strong>Asunto:</strong> Informe de gestion academica del periodo lectivo {{periodo}}</p>
  <p>Estimado(a) {{director}}, por medio de la presente remitimos el informe correspondiente al periodo indicado para su conocimiento y fines.</p>'),
(2, 'Solicitud de apoyo para implementacion tecnologica',
 '<h2 style="text-align:center">SOLICITUD DE APOYO</h2>
  <p><strong>Institucion:</strong> {{institucion}}</p>
  <p><strong>Fecha:</strong> {{fecha}}</p>
  <p>Estimado(a) {{director}}, solicitamos el apoyo pertinente para la mejora de los recursos tecnologicos de nuestra institucion.</p>');

-- ---------------------------------------------------------------- pagos
-- 30 estudiantes x 5 meses del periodo (2026-03 a 2026-07), monto 350.00
-- Se marca 'pendiente' de forma deterministica para generar morosidad (~15%).
INSERT INTO pagos (estudiante_id, mes, monto, estado)
SELECT e.id,
       CONCAT('2026-', LPAD(m.num, 2, '0')),
       350.00,
       CASE WHEN MOD(e.id * 3 + m.num, 9) = 0 THEN 'pendiente' ELSE 'pagado' END
FROM estudiantes e
CROSS JOIN (SELECT 3 AS num UNION ALL SELECT 4 UNION ALL SELECT 5
            UNION ALL SELECT 6 UNION ALL SELECT 7) m;

-- --------------------------------------------------------- asistencias
-- Registro de muestra: curso 1 (5to A) en dos fechas
INSERT INTO asistencias (curso_id, estudiante_id, fecha, estado, registrado_por) VALUES
(1, 1,  '2026-03-09', 'presente',    2),
(1, 2,  '2026-03-09', 'falta',       2),
(1, 3,  '2026-03-09', 'tardanza',    2),
(1, 4,  '2026-03-09', 'presente',    2),
(1, 5,  '2026-03-09', 'justificada', 2),
(1, 6,  '2026-03-09', 'presente',    2),
(1, 1,  '2026-03-10', 'presente',    2),
(1, 2,  '2026-03-10', 'justificada', 2),
(1, 3,  '2026-03-10', 'presente',    2),
(1, 4,  '2026-03-10', 'falta',       2),
(1, 5,  '2026-03-10', 'presente',    2),
(1, 6,  '2026-03-10', 'presente',    2);