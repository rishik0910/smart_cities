const {getUserPoints,BADGES} = require('../services/rewardsService');

exports.getMyPoints = async (req,res) => {
  try {
    const data = await getUserPoints(req.user.id);
    const earnedBadges = BADGES.filter(b=>data.badges?.includes(b.id));
    const nextBadge    = BADGES.find(b=>!data.badges?.includes(b.id)&&data.points<b.points);
    res.json({...data,earnedBadges,nextBadge,allBadges:BADGES});
  } catch {res.status(500).json({error:'Failed'});}
};

exports.getLeaderboard = async (req,res) => {
  try {
    const r = await require('../config/db').query(
      `SELECT u.name, up.points, up.badges,
              RANK() OVER (ORDER BY up.points DESC) as rank
       FROM user_points up JOIN users u ON u.id=up.user_id
       ORDER BY up.points DESC LIMIT 10`
    );
    res.json({leaderboard:r.rows});
  } catch {res.status(500).json({error:'Failed'});}
};
