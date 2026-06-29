const router = require('express').Router();
const auth   = require('../middleware/auth');
const upload = require('../middleware/upload');
const ctrl   = require('../controllers/aiController');
router.post('/detect', auth, upload.single('image'), ctrl.detectWaste);
module.exports = router;
