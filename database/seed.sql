-- Datos de prueba (export de backend/db/academico.db)
-- Sistema de Administración Académica - I.E.P. Sagrado Corazón de Jesús
-- Cuentas: director / Director123*   |   docente / Docente123*
PRAGMA foreign_keys = OFF;
BEGIN TRANSACTION;

-- asistencias (12 registros)
INSERT INTO asistencias (id, curso_id, estudiante_id, fecha, estado, registrado_por, creado_en) VALUES (1, 1, 1, '2026-03-09', 'presente', 2, '2026-10-12 03:47:22');
INSERT INTO asistencias (id, curso_id, estudiante_id, fecha, estado, registrado_por, creado_en) VALUES (2, 1, 2, '2026-03-09', 'falta', 2, '2026-10-12 03:47:22');
INSERT INTO asistencias (id, curso_id, estudiante_id, fecha, estado, registrado_por, creado_en) VALUES (3, 1, 3, '2026-03-09', 'tardanza', 2, '2026-10-12 03:47:22');
INSERT INTO asistencias (id, curso_id, estudiante_id, fecha, estado, registrado_por, creado_en) VALUES (4, 1, 4, '2026-03-09', 'presente', 2, '2026-10-12 03:47:22');
INSERT INTO asistencias (id, curso_id, estudiante_id, fecha, estado, registrado_por, creado_en) VALUES (5, 1, 5, '2026-03-09', 'justificada', 2, '2026-10-12 03:47:22');
INSERT INTO asistencias (id, curso_id, estudiante_id, fecha, estado, registrado_por, creado_en) VALUES (6, 1, 6, '2026-03-09', 'presente', 2, '2026-10-12 03:47:22');
INSERT INTO asistencias (id, curso_id, estudiante_id, fecha, estado, registrado_por, creado_en) VALUES (7, 1, 1, '2026-03-10', 'presente', 2, '2026-10-12 03:47:22');
INSERT INTO asistencias (id, curso_id, estudiante_id, fecha, estado, registrado_por, creado_en) VALUES (8, 1, 2, '2026-03-10', 'justificada', 2, '2026-10-12 03:47:22');
INSERT INTO asistencias (id, curso_id, estudiante_id, fecha, estado, registrado_por, creado_en) VALUES (9, 1, 3, '2026-03-10', 'presente', 2, '2026-10-12 03:47:22');
INSERT INTO asistencias (id, curso_id, estudiante_id, fecha, estado, registrado_por, creado_en) VALUES (10, 1, 4, '2026-03-10', 'falta', 2, '2026-10-12 03:47:22');
INSERT INTO asistencias (id, curso_id, estudiante_id, fecha, estado, registrado_por, creado_en) VALUES (11, 1, 5, '2026-03-10', 'presente', 2, '2026-10-12 03:47:22');
INSERT INTO asistencias (id, curso_id, estudiante_id, fecha, estado, registrado_por, creado_en) VALUES (12, 1, 6, '2026-03-10', 'presente', 2, '2026-10-12 03:47:22');

-- cursos (5 registros)
INSERT INTO cursos (id, nombre, grado, seccion, periodo, docente_id) VALUES (1, 'Programación Gráfica y Multimedia I', '5to', 'A', '2026-1', 1);
INSERT INTO cursos (id, nombre, grado, seccion, periodo, docente_id) VALUES (2, 'Programación Gráfica y Multimedia I', '5to', 'B', '2026-1', 1);
INSERT INTO cursos (id, nombre, grado, seccion, periodo, docente_id) VALUES (3, 'Matemática', '6to', 'A', '2026-1', 2);
INSERT INTO cursos (id, nombre, grado, seccion, periodo, docente_id) VALUES (4, 'Lengua y Comunicación', '6to', 'A', '2026-1', 3);
INSERT INTO cursos (id, nombre, grado, seccion, periodo, docente_id) VALUES (5, 'Lengua y Comunicación', '6to', 'B', '2026-1', 3);

-- docentes (3 registros)
INSERT INTO docentes (id, usuario_id, dni, especialidad, sueldo) VALUES (1, 2, '45218763', 'Programación y Multimedia', 1800);
INSERT INTO docentes (id, usuario_id, dni, especialidad, sueldo) VALUES (2, 3, '48125374', 'Matemáticas', 1600);
INSERT INTO docentes (id, usuario_id, dni, especialidad, sueldo) VALUES (3, 4, '70918452', 'Lengua y Comunicación', 1500);

