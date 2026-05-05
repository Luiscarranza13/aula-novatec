const router = require('express').Router();
const ctrl = require('../controllers/certificadoController');
const { auth } = require('../middleware/auth');

router.use(auth);
router.get('/:usuario_id/:curso_id', ctrl.generar);

module.exports = router;
