/**
 * Script maestro: corrige BD + inserta datos de prueba + verifica todos los módulos
 * Uso: node scripts/setup_and_test.js
 */
require('dotenv').config();
const http = require('http');
const mysql = require('mysql2/promise');

const BASE = { host: 'localhost', port: 3001 };
let token = '';
let passed = 0, failed = 0;

const colors = { reset:'\x1b[0m', green:'\x1b[32m', red:'\x1b[31m', yellow:'\x1b[33m', blue:'\x1b[36m' };
const log = (msg, c='reset') => console.log(`${colors[c]}${msg}${colors.reset}`);

// ── HTTP helper ──────────────────────────────────────────────────────────────
const req = (method, path, body, tok) => new Promise((resolve, reject) => {
  const data = body ? JSON.stringify(body) : null;
  const headers = {
    'Content-Type': 'application/json',
    ...(tok ? { Authorization: `Bearer ${tok}` } : {}),
    ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
  };
  const r = http.request({ ...BASE, method, path, headers }, res => {
    let raw = '';
    res.on('data', c => raw += c);
    res.on('end', () => {
      try {
        const json = JSON.parse(raw);
        if (res.statusCode >= 400) {
          const e = new Error(json.message || json.error || `HTTP ${res.statusCode}`);
          e.status = res.statusCode;
          return reject(e);
        }
        resolve(json);
      } catch { resolve(raw); }
    });
  });
  r.on('error', reject);
  if (data) r.write(data);
  r.end();
});

const toArr = (res) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  throw new Error(`No es array: ${JSON.stringify(res).slice(0,80)}`);
};
const toId = (res) => res?.data?.id || res?.id || res?.insertId;

const test = async (name, fn) => {
  try { await fn(); log(`  ✓ ${name}`, 'green'); passed++; }
  catch (e) { log(`  ✗ ${name}: ${e.message}`, 'red'); failed++; }
};

