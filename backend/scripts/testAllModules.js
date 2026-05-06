/**
 * ============================================================
 *  TEST COMPLETO — Todos los módulos de los 3 dashboards
 *  Ejecutar: node scripts/testAllModules.js
 * ============================================================
 */

const http = require('http');

const BASE = 'http://localhost:3001/api';

// ── Colores para consola ──────────────────────────────────────
const C = {
  reset: '\x1b[0m',
  bold:  '\x1b[1m',
  green: '\x1b[32m',
  red:   '\x1b[31m',
  yellow:'\x1b[33m',
  cyan:  '\x1b[36m',
  gray:  '\x1b[90m',
  blue:  '\x1b[34m',
  magenta:'\x1b[35m',
};

const ok  = (msg) => console.log(`  ${C.green}✅ PASS${C.reset} ${msg}`);
const fail= (msg) => console.log(`  ${C.red}❌ FAIL${C.reset} ${msg}`);
const info= (msg) => console.log(`  ${C.gray}ℹ  ${msg}${C.reset}`);
const section = (title, color = C.cyan) =>
  console.log(`\n${color}${C.bold}${'─'.repeat(55)}\n  ${title}\n${'─'.repeat(55)}${C.reset}`);

let passed = 0, failed = 0, total = 0;

// ── HTTP helper ───────────────────────────────────────────────
function request(method, path, body, token) {
  return new Promise((resolve) => {
    const payload = body ? JSON.stringify(body) : null;
    const options = {
      method,
      hostname: 'localhost',
      port: 3001,
      path: `/api${path}`,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
      },
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', (e) => resolve({ status: 0, body: { error: e.message } }));
    if (payload) req.write(payload);
    req.end();
  });
}

// ── Assertion helper ──────────────────────────────────────────
function assert(label, condition, detail = '') {
  total++;
  if (condition) { passed++; ok(`${label}${detail ? C.gray + '  ' + detail + C.reset : ''}`); }
  else           { failed++; fail(`${label}${detail ? C.gray + '  ' + detail + C.reset : ''}`); }
}

