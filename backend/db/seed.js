'use strict';

/**
 * Crea la base de datos y carga los datos de prueba.
 * Ejecutar con: npm run seed
 */

const bcrypt = require('bcryptjs');
const db = require('../src/db-sqlite');

const claveDocente = bcrypt.hashSync('Docente123*', 10);
const claveDirector = bcrypt.hashSync('Director123*', 10);

function sembrar() {
  const bd = db.obtener();
  bd.exec('PRAGMA foreign_keys = OFF');

  const insertar = (sql, filas) => {
    const sentencia = bd.prepare(sql);
    const lote = bd.transaction((registros) => registros.forEach((fila) => sentencia.run(fila)));
    lote(filas);
  };

  // Limpieza en orden inverso a las dependencias
  bd.exec(`
    DROP TABLE IF EXISTS asistencias; DROP TABLE IF EXISTS pagos;
    DROP TABLE IF EXISTS mensajes; DROP TABLE IF EXISTS incidencias;
    DROP TABLE IF EXISTS evaluaciones_docentes; DROP TABLE IF EXISTS horarios;
    DROP TABLE IF EXISTS cursos; DROP TABLE IF EXISTS estudiantes;
    DROP TABLE IF EXISTS docentes; DROP TABLE IF EXISTS usuarios;
    DROP TABLE IF EXISTS roles; DROP TABLE IF EXISTS plantillas_ugel;
    DROP TABLE IF EXISTS parametros_economicos; DROP TABLE IF EXISTS ugel_contactos;
  `);

  db.aplicarSchema();

  insertar('INSERT INTO roles (id, nombre, descripcion) VALUES (?, ?, ?)', [
    [1, 'DOCENTE', 'Docente de aula: cursos, horarios, asistencia e incidencias'],
    [2, 'DIRECTOR', 'Directivo: incidencias, evaluacion docente, cursos y economia'],
  ]);

  insertar(
    `INSERT INTO usuarios (id, rol_id, usuario, password_hash, nombres, apellidos, email, telefono, activo)
     VALUES (@id, @rol_id, @usuario, @password_hash, @nombres, @apellidos, @email, @telefono, @activo)`,
    [
      { id: 1, rol_id: 2, usuario: 'director', password_hash: claveDirector, nombres: 'María', apellidos: 'Fernández Caisa', email: 'director@sagradocorazon.edu.pe', telefono: '900111222', activo: 1 },
      { id: 2, rol_id: 1, usuario: 'docente', password_hash: claveDocente, nombres: 'Carlos', apellidos: 'Quispe Rojas', email: 'cquispe@sagradocorazon.edu.pe', telefono: '900222333', activo: 1 },
      { id: 3, rol_id: 1, usuario: 'jramirez', password_hash: claveDocente, nombres: 'Lucía', apellidos: 'Ramírez Díaz', email: 'lramirez@sagradocorazon.edu.pe', telefono: '900222444', activo: 1 },
      { id: 4, rol_id: 1, usuario: 'mflores', password_hash: claveDocente, nombres: 'Jorge', apellidos: 'Flores Aguilar', email: 'jflores@sagradocorazon.edu.pe', telefono: '900222555', activo: 1 },
    ],
  );

  insertar('INSERT INTO docentes (id, usuario_id, dni, especialidad, sueldo) VALUES (?, ?, ?, ?, ?)', [
    [1, 2, '45218763', 'Programación y Multimedia', 1800],
    [2, 3, '48125374', 'Matemáticas', 1600],
    [3, 4, '70918452', 'Lengua y Comunicación', 1500],
  ]);

  const nombres = ['Ana', 'Luis', 'María', 'José', 'Lucía', 'Diego', 'Rosa', 'Carlos', 'Sofía', 'Andrés',
    'Karla', 'Pedro', 'Elena', 'Miguel', 'Milagros', 'Renzo', 'Gabriela', 'Iván', 'Nicole', 'Santiago',
    'Camila', 'Sebastián', 'Fernanda', 'Bruno', 'Valeria', 'Alonso', 'Tatiana', 'Horacio', 'Lourdes', 'Wilson'];
  const apellidos = ['Gamarra Ruiz', 'Chávez Paredes', 'Torres Mejía', 'Alvarado Sequeira', 'Castro Mendoza',
    'Ramírez Silva', 'Espinoza Lara', 'Muñarriz Vega', 'Bermúdez Gil', 'Quiroz Medina',
    'Ayala Ponce', 'Salazar Yupanqui', 'Rojas Alvarado', 'Córdova Sánchez', 'Damián Núñez', 'Palomino Vega',
    'Tapia Oblando', 'Gutiérrez Arana', 'Pérez Alvarado', 'Ledesma Quiroz',
    'Vásquez Ríos', 'Moro Cornejo', 'Zapata Huerta', 'Condori Mamani', 'Reyes Bravo',
    'Pinedo Salcedo', 'Castro Miranda', 'Bustamante Díaz', 'Chira Arteaga', 'Farías Niquen'];

  insertar(
    'INSERT INTO estudiantes (id, dni, nombres, apellidos, grado, seccion) VALUES (?, ?, ?, ?, ?, ?)',
    nombres.map((nombre, i) => [
      i + 1,
      `73120${String(548 + i).padStart(3, '0')}`,
      nombre,
      apellidos[i],
      i < 15 ? '5to' : '6to',
      i % 2 === 0 ? (i < 15 ? 'A' : 'A') : 'B',
    ]),
  );

  insertar('INSERT INTO cursos (id, nombre, grado, seccion, periodo, docente_id) VALUES (?, ?, ?, ?, ?, ?)', [
    [1, 'Programación Gráfica y Multimedia I', '5to', 'A', '2026-1', 1],
    [2, 'Programación Gráfica y Multimedia I', '5to', 'B', '2026-1', 1],
    [3, 'Matemática', '6to', 'A', '2026-1', 2],
    [4, 'Lengua y Comunicación', '6to', 'A', '2026-1', 3],
    [5, 'Lengua y Comunicación', '6to', 'B', '2026-1', 3],
  ]);

  insertar(
    'INSERT INTO horarios (curso_id, dia, hora_inicio, hora_fin, aula) VALUES (?, ?, ?, ?, ?)',
    [
      [1, 1, '07:00', '08:30', 'A-201'], [1, 3, '09:00', '10:30', 'Lab-Computo'],
      [2, 2, '07:00', '08:30', 'A-201'], [2, 4, '09:00', '10:30', 'Lab-Computo'],
      [3, 1, '09:00', '10:30', 'B-102'], [3, 5, '07:00', '08:30', 'B-102'],
      [4, 2, '09:00', '10:30', 'A-103'], [4, 4, '07:00', '08:30', 'A-103'],
      [5, 3, '07:00', '08:30', 'A-104'], [5, 5, '09:00', '10:30', 'A-104'],
    ],
  );

  insertar(
    `INSERT INTO incidencias (estudiante_id, docente_id, tipo, descripcion, fecha, estado, respuesta_director, fecha_respuesta)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      [2, 1, 'conducta', 'Discusión con compañero durante el desarrollo de la clase.', '2026-03-03', 'resuelta', 'Se conversó con el tutor del aula. Comportamiento en mejora.', '2026-03-04 09:15:00'],
      [6, 1, 'asistencia', 'Ausencia injustificada por tres días consecutivos.', '2026-03-05', 'en_proceso', null, null],
      [11, 2, 'rendimiento', 'Bajo rendimiento en operaciones algebraicas; no entrega tareas.', '2026-03-06', 'pendiente', null, null],
      [19, 3, 'conducta', 'Uso de celular en clase de forma reiterada.', '2026-03-09', 'pendiente', null, null],
      [27, 3, 'otro', 'Entregó el trabajo de comunicación con datos incompletos y fuera de fecha.', '2026-03-11', 'resuelta', 'Se reprogramó la exposición grupal.', '2026-03-12 11:40:00'],
    ],
  );

  insertar(
    'INSERT INTO evaluaciones_docentes (docente_id, director_id, puntaje, observaciones, fecha) VALUES (?, ?, ?, ?, ?)',
    [
      [1, 1, 5, 'Excelente manejo de aula y uso del laboratorio de cómputo.', '2026-03-02'],
      [1, 1, 4, 'Cumple con la programación establecida y sus clases son puntuales.', '2026-04-02'],
      [2, 1, 4, 'Buen manejo de los materiales de matemática.', '2026-03-02'],
      [3, 1, 3, 'Debe mejorar la evaluación de tareas y la participación de los estudiantes.', '2026-03-07'],
    ],
  );

  insertar(
    'INSERT INTO ugel_contactos (id, nombre, cargo, email, telefono, direccion) VALUES (?, ?, ?, ?, ?, ?)',
    [[1, 'UGEL Chiclayo', 'Oficina de Innovación Educativa', 'ugel.chiclayo@educacion.gob.pe', '900333444', 'Av. Balta 1200, Chiclayo']],
  );

  insertar(
    `INSERT INTO mensajes (remitente_id, destinatario_id, asunto, cuerpo, fecha, leido)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      [2, 1, 'Solicitud de material para el laboratorio', 'Estimada señora, necesito un proyector adicional para el laboratorio de cómputo del 5to grado.', '2026-03-10 08:20:00', 1],
      [3, 1, 'Reporte de asistencia de 6to A', 'Adjunto el detalle de asistencias de la semana del 6to grado A.', '2026-03-11 10:05:00', 1],
      [1, 2, 'Respuesta sobre el horario de recuperación', 'Por favor confirmar la clase de recuperación del día jueves a las 11:00 a.m.', '2026-03-12 09:00:00', 0],
    ],
  );

  insertar(
    'INSERT INTO mensajes (remitente_id, destinatario_ugel_id, asunto, cuerpo, fecha, leido) VALUES (?, ?, ?, ?, ?, ?)',
    [[1, 1, 'Informe académico del periodo 2026-1', 'Adjuntamos el informe de gestión académica correspondiente al periodo 2026-1.', '2026-03-13 10:30:00', 0]],
  );

  insertar('INSERT INTO plantillas_ugel (id, nombre, contenido_html) VALUES (?, ?, ?)', [
    [1, 'Oficio de informe de gestión académica', '<h2 style="text-align:center">OFICIO DE INFORME</h2>\n  <p><strong>Señor/a:</strong> Director(a) de la {{institucion}}</p>\n  <p><strong>Asunto:</strong> Informe de gestión académica del periodo lectivo {{periodo}}</p>\n  <p>Estimado(a) {{director}}, por medio de la presente remitimos el informe correspondiente al periodo indicado para su conocimiento y fines.</p>'],
    [2, 'Solicitud de apoyo para implementación tecnológica', '<h2 style="text-align:center">SOLICITUD DE APOYO</h2>\n  <p><strong>Institución:</strong> {{institucion}}</p>\n  <p><strong>Fecha:</strong> {{fecha}}</p>\n  <p>Estimado(a) {{director}}, solicitamos el apoyo pertinente para la mejora de los recursos tecnológicos de nuestra institución.</p>'],
    [3, 'Acta de reunión de padres', '<h2 style="text-align:center">ACTA DE REUNIÓN</h2>\n  <p><strong>Institución:</strong> {{institucion}}</p>\n  <p><strong>Fecha:</strong> {{fecha}}</p>\n  <p>Se deja constancia de la reunión de padres de familia …… realizada en las instalaciones de la {{institucion}}, hasta el acta.</p>'],
  ]);

  insertar(
    'INSERT INTO parametros_economicos (id, pension_mensual, num_estudiantes, gastos_operativos, meses) VALUES (1, ?, ?, ?, ?)',
    [[350, 30, 4500, 5]],
  );

  // Pagos: 30 estudiantes x 5 meses del periodo, con morosidad determinista (~15%)
  const pagos = [];
  for (let estudiante = 1; estudiante <= 30; estudiante += 1) {
    for (let mes = 3; mes <= 7; mes += 1) {
      pagos.push([
        estudiante,
        `2026-${String(mes).padStart(2, '0')}`,
        350,
        (estudiante * 3 + mes) % 9 === 0 ? 'pendiente' : 'pagado',
      ]);
    }
  }
  insertar('INSERT INTO pagos (estudiante_id, mes, monto, estado) VALUES (?, ?, ?, ?)', pagos);

  // Asistencias de muestra del curso 1 en dos fechas
  const asistencias = [
    [1, '2026-03-09', ['presente', 'falta', 'tardanza', 'presente', 'justificada', 'presente']],
    [1, '2026-03-10', ['presente', 'justificada', 'presente', 'falta', 'presente', 'presente']],
  ];
  const listaAsistencias = [];
  asistencias.forEach(([curso, fecha, estados]) => {
    estados.forEach((estado, i) => listaAsistencias.push([curso, i * 2 + 1, fecha, estado, 2]));
  });
  insertar(
    'INSERT INTO asistencias (curso_id, estudiante_id, fecha, estado, registrado_por) VALUES (?, ?, ?, ?, ?)',
    listaAsistencias,
  );

  bd.exec('PRAGMA foreign_keys = ON');
  db.cerrar();
}

sembrar();
console.log('Base de datos creada y datos de prueba cargados.');
console.log('Cuentas: director / Director123*   |   docente / Docente123*');