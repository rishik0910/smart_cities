const ComplaintModel = require('../models/complaintModel');
const UserModel      = require('../models/userModel');
const {notifyStatusChange} = require('../services/notificationService');
const {pushStatusUpdate}   = require('../config/firebase');
const {addPoints}          = require('../services/rewardsService');
const upload = require('../middleware/upload');

exports.wardComplaints = async (req,res) => {
  try {
    const {status,priority,sort='created_at'} = req.query;
    let q = `SELECT c.*, u.name AS citizen_name, u.phone AS citizen_phone
             FROM complaints c 
             JOIN users u ON c.user_id = u.id
             LEFT JOIN wards w ON w.ward_name = c.ward_id
             WHERE w.officer_id = $1 OR c.assigned_to = $1`;
    const params=[req.user.id];
    if (status)   {params.push(status);   q+=` AND c.status=$${params.length}`;}
    if (priority) {params.push(priority); q+=` AND c.priority=$${params.length}`;}
    // Emergency first, then by priority, then by date
    q+=` ORDER BY c.is_emergency DESC, CASE c.priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END, c.created_at DESC`;
    const r = await ComplaintModel.db?.query(q,params) || await require('../config/db').query(q,params);
    res.json({complaints:r.rows});
  } catch(err) {res.status(500).json({error:'Failed'});}
};

exports.updateStatus = async (req,res) => {
  const {status,resolution_note} = req.body;
  const valid=['assigned','in_progress','resolved','rejected'];
  if (!valid.includes(status)) return res.status(400).json({error:'Invalid status'});
  try {
    const complaint = await ComplaintModel.findById(req.params.id);
    if (!complaint) return res.status(404).json({error:'Not found'});
    await ComplaintModel.updateStatus({
      complaintId:req.params.id,newStatus:status,changedBy:req.user.id,note:resolution_note||''
    });
    if (status==='resolved') await addPoints(complaint.user_id,'complaint_resolved');
    const citizen = await UserModel.findById(complaint.user_id);
    if (citizen?.phone) await notifyStatusChange(complaint.id,status,citizen.phone,resolution_note);
    pushStatusUpdate(complaint.id,status,complaint.ward_id);
    res.json({message:'Updated'});
  } catch(err) {res.status(500).json({error:'Failed'});}
};

exports.uploadAfterPhoto = async (req,res) => {
  const after_photo_url = req.file ? `/uploads/${req.file.filename}` : null;
  if (!after_photo_url) return res.status(400).json({error:'Photo required'});
  try {
    await require('../config/db').query(
      `UPDATE complaints SET after_photo_url=$1,updated_at=NOW() WHERE id=$2`,
      [after_photo_url,req.params.id]
    );
    res.json({message:'After photo uploaded',after_photo_url});
  } catch {res.status(500).json({error:'Failed'});}
};
