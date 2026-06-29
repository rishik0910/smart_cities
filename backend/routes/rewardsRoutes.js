const router = require('express').Router();
const auth   = require('../middleware/auth');
const ctrl   = require('../controllers/rewardsController');
router.get('/my',         auth, ctrl.getMyPoints);
router.get('/leaderboard',     ctrl.getLeaderboard);
module.exports = router;
