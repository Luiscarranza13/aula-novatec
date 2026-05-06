/**
 * Expiración de sesión por inactividad
 * Mejora #9 — Expiración de sesión por inactividad
 * Verifica que el token no sea más antiguo que INACTIVITY_MINUTES
 */
const jwt = require('jsonwebtoken');

const INACTIVITY_MINUTES = parseInt(process.env.SESSION_TIMEOUT_MINUTES) || 60;

const sessionTimeout = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next();

  try {
    const decoded = jwt.decode(header.split(' ')[1]);
    if (!decoded) return next();

    const issuedAt = decoded.iat * 1000;
    const now = Date.now();
    const diffMinutes = (now - issuedAt) / 1000 / 60;

    if (diffMinutes > INACTIVITY_MINUTES) {
      return res.status(401).json({
        success: false,
        code: 'SESSION_EXPIRED',
        message: `Sesión expirada por inactividad (${INACTIVITY_MINUTES} min). Por favor inicia sesión nuevamente.`,
      });
    }
  } catch { /* ignorar errores de decode */ }

  next();
};

module.exports = sessionTimeout;
