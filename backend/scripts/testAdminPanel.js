/**
 * Script de prueba para todos los módulos del panel admin
 * Uso: node backend/scripts/testAdminPanel.js
 * Requiere que el backend esté corriendo en http://localhost:3001
 */

const http = require('http');

const BASE = { host: 'localhost', port: 3001 };
let adminToken = '';
let testIds = {};
let passed = 0;
let failed = 0;

const colors = { reset: '\x1b[0m', green: '\x1b[32m', red: '\x1b[31m', yellow: '\x1b[33m', blue: '\x1b[36m' };
const log = (msg, color = 'reset') => console.log(`${colors[color]}${msg}${colors.reset}`);

// HTTP helper — devuelve el JSON completo
const request = (method, path, body, token) => new Promise((resolve, reject) => {
  const data = body ? JSON.stringify(body) : null;
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
  };

  const req = http.request({ ...BASE, method, path, headers }, res => {
    let raw = '';
    res.on('data', chunk => raw += chunk);
    res.on('end', () => {
      try {
        const json = raw ? JSON.parse(raw) : {};
        if (res.statusCode === 404 && raw.includes('<!DOCTYPE')) {
          const err = new Error(`Ruta no registrada en el servidor (reinicia el backend)`);
          err.status = 404;
          err.isHtml = true;
          return reject(err);
        }
        if (res.statusCode >= 400) {
          const err = new Error(json.message || json.error || `HTTP ${res.statusCode}`);
          err.status = res.statusCode;
          return reject(err);
        }
        resolve(json);
      } catch {
        resolve(raw);
      }
    });
  });

  req.on('error', reject);
  if (data) req.write(data);
  req.end();
});

// Extrae el array de datos de la respuesta (soporta array directo o {data: []})
const toArray = (res) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  throw new Error(`Respuesta inesperada: ${JSON.stringify(res).slice(0, 80)}`);
};

// Extrae el ID de la respuesta
const toId = (res) => res.id || res.insertId || res.data?.id || res.data?.insertId;

const test = async (name, fn) => {
  try {
    await fn();
    log(`  ✓ ${name}`, 'green');
    passed++;
  } catch (err) {
    log(`  ✗ ${name}: ${err.message}`, 'red');
    failed++;
  }
};

const section = (name) => log(`\n── ${name} ──`, 'blue');

// ─── AUTH ────────────────────────────────────────────────────────────────────
const testAuth = async () => {
  section('AUTENTICACIÓN');

  await test('Login admin', async () => {
    const res = await request('POST', '/api/auth/login', {
      email: 'admin@gmail.com',
      password: 'admin123'
    });
    if (!res.token) throw new Error('No se recibió token');
    adminToken = res.token;
  });

  await test('Login inválido rechazado', async () => {
    try {
      await request('POST', '/api/auth/login', { email: 'x@x.com', password: 'wrong' });
      throw new Error('Debería haber fallado');
    } catch (err) {
      if (err.message === 'Debería haber fallado') throw err;
    }
  });
};

// ─── USUARIOS ────────────────────────────────────────────────────────────────
const testUsuarios = async () => {
  section('USUARIOS');
  const t = adminToken;

  await test('GET /api/usuarios', async () => {
    const res = await request('GET', '/api/usuarios', null, t);
    toArray(res);
  });

  await test('POST /api/usuarios (crear)', async () => {
    const res = await request('POST', '/api/usuarios', {
      nombre: 'Usuario Test',
      email: `test_${Date.now()}@test.com`,
      password: '123456',
      rol: 'estudiante'
    }, t);
    testIds.usuario = toId(res);
    if (!testIds.usuario) throw new Error('No se obtuvo ID');
  });

  await test('GET /api/usuarios/:id', async () => {
    await request('GET', `/api/usuarios/${testIds.usuario}`, null, t);
  });

  await test('PUT /api/usuarios/:id (actualizar)', async () => {
    await request('PUT', `/api/usuarios/${testIds.usuario}`, {
      nombre: 'Usuario Test Actualizado',
      email: `test_${Date.now()}@test.com`,
      rol: 'estudiante'
    }, t);
  });

  await test('DELETE /api/usuarios/:id (eliminar)', async () => {
    await request('DELETE', `/api/usuarios/${testIds.usuario}`, null, t);
  });
};

