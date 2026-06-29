const router = require('express').Router();
const auth   = require('../middleware/auth');
const upload = require('../middleware/upload');
const {validateStatusUpdate} = require('../middleware/validate');
const ctrl   = require('../controllers/officerController');

router.get('/complaints',                    auth, ctrl.wardComplaints);
router.patch('/complaints/:id',              auth, validateStatusUpdate, ctrl.updateStatus);
router.post('/complaints/:id/after-photo',   auth, upload.single('photo'), ctrl.uploadAfterPhoto);
module.exports = router;