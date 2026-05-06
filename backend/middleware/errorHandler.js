/**
 * Error handler global mejorado con AppError y Winston
 * Mejoras #16 + #98
 */
const logger = require('../utils/logger');

module.exports = (err, req, res, next) => {
  // Errores operacionales conocidos (AppError)
  if (err.isOperational) {
    logger.warn(`[${err.code}] ${err.message} — ${req.method} ${req.originalUrl}`);
    return res.status(err.statusCode).json({
      success: false,
      code: err.code,
      message: err.message,
    });
  }

  // Errores de MySQL
  if (err.code === 'ER_DUP_ENTRY') {
    logger.warn(`Duplicate entry — ${req.method} ${req.originalUrl}`);
    return res.status(409).json({ success: false, code: 'CONFLICT', message: 'El registro ya existe.' });
  }
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ success: false, code: 'BAD_REFERENCE', message: 'Referencia inválida.' });
  }
  if (err.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(409).json({ success: false, code: 'REFERENCED', message: 'No se puede eliminar: tiene registros relacionados.' });
  }

  // Errores de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, code: 'INVALID_TOKEN', message: 'Token inválido.' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, code: 'TOKEN_EXPIRED', message: 'Token expirado.' });
  }

  // Error inesperado — loguear completo
  logger.error(`Unhandled error — ${req.method} ${req.originalUrl}`, { error: err.message, stack: err.stack });

  res.status(500).json({
    success: false,
    code: 'INTERNAL_ERROR',
    message: process.env.NODE_ENV === 'production' ? 'Error interno del servidor.' : err.message,
  });
};