-- estudiantes (30 registros)
INSERT INTO estudiantes (id, dni, nombres, apellidos, grado, seccion) VALUES (1, '73120548', 'Ana', 'Gamarra Ruiz', '5to', 'A');
INSERT INTO estudiantes (id, dni, nombres, apellidos, grado, seccion) VALUES (2, '73120549', 'Luis', 'Chávez Paredes', '5to', 'B');
INSERT INTO estudiantes (id, dni, nombres, apellidos, grado, seccion) VALUES (3, '73120550', 'María', 'Torres Mejía', '5to', 'A');
INSERT INTO estudiantes (id, dni, nombres, apellidos, grado, seccion) VALUES (4, '73120551', 'José', 'Alvarado Sequeira', '5to', 'B');
INSERT INTO estudiantes (id, dni, nombres, apellidos, grado, seccion) VALUES (5, '73120552', 'Lucía', 'Castro Mendoza', '5to', 'A');
INSERT INTO estudiantes (id, dni, nombres, apellidos, grado, seccion) VALUES (6, '73120553', 'Diego', 'Ramírez Silva', '5to', 'B');
INSERT INTO estudiantes (id, dni, nombres, apellidos, grado, seccion) VALUES (7, '73120554', 'Rosa', 'Espinoza Lara', '5to', 'A');
INSERT INTO estudiantes (id, dni, nombres, apellidos, grado, seccion) VALUES (8, '73120555', 'Carlos', 'Muñarriz Vega', '5to', 'B');
INSERT INTO estudiantes (id, dni, nombres, apellidos, grado, seccion) VALUES (9, '73120556', 'Sofía', 'Bermúdez Gil', '5to', 'A');
INSERT INTO estudiantes (id, dni, nombres, apellidos, grado, seccion) VALUES (10, '73120557', 'Andrés', 'Quiroz Medina', '5to', 'B');
INSERT INTO estudiantes (id, dni, nombres, apellidos, grado, seccion) VALUES (11, '73120558', 'Karla', 'Ayala Ponce', '5to', 'A');
INSERT INTO estudiantes (id, dni, nombres, apellidos, grado, seccion) VALUES (12, '73120559', 'Pedro', 'Salazar Yupanqui', '5to', 'B');
INSERT INTO estudiantes (id, dni, nombres, apellidos, grado, seccion) VALUES (13, '73120560', 'Elena', 'Rojas Alvarado', '5to', 'A');
INSERT INTO estudiantes (id, dni, nombres, apellidos, grado, seccion) VALUES (14, '73120561', 'Miguel', 'Córdova Sánchez', '5to', 'B');
INSERT INTO estudiantes (id, dni, nombres, apellidos, grado, seccion) VALUES (15, '73120562', 'Milagros', 'Damián Núñez', '5to', 'A');
INSERT INTO estudiantes (id, dni, nombres, apellidos, grado, seccion) VALUES (16, '73120563', 'Renzo', 'Palomino Vega', '6to', 'B');
INSERT INTO estudiantes (id, dni, nombres, apellidos, grado, seccion) VALUES (17, '73120564', 'Gabriela', 'Tapia Oblando', '6to', 'A');
INSERT INTO estudiantes (id, dni, nombres, apellidos, grado, seccion) VALUES (18, '73120565', 'Iván', 'Gutiérrez Arana', '6to', 'B');
INSERT INTO estudiantes (id, dni, nombres, apellidos, grado, seccion) VALUES (19, '73120566', 'Nicole', 'Pérez Alvarado', '6to', 'A');
INSERT INTO estudiantes (id, dni, nombres, apellidos, grado, seccion) VALUES (20, '73120567', 'Santiago', 'Ledesma Quiroz', '6to', 'B');
INSERT INTO estudiantes (id, dni, nombres, apellidos, grado, seccion) VALUES (21, '73120568', 'Camila', 'Vásquez Ríos', '6to', 'A');
INSERT INTO estudiantes (id, dni, nombres, apellidos, grado, seccion) VALUES (22, '73120569', 'Sebastián', 'Moro Cornejo', '6to', 'B');
INSERT INTO estudiantes (id, dni, nombres, apellidos, grado, seccion) VALUES (23, '73120570', 'Fernanda', 'Zapata Huerta', '6to', 'A');
INSERT INTO estudiantes (id, dni, nombres, apellidos, grado, seccion) VALUES (24, '73120571', 'Bruno', 'Condori Mamani', '6to', 'B');
INSERT INTO estudiantes (id, dni, nombres, apellidos, grado, seccion) VALUES (25, '73120572', 'Valeria', 'Reyes Bravo', '6to', 'A');
INSERT INTO estudiantes (id, dni, nombres, apellidos, grado, seccion) VALUES (26, '73120573', 'Alonso', 'Pinedo Salcedo', '6to', 'B');
INSERT INTO estudiantes (id, dni, nombres, apellidos, grado, seccion) VALUES (27, '73120574', 'Tatiana', 'Castro Miranda', '6to', 'A');
INSERT INTO estudiantes (id, dni, nombres, apellidos, grado, seccion) VALUES (28, '73120575', 'Horacio', 'Bustamante Díaz', '6to', 'B');
INSERT INTO estudiantes (id, dni, nombres, apellidos, grado, seccion) VALUES (29, '73120576', 'Lourdes', 'Chira Arteaga', '6to', 'A');
INSERT INTO estudiantes (id, dni, nombres, apellidos, grado, seccion) VALUES (30, '73120577', 'Wilson', 'Farías Niquen', '6to', 'B');

