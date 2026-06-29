const router = require('express').Router();
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const ctrl = require('../controllers/adminController');
const guard = [auth, adminOnly];
router.get('/stats', ...guard, ctrl.getStats);
router.get('/complaints', ...guard, ctrl.getAllComplaints);
router.get('/wards', ...guard, ctrl.getWards);
router.get('/officers', ...guard, ctrl.getOfficers);
router.patch('/complaints/:id/reassign', ...guard, ctrl.reassignComplaint);
router.patch('/wards/:id/officer', ...guard, ctrl.assignOfficerToWard);
router.get('/export', ...guard, ctrl.exportCSV);

// New features
router.post('/officers', ...guard, ctrl.createOfficer);
router.post('/broadcast', ...guard, ctrl.broadcastAlert);
router.get('/settings', ...guard, ctrl.getSettings);
router.post('/settings', ...guard, ctrl.updateSettings);

module.exports = router;
