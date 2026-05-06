/**
 * Clase de error tipado para respuestas consistentes de la API.
 * Mejora #16 — Manejo de errores tipados
 */
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, code = 'BAD_REQUEST') {
    return new AppError(message, 400, code);
  }

  static unauthorized(message = 'No autorizado', code = 'UNAUTHORIZED') {
    return new AppError(message, 401, code);
  }

  static forbidden(message = 'Acceso denegado', code = 'FORBIDDEN') {
    return new AppError(message, 403, code);
  }

  static notFound(message = 'Recurso no encontrado', code = 'NOT_FOUND') {
    return new AppError(message, 404, code);
  }

  static conflict(message, code = 'CONFLICT') {
    return new AppError(message, 409, code);
  }

  static validation(message, code = 'VALIDATION_ERROR') {
    return new AppError(message, 422, code);
  }
}

module.exports = AppError;
