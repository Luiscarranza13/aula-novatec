const router = require('express').Router();
const ctrl = require('../controllers/mensajeController');
const { auth } = require('../middleware/auth');

router.use(auth);
router.get('/', ctrl.getBandeja);
router.post('/', ctrl.enviar);
router.put('/:id/leer', ctrl.marcarLeido);
router.delete('/:id', ctrl.eliminar);

module.exports = router;
