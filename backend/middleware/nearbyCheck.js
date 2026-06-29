const db = require('../config/db');

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2-lat1)*Math.PI/180;
  const dLon = (lon2-lon1)*Math.PI/180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

async function checkNearby(req,res) {
  const { lat, lng, radius=200 } = req.query;
  if (!lat||!lng) return res.status(400).json({error:'lat and lng required'});
  try {
    const latD = parseFloat(radius)/111000;
    const lngD = parseFloat(radius)/(111000*Math.cos(parseFloat(lat)*Math.PI/180));
    const r = await db.query(
      `SELECT id,complaint_code,category,status,latitude,longitude,address,created_at
       FROM complaints WHERE latitude BETWEEN $1 AND $2 AND longitude BETWEEN $3 AND $4
         AND status NOT IN ('resolved','rejected') AND created_at > NOW() - INTERVAL '30 days' LIMIT 20`,
      [parseFloat(lat)-latD,parseFloat(lat)+latD,parseFloat(lng)-lngD,parseFloat(lng)+lngD]
    );
    const nearby = r.rows
      .map(c=>({...c,distance:Math.round(haversineDistance(parseFloat(lat),parseFloat(lng),parseFloat(c.latitude),parseFloat(c.longitude)))}))
      .filter(c=>c.distance<=parseFloat(radius));
    res.json({nearby,count:nearby.length});
  } catch(err){res.status(500).json({error:'Nearby check failed'});}
}

module.exports = {checkNearby,haversineDistance};
