/**
 * Backup automático de la base de datos
 * Mejora #25 — Backup automático de BD
 * Ejecutar: node scripts/backup.js
 * O programar con cron: 0 2 * * * node /ruta/scripts/backup.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const BACKUP_DIR = path.join(__dirname, '../backups');
const MAX_BACKUPS = 7;

// Crear directorio si no existe
if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const filename = `backup_${process.env.DB_NAME}_${timestamp}.sql`;
const filepath = path.join(BACKUP_DIR, filename);

const cmd = [
  'mysqldump',
  `--host=${process.env.DB_HOST}`,
  `--port=${process.env.DB_PORT || 3306}`,
  `--user=${process.env.DB_USER}`,
  `--password=${process.env.DB_PASSWORD}`,
  '--single-transaction',
  '--routines',
  '--triggers',
  process.env.DB_NAME,
  `> "${filepath}"`,
].join(' ');

console.log(`📦 Iniciando backup: ${filename}`);

exec(cmd, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Error en backup:', error.message);
    process.exit(1);
  }

  const size = fs.statSync(filepath).size;
  console.log(`✅ Backup completado: ${filename} (${Math.round(size / 1024)}KB)`);

  // Eliminar backups antiguos (mantener solo MAX_BACKUPS)
  const files = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('backup_') && f.endsWith('.sql'))
    .map(f => ({ name: f, time: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime() }))
    .sort((a, b) => b.time - a.time);

  if (files.length > MAX_BACKUPS) {
    files.slice(MAX_BACKUPS).forEach(f => {
      fs.unlinkSync(path.join(BACKUP_DIR, f.name));
      console.log(`🗑️  Backup antiguo eliminado: ${f.name}`);
    });
  }

  console.log(`📁 Backups disponibles: ${Math.min(files.length, MAX_BACKUPS)}`);
});