// ═══════════════════════════════════════════════════════════════
async function run() {
  console.log(`\n${C.bold}${C.blue}╔══════════════════════════════════════════════════════╗`);
  console.log(`║     AULA VIRTUAL — TEST SUITE COMPLETO               ║`);
  console.log(`╚══════════════════════════════════════════════════════╝${C.reset}`);

  let adminToken, profesorToken, alumnoToken;
  let cursoId, inscripcionId, calificacionId, tareaId, anuncioId, categoriaId, materialId, mensajeId, notifId;

  // ════════════════════════════════════════════════════════════
  section('🔐  AUTH — Login de los 3 usuarios', C.blue);
  // ════════════════════════════════════════════════════════════

  const loginAdmin = await request('POST', '/auth/login', { email: 'admin@aula.com', password: 'Admin123!' });
  assert('Login Admin', loginAdmin.status === 200 && loginAdmin.body.token, `status ${loginAdmin.status}`);
  adminToken = loginAdmin.body.token;

  const loginProf = await request('POST', '/auth/login', { email: 'profesor@aula.com', password: 'Profesor123!' });
  assert('Login Profesor', loginProf.status === 200 && loginProf.body.token, `status ${loginProf.status}`);
  profesorToken = loginProf.body.token;

  const loginAlumno = await request('POST', '/auth/login', { email: 'alumno@aula.com', password: 'Alumno123!' });
  assert('Login Alumno', loginAlumno.status === 200 && loginAlumno.body.token, `status ${loginAlumno.status}`);
  alumnoToken = loginAlumno.body.token;

  const loginFail = await request('POST', '/auth/login', { email: 'noexiste@x.com', password: 'wrong' });
  assert('Login inválido rechazado', loginFail.status === 401 || loginFail.status === 400, `status ${loginFail.status}`);

  const profile = await request('GET', '/auth/profile', null, adminToken);
  assert('GET /auth/profile (admin)', profile.status === 200, `status ${profile.status}`);

  if (!adminToken || !profesorToken || !alumnoToken) {
    console.log(`\n${C.red}${C.bold}⛔  No se pudo obtener tokens. Abortando.${C.reset}`);
    printSummary(); return;
  }

  // ════════════════════════════════════════════════════════════
  section('👑  ADMIN DASHBOARD', C.magenta);
  // ════════════════════════════════════════════════════════════

  // Usuarios
  info('── Usuarios ──');
  const getUsers = await request('GET', '/usuarios', null, adminToken);
  assert('GET /usuarios (admin)', getUsers.status === 200, `status ${getUsers.status}`);

  const createUser = await request('POST', '/usuarios', { nombre: 'Test User', email: `test_${Date.now()}@test.com`, password: 'Test123!', rol: 'estudiante' }, adminToken);
  assert('POST /usuarios (admin crea usuario)', createUser.status === 201 || createUser.status === 200, `status ${createUser.status}`);
  const testUserId = createUser.body.data?.id || createUser.body.id;

  if (testUserId) {
    const updateUser = await request('PUT', `/usuarios/${testUserId}`, { nombre: 'Test User Updated', rol: 'estudiante' }, adminToken);
    assert('PUT /usuarios/:id (admin actualiza)', updateUser.status === 200, `status ${updateUser.status}`);

    const deleteUser = await request('DELETE', `/usuarios/${testUserId}`, null, adminToken);
    assert('DELETE /usuarios/:id (admin elimina)', deleteUser.status === 200, `status ${deleteUser.status}`);
  } else {
    info('Saltando update/delete usuario (no se obtuvo ID)');
  }

  // Categorías
  info('── Categorías ──');
  const getCats = await request('GET', '/categorias', null, adminToken);
  assert('GET /categorias', getCats.status === 200, `status ${getCats.status}`);

  const createCat = await request('POST', '/categorias', { nombre: `Cat_Test_${Date.now()}`, descripcion: 'Test', color: '#ff0000' }, adminToken);
  assert('POST /categorias (admin)', createCat.status === 201 || createCat.status === 200, `status ${createCat.status}`);
  categoriaId = createCat.body.data?.id || createCat.body.id;

  // Cursos
  info('── Cursos ──');
  const getCursos = await request('GET', '/cursos', null, adminToken);
  assert('GET /cursos', getCursos.status === 200, `status ${getCursos.status}`);

  const profesorId = loginProf.body.user?.id;
  const createCurso = await request('POST', '/cursos', { titulo: 'Curso Test Automatizado', descripcion: 'Test', profesor_id: profesorId, categoria: 'Programación', duracion_horas: 10 }, adminToken);
  assert('POST /cursos (admin)', createCurso.status === 201 || createCurso.status === 200, `status ${createCurso.status}`);
  cursoId = createCurso.body.data?.id || createCurso.body.id;

  if (cursoId) {
    const updateCurso = await request('PUT', `/cursos/${cursoId}`, { titulo: 'Curso Test Actualizado', duracion_horas: 20 }, adminToken);
    assert('PUT /cursos/:id (admin)', updateCurso.status === 200, `status ${updateCurso.status}`);
  }

  // Inscripciones
  info('── Inscripciones ──');
  const getIns = await request('GET', '/inscripciones', null, adminToken);
  assert('GET /inscripciones', getIns.status === 200, `status ${getIns.status}`);

  const alumnoId = loginAlumno.body.user?.id;
  if (cursoId && alumnoId) {
    const createIns = await request('POST', '/inscripciones', { usuario_id: alumnoId, curso_id: cursoId }, adminToken);
    assert('POST /inscripciones (admin)', createIns.status === 201 || createIns.status === 200 || createIns.status === 409, `status ${createIns.status}`);
    inscripcionId = createIns.body.data?.id || createIns.body.id;
  }

  // Calificaciones
  info('── Calificaciones ──');
  const getCals = await request('GET', '/calificaciones', null, adminToken);
  assert('GET /calificaciones', getCals.status === 200, `status ${getCals.status}`);

  if (cursoId && alumnoId) {
    const createCal = await request('POST', '/calificaciones', { usuario_id: alumnoId, curso_id: cursoId, nota: 95, comentario: 'Excelente test' }, adminToken);
    assert('POST /calificaciones (admin)', createCal.status === 201 || createCal.status === 200 || createCal.status === 409, `status ${createCal.status}`);
    calificacionId = createCal.body.data?.id || createCal.body.id;

    if (calificacionId) {
      const updateCal = await request('PUT', `/calificaciones/${calificacionId}`, { nota: 88, comentario: 'Actualizado' }, adminToken);
      assert('PUT /calificaciones/:id (admin)', updateCal.status === 200, `status ${updateCal.status}`);
    }
  }

  // Anuncios
  info('── Anuncios ──');
  const getAnn = await request('GET', '/anuncios', null, adminToken);
  assert('GET /anuncios', getAnn.status === 200, `status ${getAnn.status}`);

  const createAnn = await request('POST', '/anuncios', { titulo: 'Anuncio Test', contenido: 'Contenido de prueba', tipo: 'general' }, adminToken);
  assert('POST /anuncios (admin)', createAnn.status === 201 || createAnn.status === 200, `status ${createAnn.status}`);
  anuncioId = createAnn.body.data?.id || createAnn.body.id;

  if (anuncioId) {
    const updateAnn = await request('PUT', `/anuncios/${anuncioId}`, { titulo: 'Anuncio Actualizado', contenido: 'Nuevo contenido', tipo: 'urgente' }, adminToken);
    assert('PUT /anuncios/:id (admin)', updateAnn.status === 200, `status ${updateAnn.status}`);
  }

  // Reportes
  info('── Reportes ──');
  const stats = await request('GET', '/reportes/estadisticas', null, adminToken);
  assert('GET /reportes/estadisticas', stats.status === 200, `status ${stats.status}`);

  // Buscador
  info('── Buscador ──');
  const buscar = await request('GET', '/buscar?q=curso', null, adminToken);
  assert('GET /buscar?q=curso', buscar.status === 200, `status ${buscar.status}`);

  // ════════════════════════════════════════════════════════════
  section('👨‍🏫  PROFESOR DASHBOARD', C.yellow);
  // ════════════════════════════════════════════════════════════

  // Cursos del profesor
  info('── Cursos ──');
  const profCursos = await request('GET', '/cursos', null, profesorToken);
  assert('GET /cursos (profesor)', profCursos.status === 200, `status ${profCursos.status}`);

  const profCreateCurso = await request('POST', '/cursos', { titulo: 'Curso del Profesor Test', descripcion: 'Test', categoria: 'Diseño', duracion_horas: 15 }, profesorToken);
  assert('POST /cursos (profesor puede crear)', profCreateCurso.status === 201 || profCreateCurso.status === 200, `status ${profCreateCurso.status}`);
  const profCursoId = profCreateCurso.body.data?.id || profCreateCurso.body.id || cursoId;

  // Inscripciones (lectura)
  info('── Inscripciones ──');
  const profIns = await request('GET', '/inscripciones', null, profesorToken);
  assert('GET /inscripciones (profesor)', profIns.status === 200, `status ${profIns.status}`);

  // Calificaciones
  info('── Calificaciones ──');
  const profCals = await request('GET', '/calificaciones', null, profesorToken);
  assert('GET /calificaciones (profesor)', profCals.status === 200, `status ${profCals.status}`);

  if (cursoId && alumnoId) {
    const profCreateCal = await request('POST', '/calificaciones', { usuario_id: alumnoId, curso_id: profCursoId, nota: 78, comentario: 'Buen trabajo' }, profesorToken);
    assert('POST /calificaciones (profesor)', profCreateCal.status === 201 || profCreateCal.status === 200 || profCreateCal.status === 409, `status ${profCreateCal.status}`);
  }

  // Tareas
  info('── Tareas ──');
  const getTareas = await request('GET', '/tareas', null, profesorToken);
  assert('GET /tareas (profesor)', getTareas.status === 200, `status ${getTareas.status}`);

  const createTarea = await request('POST', '/tareas', { titulo: 'Tarea Test Automatizada', descripcion: 'Descripción test', curso_id: profCursoId || cursoId, fecha_limite: '2026-12-31T23:59:00', puntos_maximos: 100 }, profesorToken);
  assert('POST /tareas (profesor)', createTarea.status === 201 || createTarea.status === 200, `status ${createTarea.status}`);
  tareaId = createTarea.body.data?.id || createTarea.body.id;

  if (tareaId) {
    const updateTarea = await request('PUT', `/tareas/${tareaId}`, { titulo: 'Tarea Actualizada', puntos_maximos: 50 }, profesorToken);
    assert('PUT /tareas/:id (profesor)', updateTarea.status === 200, `status ${updateTarea.status}`);

    const getEntregas = await request('GET', `/tareas/${tareaId}/entregas`, null, profesorToken);
    assert('GET /tareas/:id/entregas (profesor)', getEntregas.status === 200, `status ${getEntregas.status}`);
  }

  // Asistencias
  info('── Asistencias ──');
  if (cursoId) {
    const getAsist = await request('GET', `/asistencias/${cursoId}`, null, profesorToken);
    assert('GET /asistencias/:curso_id (profesor)', getAsist.status === 200, `status ${getAsist.status}`);

    const getResumen = await request('GET', `/asistencias/${cursoId}/resumen`, null, profesorToken);
    assert('GET /asistencias/:curso_id/resumen (profesor)', getResumen.status === 200, `status ${getResumen.status}`);

    if (alumnoId) {
      const regAsist = await request('POST', '/asistencias', { usuario_id: alumnoId, curso_id: cursoId, fecha: new Date().toISOString().split('T')[0], presente: 1 }, profesorToken);
      assert('POST /asistencias (profesor registra)', regAsist.status === 201 || regAsist.status === 200 || regAsist.status === 409, `status ${regAsist.status}`);
    }
  }

  // Materiales
  info('── Materiales ──');
  if (cursoId) {
    const getMats = await request('GET', `/materiales/${cursoId}`, null, profesorToken);
    assert('GET /materiales/:curso_id (profesor)', getMats.status === 200, `status ${getMats.status}`);
  }

  // Anuncios del profesor
  info('── Anuncios ──');
  const profAnn = await request('GET', '/anuncios', null, profesorToken);
  assert('GET /anuncios (profesor)', profAnn.status === 200, `status ${profAnn.status}`);

  const profCreateAnn = await request('POST', '/anuncios', { titulo: 'Anuncio del Profesor', contenido: 'Contenido test', tipo: 'curso', curso_id: profCursoId || cursoId }, profesorToken);
  assert('POST /anuncios (profesor)', profCreateAnn.status === 201 || profCreateAnn.status === 200, `status ${profCreateAnn.status}`);

  // Mensajes
  info('── Mensajes ──');
  const profMsgs = await request('GET', '/mensajes', null, profesorToken);
  assert('GET /mensajes (profesor)', profMsgs.status === 200, `status ${profMsgs.status}`);

  const sendMsg = await request('POST', '/mensajes', { para_usuario_id: alumnoId, asunto: 'Mensaje de prueba', contenido: 'Hola alumno, esto es un test.' }, profesorToken);
  assert('POST /mensajes (profesor → alumno)', sendMsg.status === 201 || sendMsg.status === 200, `status ${sendMsg.status}`);
  mensajeId = sendMsg.body.data?.id || sendMsg.body.id;

  // Notificaciones
  info('── Notificaciones ──');
  const profNotifs = await request('GET', '/notificaciones', null, profesorToken);
  assert('GET /notificaciones (profesor)', profNotifs.status === 200, `status ${profNotifs.status}`);

  // Perfil
  info('── Perfil ──');
  const profPerfil = await request('GET', '/perfil', null, profesorToken);
  assert('GET /perfil (profesor)', profPerfil.status === 200, `status ${profPerfil.status}`);

  // Profesor NO puede eliminar cursos (solo admin)
  info('── Control de acceso ──');
  const profDelCurso = await request('DELETE', `/cursos/${cursoId}`, null, profesorToken);
  assert('DELETE /cursos (profesor bloqueado)', profDelCurso.status === 403, `status ${profDelCurso.status}`);

  const profDelUser = await request('DELETE', `/usuarios/1`, null, profesorToken);
  assert('DELETE /usuarios (profesor bloqueado)', profDelUser.status === 403, `status ${profDelUser.status}`);

  // ════════════════════════════════════════════════════════════
  section('🎓  ALUMNO DASHBOARD', C.green);
  // ════════════════════════════════════════════════════════════

  // Cursos (lectura)
  info('── Cursos ──');
  const alumCursos = await request('GET', '/cursos', null, alumnoToken);
  assert('GET /cursos (alumno)', alumCursos.status === 200, `status ${alumCursos.status}`);

  // Alumno NO puede crear cursos
  const alumCreateCurso = await request('POST', '/cursos', { titulo: 'Intento alumno', descripcion: 'x' }, alumnoToken);
  assert('POST /cursos (alumno bloqueado)', alumCreateCurso.status === 403, `status ${alumCreateCurso.status}`);

  // Inscripciones
  info('── Inscripciones ──');
  const alumIns = await request('GET', '/inscripciones', null, alumnoToken);
  assert('GET /inscripciones (alumno)', alumIns.status === 200, `status ${alumIns.status}`);

  // Calificaciones
  info('── Calificaciones ──');
  const alumCals = await request('GET', '/calificaciones', null, alumnoToken);
  assert('GET /calificaciones (alumno)', alumCals.status === 200, `status ${alumCals.status}`);

  // Alumno NO puede crear calificaciones
  const alumCreateCal = await request('POST', '/calificaciones', { usuario_id: alumnoId, curso_id: cursoId, nota: 100 }, alumnoToken);
  assert('POST /calificaciones (alumno bloqueado)', alumCreateCal.status === 403, `status ${alumCreateCal.status}`);

  // Tareas
  info('── Tareas ──');
  const alumTareas = await request('GET', '/tareas', null, alumnoToken);
  assert('GET /tareas (alumno)', alumTareas.status === 200, `status ${alumTareas.status}`);

  // Materiales
  info('── Materiales ──');
  if (cursoId) {
    const alumMats = await request('GET', `/materiales/${cursoId}`, null, alumnoToken);
    assert('GET /materiales/:curso_id (alumno)', alumMats.status === 200, `status ${alumMats.status}`);
  }

  // Mensajes
  info('── Mensajes ──');
  const alumMsgs = await request('GET', '/mensajes', null, alumnoToken);
  assert('GET /mensajes (alumno)', alumMsgs.status === 200, `status ${alumMsgs.status}`);

  // Marcar mensaje leído
  if (mensajeId) {
    const markRead = await request('PUT', `/mensajes/${mensajeId}/leer`, null, alumnoToken);
    assert('PUT /mensajes/:id/leer (alumno)', markRead.status === 200, `status ${markRead.status}`);
  }

  // Responder mensaje
  const alumSendMsg = await request('POST', '/mensajes', { para_usuario_id: profesorId, asunto: 'Respuesta test', contenido: 'Hola profesor, recibí tu mensaje.' }, alumnoToken);
  assert('POST /mensajes (alumno → profesor)', alumSendMsg.status === 201 || alumSendMsg.status === 200, `status ${alumSendMsg.status}`);

  // Notificaciones
  info('── Notificaciones ──');
  const alumNotifs = await request('GET', '/notificaciones', null, alumnoToken);
  assert('GET /notificaciones (alumno)', alumNotifs.status === 200, `status ${alumNotifs.status}`);

  const notifsList = alumNotifs.body?.notificaciones || [];
  if (notifsList.length > 0) {
    notifId = notifsList[0].id;
    const markNotif = await request('PUT', `/notificaciones/${notifId}/leer`, null, alumnoToken);
    assert('PUT /notificaciones/:id/leer (alumno)', markNotif.status === 200, `status ${markNotif.status}`);

    const markAll = await request('PUT', '/notificaciones/leer-todas', null, alumnoToken);
    assert('PUT /notificaciones/leer-todas (alumno)', markAll.status === 200, `status ${markAll.status}`);
  } else {
    info('Sin notificaciones para marcar (OK)');
  }

  // Perfil
  info('── Perfil ──');
  const alumPerfil = await request('GET', '/perfil', null, alumnoToken);
  assert('GET /perfil (alumno)', alumPerfil.status === 200, `status ${alumPerfil.status}`);

  // Certificados (sin curso completado, espera 404 o similar)
  info('── Certificados ──');
  const cert = await request('GET', `/certificados/${alumnoId}/1`, null, alumnoToken);
  assert('GET /certificados/:uid/:cid (alumno)', cert.status === 200 || cert.status === 404 || cert.status === 400, `status ${cert.status}`);

  // Alumno NO puede crear anuncios
  info('── Control de acceso ──');
  const alumCreateAnn = await request('POST', '/anuncios', { titulo: 'Intento', contenido: 'x', tipo: 'general' }, alumnoToken);
  assert('POST /anuncios (alumno bloqueado)', alumCreateAnn.status === 403, `status ${alumCreateAnn.status}`);

  const alumCreateCat = await request('POST', '/categorias', { nombre: 'Intento' }, alumnoToken);
  assert('POST /categorias (alumno bloqueado)', alumCreateCat.status === 403, `status ${alumCreateCat.status}`);

  // ════════════════════════════════════════════════════════════
  section('🧹  LIMPIEZA — Eliminar datos de prueba', C.gray);
  // ════════════════════════════════════════════════════════════

  if (tareaId) {
    const delTarea = await request('DELETE', `/tareas/${tareaId}`, null, adminToken);
    assert(`DELETE /tareas/${tareaId}`, delTarea.status === 200, `status ${delTarea.status}`);
  }
  if (anuncioId) {
    const delAnn = await request('DELETE', `/anuncios/${anuncioId}`, null, adminToken);
    assert(`DELETE /anuncios/${anuncioId}`, delAnn.status === 200, `status ${delAnn.status}`);
  }
  if (calificacionId) {
    const delCal = await request('DELETE', `/calificaciones/${calificacionId}`, null, adminToken);
    assert(`DELETE /calificaciones/${calificacionId}`, delCal.status === 200, `status ${delCal.status}`);
  }
  if (inscripcionId) {
    const delIns = await request('DELETE', `/inscripciones/${inscripcionId}`, null, adminToken);
    assert(`DELETE /inscripciones/${inscripcionId}`, delIns.status === 200, `status ${delIns.status}`);
  }
  if (cursoId) {
    const delCurso = await request('DELETE', `/cursos/${cursoId}`, null, adminToken);
    assert(`DELETE /cursos/${cursoId}`, delCurso.status === 200, `status ${delCurso.status}`);
  }
  if (categoriaId) {
    const delCat = await request('DELETE', `/categorias/${categoriaId}`, null, adminToken);
    assert(`DELETE /categorias/${categoriaId}`, delCat.status === 200, `status ${delCat.status}`);
  }

  printSummary();
}

