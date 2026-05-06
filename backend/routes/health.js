/**
 * Health check endpoint
 * Mejora #99 — GET /api/health
 */
const router = require('express').Router();
const db = require('../database/db');
const os = require('os');

router.get('/', async (req, res) => {
  const start = Date.now();
  let dbStatus = 'ok';
  let dbLatency = 0;

  try {
    const t0 = Date.now();
    await db.execute('SELECT 1');
    dbLatency = Date.now() - t0;
  } catch {
    dbStatus = 'error';
  }

  const memUsage = process.memoryUsage();
  const uptime = process.uptime();

  res.json({
    status: dbStatus === 'ok' ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s`,
    database: { status: dbStatus, latency: `${dbLatency}ms` },
    memory: {
      used: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      total: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
    },
    system: {
      platform: os.platform(),
      cpus: os.cpus().length,
      freeMemory: `${Math.round(os.freemem() / 1024 / 1024)}MB`,
    },
    responseTime: `${Date.now() - start}ms`,
  });
});

module.exports = router;