-- evaluaciones_docentes (4 registros)
INSERT INTO evaluaciones_docentes (id, docente_id, director_id, puntaje, observaciones, fecha) VALUES (1, 1, 1, 5, 'Excelente manejo de aula y uso del laboratorio de cómputo.', '2026-03-02');
INSERT INTO evaluaciones_docentes (id, docente_id, director_id, puntaje, observaciones, fecha) VALUES (2, 1, 1, 4, 'Cumple con la programación establecida y sus clases son puntuales.', '2026-04-02');
INSERT INTO evaluaciones_docentes (id, docente_id, director_id, puntaje, observaciones, fecha) VALUES (3, 2, 1, 4, 'Buen manejo de los materiales de matemática.', '2026-03-02');
INSERT INTO evaluaciones_docentes (id, docente_id, director_id, puntaje, observaciones, fecha) VALUES (4, 3, 1, 3, 'Debe mejorar la evaluación de tareas y la participación de los estudiantes.', '2026-03-07');

-- horarios (10 registros)
INSERT INTO horarios (id, curso_id, dia, hora_inicio, hora_fin, aula) VALUES (1, 1, 1, '07:00', '08:30', 'A-201');
INSERT INTO horarios (id, curso_id, dia, hora_inicio, hora_fin, aula) VALUES (2, 1, 3, '09:00', '10:30', 'Lab-Computo');
INSERT INTO horarios (id, curso_id, dia, hora_inicio, hora_fin, aula) VALUES (3, 2, 2, '07:00', '08:30', 'A-201');
INSERT INTO horarios (id, curso_id, dia, hora_inicio, hora_fin, aula) VALUES (4, 2, 4, '09:00', '10:30', 'Lab-Computo');
INSERT INTO horarios (id, curso_id, dia, hora_inicio, hora_fin, aula) VALUES (5, 3, 1, '09:00', '10:30', 'B-102');
INSERT INTO horarios (id, curso_id, dia, hora_inicio, hora_fin, aula) VALUES (6, 3, 5, '07:00', '08:30', 'B-102');
INSERT INTO horarios (id, curso_id, dia, hora_inicio, hora_fin, aula) VALUES (7, 4, 2, '09:00', '10:30', 'A-103');
INSERT INTO horarios (id, curso_id, dia, hora_inicio, hora_fin, aula) VALUES (8, 4, 4, '07:00', '08:30', 'A-103');
INSERT INTO horarios (id, curso_id, dia, hora_inicio, hora_fin, aula) VALUES (9, 5, 3, '07:00', '08:30', 'A-104');
INSERT INTO horarios (id, curso_id, dia, hora_inicio, hora_fin, aula) VALUES (10, 5, 5, '09:00', '10:30', 'A-104');

