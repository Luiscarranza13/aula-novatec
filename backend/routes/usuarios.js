const router = require('express').Router();
const ctrl = require('../controllers/usuarioController');
const { auth, requireRole } = require('../middleware/auth');

router.use(auth);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', requireRole('admin'), ctrl.create);
router.put('/:id', requireRole('admin'), ctrl.update);
router.patch('/:id/toggle', requireRole('admin'), ctrl.toggleActivo);  // Mejora #74
router.delete('/:id', requireRole('admin'), ctrl.remove);

module.exports = router;
