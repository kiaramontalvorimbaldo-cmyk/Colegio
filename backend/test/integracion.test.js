'use strict';
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'scj-test-'));
process.env.DB_DRIVER = 'sqlite';
process.env.DB_PATH = path.join(dir, 'test.db');
process.env.JWT_SECRET = 'clave-aislada-de-pruebas-123456789';
require('node:child_process').execFileSync(process.execPath, [path.join(__dirname, '../db/seed.js')], { env: process.env });
const app = require('../src/app');
const db = require('../src/db');
let server, base, director, docente;
async function api(ruta, token, metodo = 'GET', cuerpo) {
 const r = await fetch(base + ruta, { method: metodo, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, ...(cuerpo === undefined ? {} : { body: JSON.stringify(cuerpo) }) });
 const data = await r.json();
 return { status: r.status, ...data };
}
before(async () => {
 server = app.listen(0, '127.0.0.1'); await new Promise(resolve => server.once('listening', resolve));
 base = 'http://127.0.0.1:' + server.address().port + '/api';
 director = (await api('/auth/login', null, 'POST', { usuario: 'director', clave: 'Director123*' })).datos.token;
 docente = (await api('/auth/login', null, 'POST', { usuario: 'docente', clave: 'Docente123*' })).datos.token;
});
after(async () => { await new Promise(resolve => server.close(resolve)); await db.cerrar(); fs.rmSync(dir, { recursive: true }); });
test('login y permisos de ambos perfiles', async () => {
 assert.ok(director); assert.ok(docente);
 assert.equal((await api('/docentes', docente)).status, 403);
 assert.equal((await api('/asistencias?curso_id=1&fecha=2026-10-15', director)).status, 403);
 assert.equal((await api('/docentes')).status, 401);
 assert.equal((await api('/auth/yo', docente)).datos.usuario, 'docente');
});
for (const ruta of ['/director/resumen', '/docentes', '/evaluaciones', '/cursos', '/horarios', '/incidencias', '/mensajes', '/ugel/contactos', '/plantillas', '/plantillas/1/generar', '/economia/resumen']) {
 test('director consulta ' + ruta, async () => { const r = await api(ruta, director); assert.equal(r.status, 200, JSON.stringify(r)); assert.equal(r.ok, true); });
}
for (const ruta of ['/docente/perfil', '/docente/cursos', '/docente/horario', '/docente/estudiantes', '/docente/reportes', '/incidencias', '/mensajes', '/asistencias?curso_id=1&fecha=2026-10-15']) {
 test('docente consulta ' + ruta, async () => { const r = await api(ruta, docente); assert.equal(r.status, 200, JSON.stringify(r)); assert.equal(r.ok, true); });
}
test('mensaje del director llega al usuario del docente y puede marcarse leido', async () => {
 const enviado = await api('/mensajes', director, 'POST', { destinatario_id: 1, asunto: 'Prueba de destinatario', cuerpo: 'Mensaje completo de prueba' });
 assert.equal(enviado.status, 201); assert.equal(enviado.datos.destinatario_id, 2);
 const bandeja = await api('/mensajes?carpeta=recibidos', docente);
 assert.ok(bandeja.datos.mensajes.some(m => m.id === enviado.datos.id));
 assert.equal((await api('/mensajes/' + enviado.datos.id + '/leido', director, 'PUT', {})).status, 404);
 assert.equal((await api('/mensajes/' + enviado.datos.id + '/leido', docente, 'PUT', {})).status, 200);
 assert.equal((await api('/mensajes?carpeta=enviados', director)).datos.no_leidos, 0);
});
test('asistencia se guarda y actualiza sin duplicar; fechas y alumnos invalidos se rechazan', async () => {
 const cuerpo = { curso_id: 1, fecha: '2026-10-15', registros: [{ estudiante_id: 1, estado: 'presente' }] };
 assert.equal((await api('/asistencias', docente, 'POST', cuerpo)).status, 200);
 cuerpo.registros[0].estado = 'tardanza';
 assert.equal((await api('/asistencias', docente, 'POST', cuerpo)).status, 200);
 const filas = (await api('/asistencias?curso_id=1&fecha=2026-10-15', docente)).datos.estudiantes;
 assert.equal(filas.find(e => e.id === 1).estado, 'tardanza');
 assert.equal((await api('/asistencias', docente, 'POST', { ...cuerpo, fecha: '2026-02-30' })).status, 400);
 assert.equal((await api('/asistencias', docente, 'POST', { ...cuerpo, registros: [{ estudiante_id: 2, estado: 'presente' }] })).status, 400);
});
test('transacciones revierten cambios y no incluyen operaciones concurrentes', async () => {
 let iniciar; const inicio = new Promise(r => iniciar = r);
 const transaccion = db.obtener().transaction(async tx => {
   await tx.prepare('UPDATE usuarios SET nombres = ? WHERE id = ?').run('NO GUARDAR', 2);
   iniciar(); await new Promise(r => setTimeout(r, 10)); throw new Error('rollback');
 });
 const fallo = assert.rejects(transaccion, /rollback/);
 await inicio;
 const fuera = db.obtener().prepare('SELECT nombres FROM usuarios WHERE id = ?').get(2);
 await fallo; assert.equal((await fuera).nombres, 'Carlos');
});
test('alta docente, evaluacion, curso y horario con CRUD', async () => {
 const nuevo = await api('/docentes', director, 'POST', { nombres: 'Prueba', apellidos: 'Integracion', dni: '12345678', especialidad: 'Multimedia', sueldo: 1000 });
 assert.equal(nuevo.status, 201, JSON.stringify(nuevo));
 assert.equal((await api('/auth/login', null, 'POST', { usuario: nuevo.datos.usuario, clave: nuevo.datos.contrasena })).status, 200);
 assert.equal((await api('/evaluaciones', director, 'POST', { docente_id: nuevo.datos.id, puntaje: 4, observaciones: 'Evaluacion de prueba completa', fecha: '2026-10-15' })).status, 201);
 const curso = await api('/cursos', director, 'POST', { nombre: 'Prueba', grado: '5to', seccion: 'A', periodo: '2026-2', docente_id: nuevo.datos.id });
 assert.equal(curso.status, 201);
 const horario = await api('/horarios', director, 'POST', { curso_id: curso.datos.id, dia: 7, hora_inicio: '10:00', hora_fin: '11:00', aula: 'LAB' });
 assert.equal(horario.status, 201);
 assert.equal((await api('/horarios', director, 'POST', { curso_id: curso.datos.id, dia: 7, hora_inicio: '10:30', hora_fin: '11:30', aula: 'OTRA' })).status, 400);
 assert.equal((await api('/horarios', director, 'POST', { curso_id: curso.datos.id, dia: 7, hora_inicio: '25:00', hora_fin: '26:00', aula: 'LAB' })).status, 400);
 assert.equal((await api('/horarios/' + horario.datos.id, director, 'DELETE')).status, 200);
 assert.equal((await api('/cursos/' + curso.datos.id, director, 'DELETE')).status, 200);
});
test('incidencia creada por docente y resuelta por director', async () => {
 const i = await api('/incidencias', docente, 'POST', { estudiante_id: 1, tipo: 'otro', descripcion: 'Incidencia de prueba para verificar el flujo', fecha: '2026-10-15' });
 assert.equal(i.status, 201);
 const r = await api('/incidencias/' + i.datos.id, director, 'PUT', { estado: 'resuelta', respuesta_director: 'Caso revisado y resuelto' });
 assert.equal(r.status, 200); assert.equal(r.datos.estado, 'resuelta');
});
test('balance del periodo descuenta todos los meses y valida parametros', async () => {
 const r = (await api('/economia/resumen', director)).datos;
 assert.equal(r.balance_neto, r.efectiva - (r.planilla + r.gastos_operativos) * r.parametros.meses);
 assert.equal((await api('/economia/parametros', director, 'PUT', { num_estudiantes: 1.5 })).status, 400);
 assert.equal((await api('/economia/parametros', director, 'PUT', { gastos_operativos: 'texto' })).status, 400);
});
test('subida de foto rechaza archivos falsos y acepta PNG', async () => {
 async function subir(bytes, nombre) {
  const form = new FormData(); form.append('foto', new Blob([bytes], { type: 'image/png' }), nombre);
  const r = await fetch(base + '/docente/perfil/foto', { method: 'PUT', headers: { Authorization: 'Bearer ' + docente }, body: form });
  return { status: r.status, data: await r.json() };
 }
 assert.equal((await subir(Buffer.from('no es imagen'), 'falsa.png')).status, 400);
 const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aWQAAAABJRU5ErkJggg==', 'base64');
 const r = await subir(png, 'foto.png'); assert.equal(r.status, 200);
 fs.unlinkSync(path.join(__dirname, '..', r.data.datos.foto));
 const grande = await subir(Buffer.alloc(301 * 1024), 'grande.png');
 assert.equal(grande.status, 400); assert.match(grande.data.mensaje, /300 KB/);
});
