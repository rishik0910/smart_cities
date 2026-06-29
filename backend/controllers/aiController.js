const {detectWasteFromImage} = require('../services/aiDetectionService');
const fs = require('fs');

exports.detectWaste = async (req,res) => {
  if (!req.file) return res.status(400).json({error:'Image required'});
  try {
    const imageBuffer = fs.readFileSync(req.file.path);
    const base64      = imageBuffer.toString('base64');
    const mediaType   = req.file.mimetype || 'image/jpeg';
    const result      = await detectWasteFromImage(base64, mediaType);
    res.json(result);
  } catch(err) {
    console.error(err);
    res.status(500).json({error:'AI detection failed'});
  }
};
