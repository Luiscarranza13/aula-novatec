require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function reset() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const usuarios = [
    { email: 'admin@aula.com',    password: 'Admin123!',    nombre: 'Administrador', rol: 'admin' },
    { email: 'profesor@aula.com', password: 'Profesor123!', nombre: 'Prof. García',  rol: 'profesor' },
    { email: 'alumno@aula.com',   password: 'Alumno123!',   nombre: 'Juan Alumno',   rol: 'estudiante' },
  ];

  for (const u of usuarios) {
    const hash = await bcrypt.hash(u.password, 10);
    // Verificar que el hash es válido antes de guardar
    const valid = await bcrypt.compare(u.password, hash);
    if (!valid) { console.error('Hash inválido para', u.email); process.exit(1); }

    const [existing] = await conn.execute('SELECT id FROM usuarios WHERE email = ?', [u.email]);
    if (existing.length > 0) {
      await conn.execute('UPDATE usuarios SET password = ?, nombre = ?, rol = ? WHERE email = ?', [hash, u.nombre, u.rol, u.email]);
      console.log('✅ Actualizado:', u.email, '→ hash válido:', hash.substring(0, 10) + '...');
    } else {
      await conn.execute('INSERT INTO usuarios (nombre, email, password, rol) VALUES (?,?,?,?)', [u.nombre, u.email, hash, u.rol]);
      console.log('✅ Creado:', u.email);
    }
  }

  // Verificación final
  console.log('\n--- Verificación final ---');
  const passwords = { 'admin@aula.com': 'Admin123!', 'profesor@aula.com': 'Profesor123!', 'alumno@aula.com': 'Alumno123!' };
  const [rows] = await conn.execute('SELECT email, password FROM usuarios');
  for (const r of rows) {
    if (passwords[r.email]) {
      const ok = await bcrypt.compare(passwords[r.email], r.password);
      console.log(ok ? '✅' : '❌', r.email, ok ? 'LOGIN OK' : 'LOGIN FALLA');
    }
  }

  await conn.end();
}

reset().catch(e => { console.error('Error:', e.message); process.exit(1); });
