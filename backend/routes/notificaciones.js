const router = require('express').Router();
const ctrl = require('../controllers/notificacionController');
const { auth } = require('../middleware/auth');

router.use(auth);
router.get('/', ctrl.getMias);
router.put('/:id/leer', ctrl.marcarLeida);
router.put('/leer-todas', ctrl.marcarTodasLeidas);

module.exports = router;
