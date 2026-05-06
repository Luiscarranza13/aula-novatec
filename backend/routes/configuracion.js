/**
 * Configuración global del sistema
 * Mejora #76 — Panel de configuración del sistema
 */
const router = require('express').Router();
const db = require('../database/db');
const { auth, requireRole } = require('../middleware/auth');

router.use(auth);

// Obtener toda la configuración (cualquier usuario autenticado puede leer)
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await db.execute('SELECT clave, valor, descripcion FROM configuracion');
    const config = {};
    rows.forEach(r => { config[r.clave] = r.valor; });
    res.json({ success: true, data: config });
  } catch (err) { next(err); }
});

// Actualizar configuración (solo admin)
router.put('/', requireRole('admin'), async (req, res, next) => {
  try {
    const updates = req.body; // { clave: valor, ... }
    for (const [clave, valor] of Object.entries(updates)) {
      await db.execute(
        'INSERT INTO configuracion (clave, valor) VALUES (?,?) ON DUPLICATE KEY UPDATE valor=VALUES(valor)',
        [clave, String(valor)]
      );
    }
    res.json({ success: true, message: 'Configuración actualizada' });
  } catch (err) { next(err); }
});

// Actualizar una clave específica
router.put('/:clave', requireRole('admin'), async (req, res, next) => {
  try {
    const { clave } = req.params;
    const { valor } = req.body;
    await db.execute(
      'INSERT INTO configuracion (clave, valor) VALUES (?,?) ON DUPLICATE KEY UPDATE valor=VALUES(valor)',
      [clave, String(valor)]
    );
    res.json({ success: true, message: `Configuración '${clave}' actualizada` });
  } catch (err) { next(err); }
});

module.exports = router;