// ─── CATEGORÍAS ──────────────────────────────────────────────────────────────
const testCategorias = async () => {
  section('CATEGORÍAS');
  const t = adminToken;

  await test('GET /api/categorias', async () => {
    const res = await request('GET', '/api/categorias', null, t);
    toArray(res);
  });
};

// ─── CURSOS ──────────────────────────────────────────────────────────────────
const testCursos = async () => {
  section('CURSOS');
  const t = adminToken;

  await test('GET /api/cursos', async () => {
    const res = await request('GET', '/api/cursos', null, t);
    toArray(res);
  });

  await test('POST /api/cursos (crear)', async () => {
    const res = await request('POST', '/api/cursos', {
      titulo: 'Curso Test',
      descripcion: 'Descripción de prueba',
      categoria_id: 1,
      profesor_id: 2,
      duracion_horas: 10,
      nivel: 'principiante'
    }, t);
    testIds.curso = toId(res);
    if (!testIds.curso) throw new Error('No se obtuvo ID');
  });

  await test('PUT /api/cursos/:id (actualizar)', async () => {
    await request('PUT', `/api/cursos/${testIds.curso}`, {
      titulo: 'Curso Test Actualizado'
    }, t);
  });

  await test('DELETE /api/cursos/:id (eliminar)', async () => {
    await request('DELETE', `/api/cursos/${testIds.curso}`, null, t);
  });
};

// ─── INSCRIPCIONES ───────────────────────────────────────────────────────────
const testInscripciones = async () => {
  section('INSCRIPCIONES');
  const t = adminToken;

  await test('GET /api/inscripciones', async () => {
    const res = await request('GET', '/api/inscripciones', null, t);
    toArray(res);
  });

  // Crear un usuario temporal para inscribir sin conflicto de UNIQUE KEY
  let tempUserId;
  await test('POST /api/inscripciones (crear)', async () => {
    // Primero crear usuario temporal
    const u = await request('POST', '/api/usuarios', {
      nombre: 'Temp Inscripcion',
      email: `temp_insc_${Date.now()}@test.com`,
      password: '123456',
      rol: 'estudiante'
    }, t);
    tempUserId = toId(u);

    const res = await request('POST', '/api/inscripciones', {
      usuario_id: tempUserId,
      curso_id: 1
    }, t);
    testIds.inscripcion = toId(res);
    if (!testIds.inscripcion) throw new Error('No se obtuvo ID');
  });

  if (testIds.inscripcion) {
    await test('DELETE /api/inscripciones/:id (cancelar)', async () => {
      await request('DELETE', `/api/inscripciones/${testIds.inscripcion}`, null, t);
    });
  }

  // Limpiar usuario temporal
  if (tempUserId) {
    try { await request('DELETE', `/api/usuarios/${tempUserId}`, null, t); } catch (_) {}
  }
};

// ─── CALIFICACIONES ──────────────────────────────────────────────────────────
const testCalificaciones = async () => {
  section('CALIFICACIONES');
  const t = adminToken;

  await test('GET /api/calificaciones', async () => {
    const res = await request('GET', '/api/calificaciones', null, t);
    toArray(res);
  });

  // Crear usuario y curso temporales para evitar UNIQUE KEY conflict
  let tempU, tempC, tempCalId;
  await test('POST /api/calificaciones (crear)', async () => {
    const u = await request('POST', '/api/usuarios', {
      nombre: 'Temp Cal', email: `temp_cal_${Date.now()}@test.com`, password: '123456', rol: 'estudiante'
    }, t);
    tempU = toId(u);
    const c = await request('POST', '/api/cursos', {
      titulo: 'Curso Temp Cal', descripcion: 'test', categoria_id: 1, profesor_id: 2, duracion_horas: 1, nivel: 'principiante'
    }, t);
    tempC = toId(c);
    const res = await request('POST', '/api/calificaciones', {
      usuario_id: tempU, curso_id: tempC, nota: 90, comentario: 'Test'
    }, t);
    tempCalId = toId(res);
    if (!tempCalId) throw new Error('No se obtuvo ID');
  });

  // Limpiar
  if (tempCalId) { try { await request('DELETE', `/api/calificaciones/${tempCalId}`, null, t); } catch (_) {} }
  if (tempC) { try { await request('DELETE', `/api/cursos/${tempC}`, null, t); } catch (_) {} }
  if (tempU) { try { await request('DELETE', `/api/usuarios/${tempU}`, null, t); } catch (_) {} }
};

