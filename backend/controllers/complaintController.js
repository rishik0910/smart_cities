const db = require('../config/db');
const ComplaintModel = require('../models/complaintModel');
const WardModel = require('../models/wardModel');
const { notifyStatusChange } = require('../services/notificationService');
const { pushStatusUpdate } = require('../config/firebase');
const { calculatePriority, getEstimatedDays, EMERGENCY_CATS } = require('../services/priorityService');
const { addPoints } = require('../services/rewardsService');
const { isValidState } = require('../utils/locationValidator');

exports.submit = async (req, res) => {
  const { category, description, ward_id, latitude, longitude, address, severity = 'medium', state } = req.body;
  const photo_url = req.file ? `/uploads/${req.file.filename}` : null;
  const is_emergency = EMERGENCY_CATS.includes(category);
  const priority = calculatePriority(latitude, longitude, category, severity);
  const est_days = getEstimatedDays(priority, category);
  if (!latitude || !longitude) return res.status(400).json({ error: 'Location required' });
  if (!ward_id) return res.status(400).json({ error: 'Ward required' });
  // state is optional metadata, but if provided it must be a recognized State/UT
  if (state && !isValidState(state)) {
    return res.status(400).json({ error: `'${state}' is not a recognized State/UT` });
  }
  try {
    const complaint = await ComplaintModel.create({
      user_id: req.user.id, ward_id, category, description, photo_url,
      latitude, longitude, address, priority, severity, estimated_days: est_days, is_emergency,
      state: state || null,
    });
    // Award points
    await addPoints(req.user.id, 'complaint_submitted');
    if (is_emergency) {
      // Notify admin immediately for emergency
      const admins = await db.query(`SELECT phone FROM users WHERE role='admin'`);
      const { notifyStatusChange: notify } = require('../services/notificationService');
      for (const a of admins.rows) {
        await notify(complaint.id, 'emergency', a.phone, `EMERGENCY: ${category} reported`);
      }
    }
    res.status(201).json({ complaint });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit complaint' });
  }
};

exports.myComplaints = async (req, res) => {
  try {
    const complaints = await ComplaintModel.findByUser(req.user.id);
    res.json({ complaints });
  } catch { res.status(500).json({ error: 'Failed to fetch' }); }
};

exports.getOne = async (req, res) => {
  try {
    const complaint = await ComplaintModel.findById(req.params.id);
    if (!complaint) return res.status(404).json({ error: 'Not found' });
    const history = await ComplaintModel.getHistory(req.params.id);
    res.json({ complaint, history });
  } catch { res.status(500).json({ error: 'Failed to fetch' }); }
};

exports.voteComplaint = async (req, res) => {
  try {
    await db.query(
      `INSERT INTO complaint_votes (complaint_id,user_id) VALUES ($1,$2)`,
      [req.params.id, req.user.id]
    );
    await db.query(`UPDATE complaints SET votes=votes+1 WHERE id=$1`, [req.params.id]);
    // Recalculate priority if votes > 5
    const r = await db.query(`SELECT votes,latitude,longitude,category,severity FROM complaints WHERE id=$1`, [req.params.id]);
    const c = r.rows[0];
    if (c.votes >= 5) {
      const newPriority = calculatePriority(c.latitude, c.longitude, c.category, 'high');
      await db.query(`UPDATE complaints SET priority=$1 WHERE id=$2`, [newPriority, req.params.id]);
    }
    res.json({ message: 'Vote recorded' });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Already voted' });
    res.status(500).json({ error: 'Vote failed' });
  }
};

exports.uploadAfterPhoto = async (req, res) => {
  const after_photo_url = req.file ? `/uploads/${req.file.filename}` : null;
  if (!after_photo_url) return res.status(400).json({ error: 'Photo required' });
  try {
    await db.query(`UPDATE complaints SET after_photo_url=$1,updated_at=NOW() WHERE id=$2`,
      [after_photo_url, req.params.id]);
    res.json({ message: 'After photo uploaded', after_photo_url });
  } catch { res.status(500).json({ error: 'Upload failed' }); }
};

exports.getWards = async (req, res) => {
  try {
    const wards = await WardModel.getAll();
    res.json({ wards });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch wards' });
  }
};

exports.detectWard = async (req, res) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) return res.status(400).json({ error: 'Latitude and longitude are required' });
  try {
    const ward = await WardModel.findByLocation(parseFloat(lat), parseFloat(lng));
    res.json({ ward });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to detect ward' });
  }
};

exports.submitFeedback = async (req, res) => {
  const { id } = req.params;
  const { rating, feedback } = req.body;
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }
  try {
    const result = await db.query(
      `UPDATE complaints 
       SET rating = $1, feedback = $2 
       WHERE id = $3 AND user_id = $4 AND status = 'resolved' 
       RETURNING *`,
      [rating, feedback, id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Complaint not found or not resolved yet' });
    }
    res.json({ message: 'Feedback submitted successfully', complaint: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
};