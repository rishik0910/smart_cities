const db = require('../config/db');

const POINTS = {
  complaint_submitted: 10,
  complaint_verified:  20,
  complaint_resolved:  15,
};

const BADGES = [
  {id:'first_report',  label:'First Reporter', points:0,  icon:'🌱', desc:'Submitted your first complaint'},
  {id:'active_citizen',label:'Active Citizen',  points:50, icon:'⭐', desc:'Earned 50 points'},
  {id:'champion',      label:'Ward Champion',   points:100,icon:'🏆', desc:'Earned 100 points'},
  {id:'guardian',      label:'City Guardian',   points:250,icon:'🛡️', desc:'Earned 250 points'},
];

async function addPoints(userId, action) {
  const pts = POINTS[action] || 0;
  if (!pts) return;
  try {
    await db.query(
      `INSERT INTO user_points (user_id, points) VALUES ($1,$2)
       ON CONFLICT (user_id) DO UPDATE SET points = user_points.points + $2, updated_at = NOW()`,
      [userId, pts]
    );
    await checkAndAwardBadges(userId);
  } catch(err) { console.error('Rewards error:', err.message); }
}

async function checkAndAwardBadges(userId) {
  try {
    const r = await db.query(`SELECT points, badges FROM user_points WHERE user_id=$1`,[userId]);
    if (!r.rows[0]) return;
    const {points, badges=[]} = r.rows[0];
    const newBadges = BADGES.filter(b=>points>=b.points&&!badges.includes(b.id)).map(b=>b.id);
    if (newBadges.length) {
      await db.query(
        `UPDATE user_points SET badges = badges || $1::text[] WHERE user_id=$2`,
        [newBadges,userId]
      );
    }
  } catch(err) { console.error('Badge error:', err.message); }
}

async function getUserPoints(userId) {
  try {
    const r = await db.query(`SELECT * FROM user_points WHERE user_id=$1`,[userId]);
    return r.rows[0] || {points:0,badges:[]};
  } catch { return {points:0,badges:[]}; }
}

module.exports = {addPoints,getUserPoints,BADGES,POINTS};
