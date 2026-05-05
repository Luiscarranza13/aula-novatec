const router = require('express').Router();
const ctrl = require('../controllers/tareaController');
const { auth, requireRole } = require('../middleware/auth');

router.use(auth);
router.get('/', ctrl.getTareas);
router.post('/', requireRole('admin', 'profesor'), ctrl.createTarea);
router.put('/:id', requireRole('admin', 'profesor'), ctrl.updateTarea);
router.delete('/:id', requireRole('admin', 'profesor'), ctrl.deleteTarea);

// Entregas
router.get('/:tarea_id/entregas', ctrl.getEntregas);
router.post('/entregas', ctrl.upload.single('archivo'), ctrl.entregar);
router.put('/entregas/:id/calificar', requireRole('admin', 'profesor'), ctrl.calificarEntrega);

module.exports = router;