// ─── ANUNCIOS ────────────────────────────────────────────────────────────────
const testAnuncios = async () => {
  section('ANUNCIOS');
  const t = adminToken;

  await test('GET /api/anuncios', async () => {
    const res = await request('GET', '/api/anuncios', null, t);
    toArray(res);
  });

  await test('POST /api/anuncios (crear)', async () => {
    await request('POST', '/api/anuncios', {
      titulo: 'Anuncio Test',
      contenido: 'Contenido de prueba',
      curso_id: 1
    }, t);
  });
};

// ─── ASISTENCIAS ─────────────────────────────────────────────────────────────
const testAsistencias = async () => {
  section('ASISTENCIAS');
  const t = adminToken;

  // GET requiere /:curso_id — no hay GET /
  await test('GET /api/asistencias/:curso_id', async () => {
    const res = await request('GET', '/api/asistencias/1', null, t);
    toArray(res);
  });

  await test('POST /api/asistencias (registrar)', async () => {
    await request('POST', '/api/asistencias', {
      usuario_id: 3,
      curso_id: 1,
      fecha: new Date().toISOString().split('T')[0],
      presente: true
    }, t);
  });
};

// ─── TAREAS ──────────────────────────────────────────────────────────────────
const testTareas = async () => {
  section('TAREAS');
  const t = adminToken;

  await test('GET /api/tareas', async () => {
    const res = await request('GET', '/api/tareas', null, t);
    toArray(res);
  });

  await test('POST /api/tareas (crear)', async () => {
    const res = await request('POST', '/api/tareas', {
      curso_id: 1,
      titulo: 'Tarea Test',
      descripcion: 'Descripción test',
      fecha_limite: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }, t);
    testIds.tarea = toId(res);
  });

  if (testIds.tarea) {
    await test('PUT /api/tareas/:id (actualizar)', async () => {
      await request('PUT', `/api/tareas/${testIds.tarea}`, { titulo: 'Tarea Test Actualizada' }, t);
    });
    await test('DELETE /api/tareas/:id (eliminar)', async () => {
      await request('DELETE', `/api/tareas/${testIds.tarea}`, null, t);
    });
  }
};

// ─── MATERIALES ──────────────────────────────────────────────────────────────
const testMateriales = async () => {
  section('MATERIALES');
  const t = adminToken;

  // GET requiere /:curso_id — no hay GET /
  await test('GET /api/materiales/:curso_id', async () => {
    const res = await request('GET', '/api/materiales/1', null, t);
    toArray(res);
  });

  await test('POST /api/materiales (crear)', async () => {
    await request('POST', '/api/materiales', {
      titulo: 'Material Test',
      tipo: 'enlace',
      url: 'https://example.com',
      curso_id: 1
    }, t);
  });
};

// ─── MENSAJES ────────────────────────────────────────────────────────────────
const testMensajes = async () => {
  section('MENSAJES');
  const t = adminToken;

  // GET devuelve {recibidos, enviados, no_leidos} — no un array directo
  await test('GET /api/mensajes (bandeja)', async () => {
    const res = await request('GET', '/api/mensajes', null, t);
    if (!Array.isArray(res.recibidos)) throw new Error('No tiene recibidos');
  });

  await test('POST /api/mensajes (enviar)', async () => {
    await request('POST', '/api/mensajes', {
      para_usuario_id: 3,
      asunto: 'Mensaje Test',
      contenido: 'Contenido de prueba'
    }, t);
  });
};