function printSummary() {
  const pct = total > 0 ? Math.round((passed / total) * 100) : 0;
  const bar = '█'.repeat(Math.round(pct / 5)) + '░'.repeat(20 - Math.round(pct / 5));
  const color = pct === 100 ? C.green : pct >= 80 ? C.yellow : C.red;

  console.log(`\n${C.bold}${'═'.repeat(55)}`);
  console.log(`  RESULTADOS FINALES`);
  console.log(`${'═'.repeat(55)}${C.reset}`);
  console.log(`  ${C.green}✅ Pasaron: ${passed}${C.reset}`);
  console.log(`  ${C.red}❌ Fallaron: ${failed}${C.reset}`);
  console.log(`  📊 Total:   ${total}`);
  console.log(`\n  ${color}${bar} ${pct}%${C.reset}`);
  console.log(`\n  ${pct === 100 ? '🎉 ¡Todos los módulos funcionan correctamente!' : pct >= 80 ? '⚠️  Algunos módulos tienen problemas.' : '🚨 Varios módulos fallan, revisar el backend.'}`);
  console.log(`${C.bold}${'═'.repeat(55)}${C.reset}\n`);
}

run().catch((e) => {
  console.error(`\n${C.red}Error fatal: ${e.message}${C.reset}`);
  process.exit(1);
});
