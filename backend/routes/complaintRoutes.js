const router = require('express').Router();
const auth   = require('../middleware/auth');
const upload = require('../middleware/upload');
const {validateComplaint} = require('../middleware/validate');
const ctrl   = require('../controllers/complaintController');
const {checkNearby} = require('../middleware/nearbyCheck');

router.get('/nearby',            checkNearby);
router.post('/',                 auth, upload.single('photo'), validateComplaint, ctrl.submit);
router.get('/wards',             auth, ctrl.getWards);
router.get('/detect-ward',       auth, ctrl.detectWard);
router.get('/my',                auth, ctrl.myComplaints);
router.post('/:id/feedback',     auth, ctrl.submitFeedback);
router.get('/:id',               auth, ctrl.getOne);
router.post('/:id/vote',         auth, ctrl.voteComplaint);
router.post('/:id/after-photo',  auth, upload.single('photo'), ctrl.uploadAfterPhoto);

module.exports = router;
