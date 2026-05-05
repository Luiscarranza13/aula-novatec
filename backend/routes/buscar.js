const router = require('express').Router();
const ctrl = require('../controllers/buscadorController');
const { auth } = require('../middleware/auth');

router.use(auth);
router.get('/', ctrl.buscar);

module.exports = router;
