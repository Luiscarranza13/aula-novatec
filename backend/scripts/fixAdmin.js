require('dotenv').config();
const mysql = require('mysql2/promise');

(async () => {
  const c = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
  
  await c.execute("UPDATE usuarios SET rol='admin' WHERE email='admin@gmail.com'");
  const [rows] = await c.execute('SELECT id, nombre, email, rol FROM usuarios WHERE email=?', ['admin@gmail.com']);
  console.log('✓ Admin actualizado:', rows[0]);
  
  await c.end();
})().catch(e => console.error('✗ Error:', e.message));
