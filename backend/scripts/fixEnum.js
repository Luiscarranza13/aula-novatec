require('dotenv').config();
const mysql = require('mysql2/promise');

(async () => {
  const c = await mysql.createConnection({
    host: process.env.DB_HOST, user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, database: process.env.DB_NAME
  });
  await c.execute("ALTER TABLE usuarios MODIFY COLUMN rol ENUM('estudiante','profesor','admin') NOT NULL DEFAULT 'estudiante'");
  console.log('✓ ENUM rol actualizado a: estudiante, profesor, admin');
  await c.end();
})().catch(e => console.error('✗', e.message));
