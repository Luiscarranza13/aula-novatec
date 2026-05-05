const router = require('express').Router();
const ctrl = require('../controllers/asistenciaController');
const { auth, requireRole } = require('../middleware/auth');

router.use(auth);
router.get('/:curso_id', ctrl.getByCurso);
router.get('/:curso_id/resumen', ctrl.getResumen);
router.post('/', requireRole('admin', 'profesor'), ctrl.registrar);

module.exports = router;
