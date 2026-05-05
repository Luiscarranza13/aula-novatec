const router = require('express').Router();
const ctrl = require('../controllers/perfilController');
const { auth } = require('../middleware/auth');

router.use(auth);
router.get('/', ctrl.getPerfil);
router.put('/', ctrl.upload.single('foto'), ctrl.updatePerfil);
router.put('/password', ctrl.changePassword);

module.exports = router;