-- incidencias (5 registros)
INSERT INTO incidencias (id, estudiante_id, docente_id, tipo, descripcion, fecha, estado, respuesta_director, fecha_respuesta) VALUES (1, 2, 1, 'conducta', 'Discusión con compañero durante el desarrollo de la clase.', '2026-03-03', 'resuelta', 'Se conversó con el tutor del aula. Comportamiento en mejora.', '2026-03-04 09:15:00');
INSERT INTO incidencias (id, estudiante_id, docente_id, tipo, descripcion, fecha, estado, respuesta_director, fecha_respuesta) VALUES (2, 6, 1, 'asistencia', 'Ausencia injustificada por tres días consecutivos.', '2026-03-05', 'en_proceso', NULL, NULL);
INSERT INTO incidencias (id, estudiante_id, docente_id, tipo, descripcion, fecha, estado, respuesta_director, fecha_respuesta) VALUES (3, 11, 2, 'rendimiento', 'Bajo rendimiento en operaciones algebraicas; no entrega tareas.', '2026-03-06', 'pendiente', NULL, NULL);
INSERT INTO incidencias (id, estudiante_id, docente_id, tipo, descripcion, fecha, estado, respuesta_director, fecha_respuesta) VALUES (4, 19, 3, 'conducta', 'Uso de celular en clase de forma reiterada.', '2026-03-09', 'pendiente', NULL, NULL);
INSERT INTO incidencias (id, estudiante_id, docente_id, tipo, descripcion, fecha, estado, respuesta_director, fecha_respuesta) VALUES (5, 27, 3, 'otro', 'Entregó el trabajo de comunicación con datos incompletos y fuera de fecha.', '2026-03-11', 'resuelta', 'Se reprogramó la exposición grupal.', '2026-03-12 11:40:00');

-- mensajes (4 registros)
INSERT INTO mensajes (id, remitente_id, destinatario_id, destinatario_ugel_id, asunto, cuerpo, fecha, leido) VALUES (1, 2, 1, NULL, 'Solicitud de material para el laboratorio', 'Estimada señora, necesito un proyector adicional para el laboratorio de cómputo del 5to grado.', '2026-03-10 08:20:00', 1);
INSERT INTO mensajes (id, remitente_id, destinatario_id, destinatario_ugel_id, asunto, cuerpo, fecha, leido) VALUES (2, 3, 1, NULL, 'Reporte de asistencia de 6to A', 'Adjunto el detalle de asistencias de la semana del 6to grado A.', '2026-03-11 10:05:00', 1);
INSERT INTO mensajes (id, remitente_id, destinatario_id, destinatario_ugel_id, asunto, cuerpo, fecha, leido) VALUES (3, 1, 2, NULL, 'Respuesta sobre el horario de recuperación', 'Por favor confirmar la clase de recuperación del día jueves a las 11:00 a.m.', '2026-03-12 09:00:00', 0);
INSERT INTO mensajes (id, remitente_id, destinatario_id, destinatario_ugel_id, asunto, cuerpo, fecha, leido) VALUES (4, 1, NULL, 1, 'Informe académico del periodo 2026-1', 'Adjuntamos el informe de gestión académica correspondiente al periodo 2026-1.', '2026-03-13 10:30:00', 0);

