const router = require('express').Router();
const ctrl = require('../controllers/materialController');
const { auth, requireRole } = require('../middleware/auth');

router.use(auth);
router.get('/:curso_id', ctrl.getByCurso);
router.post('/', requireRole('admin', 'profesor'), ctrl.upload.single('archivo'), ctrl.create);
router.delete('/:id', requireRole('admin', 'profesor'), ctrl.remove);

module.exports = router;
