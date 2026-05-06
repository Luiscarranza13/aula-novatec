/**
 * Middleware de validación con express-validator
 * Mejora #3 — Validación de inputs
 */
const { validationResult, body, param, query } = require('express-validator');
const AppError = require('../utils/AppError');

// Ejecuta las validaciones y devuelve errores si los hay
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map(e => `${e.path}: ${e.msg}`).join('; ');
    return next(AppError.validation(messages));
  }
  next();
};

// ── Reglas reutilizables ──────────────────────────────────────

const passwordRules = () =>
  body('password')
    .isLength({ min: 8 }).withMessage('Mínimo 8 caracteres')
    .matches(/[A-Z]/).withMessage('Debe contener al menos una mayúscula')
    .matches(/[0-9]/).withMessage('Debe contener al menos un número')
    .matches(/[^A-Za-z0-9]/).withMessage('Debe contener al menos un símbolo');

const emailRules = () =>
  body('email').isEmail().normalizeEmail().withMessage('Email inválido');

const idParam = () =>
  param('id').isInt({ min: 1 }).withMessage('ID debe ser un entero positivo');

// ── Validadores por entidad ───────────────────────────────────

const validators = {
  // Auth
  register: [
    body('nombre').trim().isLength({ min: 2, max: 100 }).withMessage('Nombre: 2-100 caracteres'),
    emailRules(),
    passwordRules(),
    body('rol').optional().isIn(['estudiante', 'profesor']).withMessage('Rol inválido'),
    validate,
  ],

  login: [
    emailRules(),
    body('password').notEmpty().withMessage('Contraseña requerida'),
    validate,
  ],

  // Usuarios
  createUser: [
    body('nombre').trim().isLength({ min: 2, max: 100 }).withMessage('Nombre: 2-100 caracteres'),
    emailRules(),
    body('password').isLength({ min: 8 }).withMessage('Contraseña mínimo 8 caracteres'),
    body('rol').isIn(['estudiante', 'profesor', 'admin']).withMessage('Rol inválido'),
    validate,
  ],

  updateUser: [
    idParam(),
    body('nombre').optional().trim().isLength({ min: 2, max: 100 }),
    body('email').optional().isEmail().normalizeEmail(),
    body('rol').optional().isIn(['estudiante', 'profesor', 'admin']),
    validate,
  ],

  // Cursos
  createCurso: [
    body('titulo').trim().isLength({ min: 3, max: 200 }).withMessage('Título: 3-200 caracteres'),
    body('descripcion').optional().trim().isLength({ max: 2000 }),
    body('duracion_horas').optional().isInt({ min: 0, max: 9999 }),
    body('profesor_id').optional().isInt({ min: 1 }),
    validate,
  ],

  // Calificaciones
  createCalificacion: [
    body('usuario_id').isInt({ min: 1 }).withMessage('usuario_id requerido'),
    body('curso_id').isInt({ min: 1 }).withMessage('curso_id requerido'),
    body('nota').isFloat({ min: 0, max: 100 }).withMessage('Nota debe ser entre 0 y 100'),
    body('comentario').optional().trim().isLength({ max: 500 }),
    validate,
  ],

  // Tareas
  createTarea: [
    body('titulo').trim().isLength({ min: 3, max: 200 }).withMessage('Título: 3-200 caracteres'),
    body('curso_id').isInt({ min: 1 }).withMessage('curso_id requerido'),
    body('puntos_maximos').optional().isInt({ min: 1, max: 1000 }),
    validate,
  ],

  // Mensajes
  sendMensaje: [
    body('para_usuario_id').isInt({ min: 1 }).withMessage('Destinatario requerido'),
    body('contenido').trim().isLength({ min: 1, max: 2000 }).withMessage('Contenido requerido'),
    body('asunto').optional().trim().isLength({ max: 200 }),
    validate,
  ],

  // Anuncios
  createAnuncio: [
    body('titulo').trim().isLength({ min: 3, max: 200 }).withMessage('Título: 3-200 caracteres'),
    body('contenido').trim().isLength({ min: 1, max: 5000 }).withMessage('Contenido requerido'),
    body('tipo').optional().isIn(['general', 'curso', 'urgente']),
    validate,
  ],

  // Cambio de contraseña
  changePassword: [
    body('password_actual').notEmpty().withMessage('Contraseña actual requerida'),
    passwordRules().optional(),
    validate,
  ],
};

module.exports = validators;