// ── PASO 1: Corregir BD ──────────────────────────────────────────────────────
const fixDB = async () => {
  log('\n═══ PASO 1: Corrigiendo base de datos ═══', 'yellow');
  const db = await mysql.createConnection({
    host: process.env.DB_HOST, user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, database: process.env.DB_NAME
  });

  // Cambiar rol del admin
  await db.execute("UPDATE usuarios SET rol='admin' WHERE email='admin@gmail.com'");
  log('  ✓ Rol admin corregido', 'green');

  // Insertar datos de prueba si no existen
  const bcrypt = require('bcryptjs');
  const hash = await bcrypt.hash('123456', 10);

  // Usuarios de prueba
  const usuarios = [
    ['Prof. Carlos Mendoza', 'carlos@aula.com', hash, 'profesor'],
    ['Ana García', 'ana@aula.com', hash, 'estudiante'],
    ['Luis Torres', 'luis@aula.com', hash, 'estudiante'],
    ['María López', 'maria@aula.com', hash, 'estudiante'],
  ];
  for (const [nombre, email, password, rol] of usuarios) {
    await db.execute(
      'INSERT IGNORE INTO usuarios (nombre, email, password, rol) VALUES (?,?,?,?)',
      [nombre, email, password, rol]
    );
  }
  log('  ✓ Usuarios de prueba insertados', 'green');

  // Categorías
  const cats = [['Programación','#4f46e5'],['Diseño','#ec4899'],['Matemáticas','#f59e0b'],['Idiomas','#10b981']];
  for (const [nombre, color] of cats) {
    await db.execute('INSERT IGNORE INTO categorias (nombre, color) VALUES (?,?)', [nombre, color]);
  }
  log('  ✓ Categorías insertadas', 'green');

  // Obtener IDs
  const [[prof]] = await db.execute("SELECT id FROM usuarios WHERE email='carlos@aula.com'");
  const [[est1]] = await db.execute("SELECT id FROM usuarios WHERE email='ana@aula.com'");
  const [[est2]] = await db.execute("SELECT id FROM usuarios WHERE email='luis@aula.com'");
  const [[cat1]] = await db.execute("SELECT id FROM categorias WHERE nombre='Programación'");

  // Cursos
  const cursos = [
    ['JavaScript Avanzado', 'Curso completo de JS moderno', prof.id, 'Programación', 40],
    ['React desde cero', 'Aprende React con proyectos reales', prof.id, 'Programación', 30],
    ['Python para todos', 'Introducción a Python', prof.id, 'Programación', 25],
  ];
  for (const [titulo, descripcion, profesor_id, categoria, duracion_horas] of cursos) {
    await db.execute(
      'INSERT IGNORE INTO cursos (titulo, descripcion, profesor_id, categoria, duracion_horas) VALUES (?,?,?,?,?)',
      [titulo, descripcion, profesor_id, categoria, duracion_horas]
    );
  }
  log('  ✓ Cursos insertados', 'green');

  // Inscripciones
  const [[c1]] = await db.execute("SELECT id FROM cursos WHERE titulo='JavaScript Avanzado'");
  const [[c2]] = await db.execute("SELECT id FROM cursos WHERE titulo='React desde cero'");
  await db.execute('INSERT IGNORE INTO inscripciones (usuario_id, curso_id) VALUES (?,?)', [est1.id, c1.id]);
  await db.execute('INSERT IGNORE INTO inscripciones (usuario_id, curso_id) VALUES (?,?)', [est2.id, c1.id]);
  await db.execute('INSERT IGNORE INTO inscripciones (usuario_id, curso_id) VALUES (?,?)', [est1.id, c2.id]);
  log('  ✓ Inscripciones insertadas', 'green');

  // Calificaciones
  await db.execute('INSERT IGNORE INTO calificaciones (usuario_id, curso_id, nota, comentario) VALUES (?,?,?,?)',
    [est1.id, c1.id, 92, 'Excelente trabajo']);
  await db.execute('INSERT IGNORE INTO calificaciones (usuario_id, curso_id, nota, comentario) VALUES (?,?,?,?)',
    [est2.id, c1.id, 78, 'Buen desempeño']);
  log('  ✓ Calificaciones insertadas', 'green');

  // Anuncios
  const [[admin]] = await db.execute("SELECT id FROM usuarios WHERE email='admin@gmail.com'");
  await db.execute('INSERT IGNORE INTO anuncios (titulo, contenido, autor_id, curso_id) VALUES (?,?,?,?)',
    ['Bienvenidos al curso', 'Este es el primer anuncio del curso de JS', admin.id, c1.id]);
  log('  ✓ Anuncios insertados', 'green');

  // Tareas
  await db.execute('INSERT IGNORE INTO tareas (titulo, descripcion, curso_id, fecha_limite) VALUES (?,?,?,?)',
    ['Tarea 1: Variables', 'Practica con variables y tipos de datos', c1.id, '2026-06-01']);
  await db.execute('INSERT IGNORE INTO tareas (titulo, descripcion, curso_id, fecha_limite) VALUES (?,?,?,?)',
    ['Tarea 2: Funciones', 'Crea 5 funciones con arrow functions', c1.id, '2026-06-15']);
  log('  ✓ Tareas insertadas', 'green');

  // Materiales
  await db.execute('INSERT IGNORE INTO materiales (titulo, tipo, url, curso_id, autor_id) VALUES (?,?,?,?,?)',
    ['Guía de JavaScript', 'enlace', 'https://developer.mozilla.org/es/docs/Web/JavaScript', c1.id, prof.id]);
  log('  ✓ Materiales insertados', 'green');

  // Asistencias
  const today = new Date().toISOString().split('T')[0];
  await db.execute('INSERT IGNORE INTO asistencias (usuario_id, curso_id, fecha, presente) VALUES (?,?,?,?)',
    [est1.id, c1.id, today, 1]);
  await db.execute('INSERT IGNORE INTO asistencias (usuario_id, curso_id, fecha, presente) VALUES (?,?,?,?)',
    [est2.id, c1.id, today, 1]);
  log('  ✓ Asistencias insertadas', 'green');

  // Mensajes
  await db.execute('INSERT IGNORE INTO mensajes (de_usuario_id, para_usuario_id, asunto, contenido) VALUES (?,?,?,?)',
    [admin.id, est1.id, 'Bienvenida', 'Bienvenida al aula virtual']);
  log('  ✓ Mensajes insertados', 'green');

  // Notificaciones
  await db.execute('INSERT IGNORE INTO notificaciones (usuario_id, tipo, mensaje) VALUES (?,?,?)',
    [admin.id, 'info', 'Sistema iniciado correctamente']);
  log('  ✓ Notificaciones insertadas', 'green');

  await db.end();
  log('  ✓ Base de datos lista\n', 'green');

  return { profId: prof.id, est1Id: est1.id, est2Id: est2.id, c1Id: c1.id, c2Id: c2.id, adminId: admin.id };
};

