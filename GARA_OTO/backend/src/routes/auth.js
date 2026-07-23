const router = require('express').Router();
const ctrl = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { registerValidator, loginValidator } = require('../validators/authValidator');
const validate = require('../middleware/validate');

router.post('/register', registerValidator, validate, ctrl.register);
router.post('/login', loginValidator, validate, ctrl.login);
router.get('/me', protect, ctrl.getMe);
router.put('/change-password', protect, ctrl.changePassword);

module.exports = router;