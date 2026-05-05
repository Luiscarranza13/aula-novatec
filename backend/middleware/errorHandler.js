// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path} —`, err.message);

  if (err.code === 'ER_DUP_ENTRY')
    return res.status(409).json({ success: false, message: 'El registro ya existe.' });

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor.',
  });
};

module.exports = errorHandler;
