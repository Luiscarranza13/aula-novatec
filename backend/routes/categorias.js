const router = require('express').Router();
const ctrl = require('../controllers/categoriaController');
const { auth, requireRole } = require('../middleware/auth');

router.use(auth);
router.get('/', ctrl.getAll);
router.post('/', requireRole('admin'), ctrl.create);
router.delete('/:id', requireRole('admin'), ctrl.remove);

module.exports = router;
