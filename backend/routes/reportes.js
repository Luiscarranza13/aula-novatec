const router = require('express').Router();
const ctrl = require('../controllers/reporteController');
const { auth } = require('../middleware/auth');

router.use(auth);
router.get('/exportar', ctrl.exportar);
router.get('/estadisticas', ctrl.estadisticas);

module.exports = router;
