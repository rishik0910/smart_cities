const ComplaintModel = require('../models/complaintModel');
const WardModel = require('../models/wardModel');
const UserModel = require('../models/userModel');
const db = require('../config/db');

const fs = require('fs');
const path = require('path');
const settingsPath = path.join(__dirname, '../data/systemSettings.json');

const getSettingsData = () => {
  if (!fs.existsSync(settingsPath)) {
    const defaults = {
      points_complaint_submitted: 50,
      points_vote_recorded: 10,
      sla_garbage_dump: 3,
      sla_missed_pickup: 2,
      sla_overflowing_bin: 2,
      sla_other: 5
    };
    fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
    fs.writeFileSync(settingsPath, JSON.stringify(defaults, null, 2));
    return defaults;
  }
  return JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
};

exports.getStats = async (req, res) => {
  try {
    const stats = await ComplaintModel.getStats();
    res.json(stats);
  } catch (err) {
    console.error('Error in getStats:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

exports.getAllComplaints = async (req, res) => {
  try {
    const result = await ComplaintModel.findAll(req.query);
    res.json(result);
  } catch (err) {
    console.error('Error in getAllComplaints:', err);
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
};

exports.getWards = async (req, res) => {
  try {
    const wards = await WardModel.getAll();
    res.json({ wards });
  } catch (err) {
    console.error('Error in getWards:', err);
    res.status(500).json({ error: 'Failed to fetch wards' });
  }
};

exports.getOfficers = async (req, res) => {
  try {
    const officers = await UserModel.getAllOfficers();
    res.json({ officers });
  } catch (err) {
    console.error('Error in getOfficers:', err);
    res.status(500).json({ error: 'Failed to fetch officers' });
  }
};

exports.reassignComplaint = async (req, res) => {
  const { officer_id } = req.body;
  try {
    await ComplaintModel.updateStatus({
      complaintId: req.params.id,
      newStatus: 'assigned',
      changedBy: req.user.id,
      note: 'Reassigned by admin',
    });
    await db.query(`UPDATE complaints SET assigned_to = $1 WHERE id = $2`, [officer_id, req.params.id]);
    res.json({ message: 'Reassigned successfully' });
  } catch {
    res.status(500).json({ error: 'Reassignment failed' });
  }
};

exports.assignOfficerToWard = async (req, res) => {
  const { officer_id } = req.body;
  try {
    await WardModel.assignOfficer(req.params.id, officer_id);
    await UserModel.setWard(officer_id, req.params.id);
    res.json({ message: 'Officer assigned to ward' });
  } catch {
    res.status(500).json({ error: 'Assignment failed' });
  }
};

exports.exportCSV = async (req, res) => {
  try {
    const { complaints } = await ComplaintModel.findAll({ ...req.query, limit: 10000 });
    const headers = ['ID', 'Category', 'Status', 'Ward', 'Citizen', 'Phone', 'Officer', 'Address', 'Lat', 'Lng', 'Submitted', 'Resolved'];
    const rows = complaints.map(c => [
      c.id, c.category, c.status, c.ward_name, c.citizen_name, c.citizen_phone,
      c.officer_name || '', c.address || '', c.latitude, c.longitude,
      new Date(c.created_at).toISOString(),
      c.resolved_at ? new Date(c.resolved_at).toISOString() : '',
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=complaints-${Date.now()}.csv`);
    res.send(csv);
  } catch {
    res.status(500).json({ error: 'Export failed' });
  }
};

exports.createOfficer = async (req, res) => {
  const { name, phone, password } = req.body;
  if (!name || !phone || !password) {
    return res.status(400).json({ error: 'Name, phone, and password are required' });
  }
  try {
    const bcrypt = require('bcrypt');
    const hashed = await bcrypt.hash(password, 10);
    const result = await db.query(
      `INSERT INTO users (name, phone, password, role) VALUES ($1, $2, $3, 'officer') RETURNING id, name, phone, role`,
      [name, phone, hashed]
    );
    res.status(201).json({ officer: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Phone already registered' });
    res.status(500).json({ error: 'Failed to create officer' });
  }
};

exports.broadcastAlert = async (req, res) => {
  const { message, target } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });
  try {
    console.log(`BROADCAST ALERT [Target: ${target}]: ${message}`);
    const { sendSMS } = require('../services/notificationService');
    const roleFilter = target === 'all' ? '%' : (target === 'officers' ? 'officer' : 'citizen');
    const users = await db.query(`SELECT phone FROM users WHERE role LIKE $1 LIMIT 10`, [roleFilter]);
    
    for (const u of users.rows) {
      if (u.phone) {
        await sendSMS(u.phone, `[MUNICIPAL ALERT]: ${message}`);
      }
    }
    res.json({ message: `Broadcast sent successfully to ${users.rowCount} users.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send broadcast' });
  }
};

exports.getSettings = (req, res) => {
  try {
    res.json(getSettingsData());
  } catch {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

exports.updateSettings = (req, res) => {
  try {
    const data = getSettingsData();
    const next = { ...data, ...req.body };
    fs.writeFileSync(settingsPath, JSON.stringify(next, null, 2));
    res.json({ message: 'Settings updated successfully', settings: next });
  } catch {
    res.status(500).json({ error: 'Failed to update settings' });
  }
};