// ─── NOTIFICACIONES ──────────────────────────────────────────────────────────
const testNotificaciones = async () => {
  section('NOTIFICACIONES');
  const t = adminToken;

  await test('GET /api/notificaciones', async () => {
    const res = await request('GET', '/api/notificaciones', null, t);
    // Devuelve {success, data: [], no_leidas}
    if (!Array.isArray(res.data !== undefined ? res.data : res))
      throw new Error('Respuesta inesperada');
  });
};

// ─── REPORTES ────────────────────────────────────────────────────────────────
const testReportes = async () => {
  section('REPORTES');
  const t = adminToken;

  for (const tipo of ['usuarios', 'cursos', 'inscripciones']) {
    await test(`GET /api/reportes/${tipo}`, async () => {
      await request('GET', `/api/reportes/${tipo}`, null, t);
    });
  }
};

// ─── CERTIFICADOS ────────────────────────────────────────────────────────────
const testCertificados = async () => {
  section('CERTIFICADOS');
  const t = adminToken;

  // No hay GET / — solo GET /:usuario_id/:curso_id que genera PDF
  // Probamos que la ruta existe y responde (aunque falle por nota insuficiente)
  await test('GET /api/certificados/:usuario_id/:curso_id (ruta existe)', async () => {
    try {
      await request('GET', '/api/certificados/3/1', null, t);
    } catch (err) {
      // 404 = no hay calificación, 400 = no aprobó — ambos son respuestas válidas del servidor
      if (err.status === 404 || err.status === 400) return;
      throw err;
    }
  });
};

// ─── PERFIL ──────────────────────────────────────────────────────────────────
const testPerfil = async () => {
  section('PERFIL');
  const t = adminToken;

  await test('GET /api/perfil', async () => {
    await request('GET', '/api/perfil', null, t);
  });

  await test('PUT /api/perfil (actualizar)', async () => {
    await request('PUT', '/api/perfil', { nombre: 'Admin Test' }, t);
  });
};

// ─── BÚSQUEDA ────────────────────────────────────────────────────────────────
const testBusqueda = async () => {
  section('BÚSQUEDA');
  const t = adminToken;

  await test('GET /api/buscar?q=test', async () => {
    await request('GET', '/api/buscar?q=test', null, t);
  });
};

// ─── MAIN ────────────────────────────────────────────────────────────────────
const run = async () => {
  log('\n🚀 PRUEBAS DEL PANEL ADMIN - AULA VIRTUAL', 'yellow');
  log(`   API: http://${BASE.host}:${BASE.port}/api\n`, 'yellow');

  const start = Date.now();

  await testAuth();
  await testUsuarios();
  await testCategorias();
  await testCursos();
  await testInscripciones();
  await testCalificaciones();
  await testAnuncios();
  await testAsistencias();
  await testTareas();
  await testMateriales();
  await testMensajes();
  await testNotificaciones();
  await testReportes();
  await testCertificados();
  await testPerfil();
  await testBusqueda();

  const duration = ((Date.now() - start) / 1000).toFixed(2);
  const total = passed + failed;

  log(`\n${'─'.repeat(40)}`, 'yellow');
  log(`  Total:    ${total} pruebas`, 'yellow');
  log(`  Pasaron:  ${passed}`, 'green');
  log(`  Fallaron: ${failed}`, failed > 0 ? 'red' : 'green');
  log(`  Tiempo:   ${duration}s`, 'yellow');
  log(`${'─'.repeat(40)}\n`, 'yellow');

  process.exit(failed > 0 ? 1 : 0);
};

run().catch(err => {
  log(`\n❌ ERROR FATAL: ${err.message}`, 'red');
  log('   ¿Está el backend corriendo? Ejecuta: npm start en /backend\n', 'yellow');
  process.exit(1);
});