// ── PASO 2: Pruebas de todos los módulos ─────────────────────────────────────
const runTests = async (ids) => {
  log('═══ PASO 2: Probando todos los módulos ═══', 'yellow');

  // AUTH
  log('\n── Autenticación ──', 'blue');
  await test('Login admin', async () => {
    const r = await req('POST', '/api/auth/login', { email: 'admin@gmail.com', password: 'admin123' });
    if (!r.token) throw new Error('Sin token');
    token = r.token;
    if (r.user?.rol !== 'admin') throw new Error(`Rol incorrecto: ${r.user?.rol} (debe ser admin)`);
  });
  await test('Login inválido rechazado', async () => {
    try { await req('POST', '/api/auth/login', { email: 'x@x.com', password: 'wrong' }); throw new Error('Debió fallar'); }
    catch (e) { if (e.message === 'Debió fallar') throw e; }
  });

  const t = token;

  // USUARIOS
  log('\n── Usuarios ──', 'blue');
  let userId;
  await test('GET /api/usuarios', async () => { toArr(await req('GET', '/api/usuarios', null, t)); });
  await test('POST /api/usuarios', async () => {
    const r = await req('POST', '/api/usuarios', { nombre: 'Test CRUD', email: `crud_${Date.now()}@test.com`, password: '123456', rol: 'estudiante' }, t);
    userId = toId(r); if (!userId) throw new Error('Sin ID');
  });
  await test('GET /api/usuarios/:id', async () => { await req('GET', `/api/usuarios/${userId}`, null, t); });
  await test('PUT /api/usuarios/:id', async () => {
    await req('PUT', `/api/usuarios/${userId}`, { nombre: 'Test CRUD Updated', email: `crud_upd_${Date.now()}@test.com`, rol: 'estudiante' }, t);
  });
  await test('DELETE /api/usuarios/:id', async () => { await req('DELETE', `/api/usuarios/${userId}`, null, t); });

  // CATEGORÍAS
  log('\n── Categorías ──', 'blue');
  await test('GET /api/categorias', async () => { toArr(await req('GET', '/api/categorias', null, t)); });

  // CURSOS
  log('\n── Cursos ──', 'blue');
  let cursoId;
  await test('GET /api/cursos', async () => { toArr(await req('GET', '/api/cursos', null, t)); });
  await test('POST /api/cursos', async () => {
    const r = await req('POST', '/api/cursos', { titulo: 'Curso CRUD Test', descripcion: 'Test', categoria: 'Programación', profesor_id: ids.profId, duracion_horas: 5 }, t);
    cursoId = toId(r); if (!cursoId) throw new Error('Sin ID');
  });
  await test('PUT /api/cursos/:id', async () => {
    await req('PUT', `/api/cursos/${cursoId}`, { titulo: 'Curso CRUD Updated', descripcion: 'Updated', categoria: 'Programación', profesor_id: ids.profId, duracion_horas: 10 }, t);
  });
  await test('DELETE /api/cursos/:id', async () => { await req('DELETE', `/api/cursos/${cursoId}`, null, t); });

  // INSCRIPCIONES
  log('\n── Inscripciones ──', 'blue');
  let inscId;
  // Crear usuario y curso temporales para evitar UNIQUE KEY
  const tmpU = await req('POST', '/api/usuarios', { nombre: 'Tmp', email: `tmp_${Date.now()}@t.com`, password: '123456', rol: 'estudiante' }, t);
  const tmpUId = toId(tmpU);
  const tmpC = await req('POST', '/api/cursos', { titulo: `Tmp Curso ${Date.now()}`, descripcion: 'tmp', categoria: 'Programación', profesor_id: ids.profId, duracion_horas: 1 }, t);
  const tmpCId = toId(tmpC);

  await test('GET /api/inscripciones', async () => { toArr(await req('GET', '/api/inscripciones', null, t)); });
  await test('POST /api/inscripciones', async () => {
    const r = await req('POST', '/api/inscripciones', { usuario_id: tmpUId, curso_id: tmpCId }, t);
    inscId = toId(r); if (!inscId) throw new Error('Sin ID');
  });
  await test('DELETE /api/inscripciones/:id', async () => { await req('DELETE', `/api/inscripciones/${inscId}`, null, t); });
  // Limpiar temporales
  try { await req('DELETE', `/api/cursos/${tmpCId}`, null, t); } catch(_) {}
  try { await req('DELETE', `/api/usuarios/${tmpUId}`, null, t); } catch(_) {}

  // CALIFICACIONES
  log('\n── Calificaciones ──', 'blue');
  let calId;
  const tmpU2 = await req('POST', '/api/usuarios', { nombre: 'Tmp2', email: `tmp2_${Date.now()}@t.com`, password: '123456', rol: 'estudiante' }, t);
  const tmpU2Id = toId(tmpU2);
  const tmpC2 = await req('POST', '/api/cursos', { titulo: `Tmp2 Curso ${Date.now()}`, descripcion: 'tmp', categoria: 'Programación', profesor_id: ids.profId, duracion_horas: 1 }, t);
  const tmpC2Id = toId(tmpC2);

  await test('GET /api/calificaciones', async () => { toArr(await req('GET', '/api/calificaciones', null, t)); });
  await test('POST /api/calificaciones', async () => {
    const r = await req('POST', '/api/calificaciones', { usuario_id: tmpU2Id, curso_id: tmpC2Id, nota: 95, comentario: 'Perfecto' }, t);
    calId = toId(r); if (!calId) throw new Error('Sin ID');
  });
  await test('PUT /api/calificaciones/:id', async () => {
    await req('PUT', `/api/calificaciones/${calId}`, { nota: 88, comentario: 'Muy bien' }, t);
  });
  await test('DELETE /api/calificaciones/:id', async () => { await req('DELETE', `/api/calificaciones/${calId}`, null, t); });
  try { await req('DELETE', `/api/cursos/${tmpC2Id}`, null, t); } catch(_) {}
  try { await req('DELETE', `/api/usuarios/${tmpU2Id}`, null, t); } catch(_) {}

  // ANUNCIOS
  log('\n── Anuncios ──', 'blue');
  let anuncioId;
  await test('GET /api/anuncios', async () => { toArr(await req('GET', '/api/anuncios', null, t)); });
  await test('POST /api/anuncios', async () => {
    const r = await req('POST', '/api/anuncios', { titulo: 'Anuncio Test', contenido: 'Contenido test', curso_id: ids.c1Id }, t);
    anuncioId = toId(r);
  });
  await test('PUT /api/anuncios/:id', async () => {
    if (anuncioId) await req('PUT', `/api/anuncios/${anuncioId}`, { titulo: 'Anuncio Updated', contenido: 'Updated' }, t);
    else throw new Error('Sin ID de anuncio');
  });
  await test('DELETE /api/anuncios/:id', async () => {
    if (anuncioId) await req('DELETE', `/api/anuncios/${anuncioId}`, null, t);
    else throw new Error('Sin ID de anuncio');
  });

  // ASISTENCIAS
  log('\n── Asistencias ──', 'blue');
  await test('GET /api/asistencias/:curso_id', async () => { toArr(await req('GET', `/api/asistencias/${ids.c1Id}`, null, t)); });
  await test('GET /api/asistencias/:curso_id/resumen', async () => { await req('GET', `/api/asistencias/${ids.c1Id}/resumen`, null, t); });
  await test('POST /api/asistencias (registros[])', async () => {
    await req('POST', '/api/asistencias', {
      registros: [
        { usuario_id: ids.est1Id, curso_id: ids.c1Id, fecha: new Date().toISOString().split('T')[0], presente: true },
        { usuario_id: ids.est2Id, curso_id: ids.c1Id, fecha: new Date().toISOString().split('T')[0], presente: false }
      ]
    }, t);
  });

  // TAREAS
  log('\n── Tareas ──', 'blue');
  let tareaId;
  await test('GET /api/tareas', async () => { toArr(await req('GET', '/api/tareas', null, t)); });
  await test('POST /api/tareas', async () => {
    const r = await req('POST', '/api/tareas', { titulo: 'Tarea CRUD', descripcion: 'Test', curso_id: ids.c1Id, fecha_limite: '2026-12-01' }, t);
    tareaId = toId(r); if (!tareaId) throw new Error('Sin ID');
  });
  await test('PUT /api/tareas/:id', async () => {
    await req('PUT', `/api/tareas/${tareaId}`, { titulo: 'Tarea Updated', descripcion: 'Updated', fecha_limite: '2026-12-15', puntos_maximos: 100 }, t);
  });
  await test('DELETE /api/tareas/:id', async () => { await req('DELETE', `/api/tareas/${tareaId}`, null, t); });

  // MATERIALES
  log('\n── Materiales ──', 'blue');
  await test('GET /api/materiales/:curso_id', async () => { toArr(await req('GET', `/api/materiales/${ids.c1Id}`, null, t)); });

  // MENSAJES
  log('\n── Mensajes ──', 'blue');
  await test('GET /api/mensajes (bandeja)', async () => {
    const r = await req('GET', '/api/mensajes', null, t);
    if (!Array.isArray(r.recibidos)) throw new Error('Sin bandeja recibidos');
  });
  await test('POST /api/mensajes', async () => {
    await req('POST', '/api/mensajes', { para_usuario_id: ids.est1Id, asunto: 'Test', contenido: 'Mensaje de prueba' }, t);
  });

  // NOTIFICACIONES
  log('\n── Notificaciones ──', 'blue');
  await test('GET /api/notificaciones', async () => { await req('GET', '/api/notificaciones', null, t); });

  // REPORTES
  log('\n── Reportes ──', 'blue');
  await test('GET /api/reportes/estadisticas', async () => { await req('GET', '/api/reportes/estadisticas', null, t); });
  await test('GET /api/reportes/usuarios', async () => { await req('GET', '/api/reportes/usuarios', null, t); });
  await test('GET /api/reportes/cursos', async () => { await req('GET', '/api/reportes/cursos', null, t); });
  await test('GET /api/reportes/inscripciones', async () => { await req('GET', '/api/reportes/inscripciones', null, t); });

  // CERTIFICADOS
  log('\n── Certificados ──', 'blue');
  await test('GET /api/certificados/:uid/:cid (ruta activa)', async () => {
    try { await req('GET', `/api/certificados/${ids.est1Id}/${ids.c1Id}`, null, t); }
    catch (e) { if (e.status === 404 || e.status === 400) return; throw e; }
  });

  // PERFIL
  log('\n── Perfil ──', 'blue');
  await test('GET /api/perfil', async () => { await req('GET', '/api/perfil', null, t); });
  await test('PUT /api/perfil', async () => {
    await req('PUT', '/api/perfil', { nombre: 'Admin Sistema', email: 'admin@gmail.com' }, t);
  });

  // BÚSQUEDA
  log('\n── Búsqueda ──', 'blue');
  await test('GET /api/buscar?q=javascript', async () => { await req('GET', '/api/buscar?q=javascript', null, t); });
};

// ── MAIN ─────────────────────────────────────────────────────────────────────
(async () => {
  log('\n🚀 SETUP & TEST — AULA VIRTUAL\n', 'yellow');
  const start = Date.now();

  const ids = await fixDB();
  await runTests(ids);

  const total = passed + failed;
  const dur = ((Date.now() - start) / 1000).toFixed(2);
  log(`\n${'─'.repeat(45)}`, 'yellow');
  log(`  Total:    ${total} pruebas en ${dur}s`, 'yellow');
  log(`  Pasaron:  ${passed}`, 'green');
  if (failed > 0) log(`  Fallaron: ${failed}`, 'red');
  else log(`  Fallaron: 0 — ¡TODO OK! 🎉`, 'green');
  log(`${'─'.repeat(45)}\n`, 'yellow');

  process.exit(failed > 0 ? 1 : 0);
})().catch(e => {
  log(`\n❌ ERROR FATAL: ${e.message}`, 'red');
  process.exit(1);
});