-- pagos (150 registros)
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (1, 1, '2026-03', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (2, 1, '2026-04', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (3, 1, '2026-05', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (4, 1, '2026-06', 350, 'pendiente');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (5, 1, '2026-07', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (6, 2, '2026-03', 350, 'pendiente');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (7, 2, '2026-04', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (8, 2, '2026-05', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (9, 2, '2026-06', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (10, 2, '2026-07', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (11, 3, '2026-03', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (12, 3, '2026-04', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (13, 3, '2026-05', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (14, 3, '2026-06', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (15, 3, '2026-07', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (16, 4, '2026-03', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (17, 4, '2026-04', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (18, 4, '2026-05', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (19, 4, '2026-06', 350, 'pendiente');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (20, 4, '2026-07', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (21, 5, '2026-03', 350, 'pendiente');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (22, 5, '2026-04', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (23, 5, '2026-05', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (24, 5, '2026-06', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (25, 5, '2026-07', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (26, 6, '2026-03', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (27, 6, '2026-04', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (28, 6, '2026-05', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (29, 6, '2026-06', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (30, 6, '2026-07', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (31, 7, '2026-03', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (32, 7, '2026-04', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (33, 7, '2026-05', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (34, 7, '2026-06', 350, 'pendiente');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (35, 7, '2026-07', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (36, 8, '2026-03', 350, 'pendiente');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (37, 8, '2026-04', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (38, 8, '2026-05', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (39, 8, '2026-06', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (40, 8, '2026-07', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (41, 9, '2026-03', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (42, 9, '2026-04', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (43, 9, '2026-05', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (44, 9, '2026-06', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (45, 9, '2026-07', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (46, 10, '2026-03', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (47, 10, '2026-04', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (48, 10, '2026-05', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (49, 10, '2026-06', 350, 'pendiente');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (50, 10, '2026-07', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (51, 11, '2026-03', 350, 'pendiente');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (52, 11, '2026-04', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (53, 11, '2026-05', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (54, 11, '2026-06', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (55, 11, '2026-07', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (56, 12, '2026-03', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (57, 12, '2026-04', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (58, 12, '2026-05', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (59, 12, '2026-06', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (60, 12, '2026-07', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (61, 13, '2026-03', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (62, 13, '2026-04', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (63, 13, '2026-05', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (64, 13, '2026-06', 350, 'pendiente');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (65, 13, '2026-07', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (66, 14, '2026-03', 350, 'pendiente');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (67, 14, '2026-04', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (68, 14, '2026-05', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (69, 14, '2026-06', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (70, 14, '2026-07', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (71, 15, '2026-03', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (72, 15, '2026-04', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (73, 15, '2026-05', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (74, 15, '2026-06', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (75, 15, '2026-07', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (76, 16, '2026-03', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (77, 16, '2026-04', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (78, 16, '2026-05', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (79, 16, '2026-06', 350, 'pendiente');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (80, 16, '2026-07', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (81, 17, '2026-03', 350, 'pendiente');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (82, 17, '2026-04', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (83, 17, '2026-05', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (84, 17, '2026-06', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (85, 17, '2026-07', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (86, 18, '2026-03', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (87, 18, '2026-04', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (88, 18, '2026-05', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (89, 18, '2026-06', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (90, 18, '2026-07', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (91, 19, '2026-03', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (92, 19, '2026-04', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (93, 19, '2026-05', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (94, 19, '2026-06', 350, 'pendiente');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (95, 19, '2026-07', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (96, 20, '2026-03', 350, 'pendiente');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (97, 20, '2026-04', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (98, 20, '2026-05', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (99, 20, '2026-06', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (100, 20, '2026-07', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (101, 21, '2026-03', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (102, 21, '2026-04', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (103, 21, '2026-05', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (104, 21, '2026-06', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (105, 21, '2026-07', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (106, 22, '2026-03', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (107, 22, '2026-04', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (108, 22, '2026-05', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (109, 22, '2026-06', 350, 'pendiente');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (110, 22, '2026-07', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (111, 23, '2026-03', 350, 'pendiente');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (112, 23, '2026-04', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (113, 23, '2026-05', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (114, 23, '2026-06', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (115, 23, '2026-07', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (116, 24, '2026-03', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (117, 24, '2026-04', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (118, 24, '2026-05', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (119, 24, '2026-06', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (120, 24, '2026-07', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (121, 25, '2026-03', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (122, 25, '2026-04', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (123, 25, '2026-05', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (124, 25, '2026-06', 350, 'pendiente');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (125, 25, '2026-07', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (126, 26, '2026-03', 350, 'pendiente');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (127, 26, '2026-04', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (128, 26, '2026-05', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (129, 26, '2026-06', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (130, 26, '2026-07', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (131, 27, '2026-03', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (132, 27, '2026-04', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (133, 27, '2026-05', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (134, 27, '2026-06', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (135, 27, '2026-07', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (136, 28, '2026-03', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (137, 28, '2026-04', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (138, 28, '2026-05', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (139, 28, '2026-06', 350, 'pendiente');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (140, 28, '2026-07', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (141, 29, '2026-03', 350, 'pendiente');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (142, 29, '2026-04', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (143, 29, '2026-05', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (144, 29, '2026-06', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (145, 29, '2026-07', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (146, 30, '2026-03', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (147, 30, '2026-04', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (148, 30, '2026-05', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (149, 30, '2026-06', 350, 'pagado');
INSERT INTO pagos (id, estudiante_id, mes, monto, estado) VALUES (150, 30, '2026-07', 350, 'pagado');

-- parametros_economicos (1 registros)
INSERT INTO parametros_economicos (id, pension_mensual, num_estudiantes, gastos_operativos, meses) VALUES (1, 350, 30, 4500, 5);

-- plantillas_ugel (3 registros)
INSERT INTO plantillas_ugel (id, nombre, contenido_html, actualizado_en) VALUES (1, 'Oficio de informe de gestión académica', '<h2 style="text-align:center">OFICIO DE INFORME</h2>
  <p><strong>Señor/a:</strong> Director(a) de la {{institucion}}</p>
  <p><strong>Asunto:</strong> Informe de gestión académica del periodo lectivo {{periodo}}</p>
  <p>Estimado(a) {{director}}, por medio de la presente remitimos el informe correspondiente al periodo indicado para su conocimiento y fines.</p>', '2026-10-12 03:47:22');
INSERT INTO plantillas_ugel (id, nombre, contenido_html, actualizado_en) VALUES (2, 'Solicitud de apoyo para implementación tecnológica', '<h2 style="text-align:center">SOLICITUD DE APOYO</h2>
  <p><strong>Institución:</strong> {{institucion}}</p>
  <p><strong>Fecha:</strong> {{fecha}}</p>
  <p>Estimado(a) {{director}}, solicitamos el apoyo pertinente para la mejora de los recursos tecnológicos de nuestra institución.</p>', '2026-10-12 03:47:22');
INSERT INTO plantillas_ugel (id, nombre, contenido_html, actualizado_en) VALUES (3, 'Acta de reunión de padres', '<h2 style="text-align:center">ACTA DE REUNIÓN</h2>
  <p><strong>Institución:</strong> {{institucion}}</p>
  <p><strong>Fecha:</strong> {{fecha}}</p>
  <p>Se deja constancia de la reunión de padres de familia …… realizada en las instalaciones de la {{institucion}}, hasta el acta.</p>', '2026-10-12 03:47:22');

-- roles (2 registros)
INSERT INTO roles (id, nombre, descripcion) VALUES (1, 'DOCENTE', 'Docente de aula: cursos, horarios, asistencia e incidencias');
INSERT INTO roles (id, nombre, descripcion) VALUES (2, 'DIRECTOR', 'Directivo: incidencias, evaluacion docente, cursos y economia');

-- ugel_contactos (1 registros)
INSERT INTO ugel_contactos (id, nombre, cargo, email, telefono, direccion) VALUES (1, 'UGEL Chiclayo', 'Oficina de Innovación Educativa', 'ugel.chiclayo@educacion.gob.pe', '900333444', 'Av. Balta 1200, Chiclayo');

-- usuarios (4 registros)
INSERT INTO usuarios (id, rol_id, usuario, password_hash, nombres, apellidos, email, telefono, foto, activo, creado_en) VALUES (1, 2, 'director', '$2b$10$ZGEJbsnBntll0emH1rx5Q.xE0Z1Vv8CpenGO1ZkXbzSta5prTEMIm', 'María', 'Fernández Caisa', 'director@sagradocorazon.edu.pe', '900111222', NULL, 1, '2026-10-12 03:47:22');
INSERT INTO usuarios (id, rol_id, usuario, password_hash, nombres, apellidos, email, telefono, foto, activo, creado_en) VALUES (2, 1, 'docente', '$2b$10$4b8CJyDMvWZ98pjui05P8eiZ9vXvmDyRODAuiUKtjHVy3fktA33JW', 'Carlos', 'Quispe Rojas', 'cquispe@sagradocorazon.edu.pe', '900222333', NULL, 1, '2026-10-12 03:47:22');
INSERT INTO usuarios (id, rol_id, usuario, password_hash, nombres, apellidos, email, telefono, foto, activo, creado_en) VALUES (3, 1, 'jramirez', '$2b$10$4b8CJyDMvWZ98pjui05P8eiZ9vXvmDyRODAuiUKtjHVy3fktA33JW', 'Lucía', 'Ramírez Díaz', 'lramirez@sagradocorazon.edu.pe', '900222444', NULL, 1, '2026-10-12 03:47:22');
INSERT INTO usuarios (id, rol_id, usuario, password_hash, nombres, apellidos, email, telefono, foto, activo, creado_en) VALUES (4, 1, 'mflores', '$2b$10$4b8CJyDMvWZ98pjui05P8eiZ9vXvmDyRODAuiUKtjHVy3fktA33JW', 'Jorge', 'Flores Aguilar', 'jflores@sagradocorazon.edu.pe', '900222555', NULL, 1, '2026-10-12 03:47:22');

COMMIT;
PRAGMA foreign_keys = ON;
