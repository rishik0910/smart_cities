const router = require('express').Router();
const ctrl = require('../controllers/authController');
const auth = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validate');

router.post('/register', validateRegister, ctrl.register);
router.post('/login', validateLogin, ctrl.login);
router.patch('/profile', auth, ctrl.updateProfile);
router.patch('/password', auth, ctrl.changePassword);

router.post('/google', ctrl.googleLogin);
router.post('/otp/request', ctrl.requestOtp);
router.post('/otp/verify', ctrl.verifyOtp);
router.post('/forgot-password', ctrl.forgotPassword);
router.post('/reset-password', ctrl.resetPassword);

module.exports = router;