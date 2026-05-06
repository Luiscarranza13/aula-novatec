/**
 * Middleware de auditoría de acciones
 * Mejora #7 — Auditoría de acciones
 * Registra en tabla logs_auditoria quién hizo qué y cuándo
 */
const db = require('../database/db');
const logger = require('../utils/logger');

// Acciones que se auditan
const AUDIT_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

const auditLog = (req, res, next) => {
  if (!AUDIT_METHODS.includes(req.method)) return next();
  if (!req.user) return next();

  const originalJson = res.json.bind(res);
  res.json = function (body) {
    // Solo auditar si fue exitoso
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const accion = `${req.method} ${req.originalUrl}`;
      const detalle = JSON.stringify({
        body: sanitizeBody(req.body),
        params: req.params,
        status: res.statusCode,
      }).substring(0, 1000);

      db.execute(
        'INSERT INTO logs_auditoria (usuario_id, accion, detalle, ip) VALUES (?,?,?,?)',
        [req.user.userId, accion, detalle, req.ip || 'unknown']
      ).catch(e => logger.error('Error guardando audit log:', e.message));
    }
    return originalJson(body);
  };

  next();
};

// Eliminar campos sensibles del log
function sanitizeBody(body) {
  if (!body) return {};
  const clean = { ...body };
  ['password', 'password_actual', 'password_nueva', 'token'].forEach(k => {
    if (clean[k]) clean[k] = '***';
  });
  return clean;
}

module.exports = auditLog;
