const router = require('express').Router();
const ctrl = require('../controllers/cursoController');
const { auth, requireRole } = require('../middleware/auth');

router.use(auth);
router.get('/', ctrl.getAll);
router.post('/', requireRole('admin', 'profesor'), ctrl.create);
router.put('/:id', requireRole('admin', 'profesor'), ctrl.update);
router.delete('/:id', requireRole('admin'), ctrl.remove);

module.exports = router;
