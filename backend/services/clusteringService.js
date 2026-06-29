const db=require('../config/db');
function haversine(lat1,lon1,lat2,lon2){
  const R=6371000;
  const dL=(lat2-lat1)*Math.PI/180;
  const dl=(lon2-lon1)*Math.PI/180;
  const a=Math.sin(dL/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dl/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}
async function clusterComplaints(radiusMeters=300){
  const r=await db.query(`SELECT id,category,status,priority,latitude,longitude,address,created_at,votes FROM complaints WHERE status NOT IN ('resolved','rejected') AND latitude IS NOT NULL ORDER BY created_at DESC`);
  const pts=r.rows;
  const visited=new Set();
  const clusters=[];
  pts.forEach(p=>{
    if(visited.has(p.id))return;
    const nearby=pts.filter(q=>{
      if(visited.has(q.id))return false;
      return haversine(parseFloat(p.latitude),parseFloat(p.longitude),parseFloat(q.latitude),parseFloat(q.longitude))<=radiusMeters;
    });
    if(nearby.length>=2){
      nearby.forEach(n=>visited.add(n.id));
      const lat=nearby.reduce((s,n)=>s+parseFloat(n.latitude),0)/nearby.length;
      const lng=nearby.reduce((s,n)=>s+parseFloat(n.longitude),0)/nearby.length;
      const maxVotes=Math.max(...nearby.map(n=>n.votes||0));
      const priority=nearby.length>=10||maxVotes>15?'critical':nearby.length>=5?'high':'medium';
      clusters.push({id:`cluster_${p.id}`,isCluster:true,count:nearby.length,lat,lng,complaints:nearby,priority,category:nearby[0].category,address:nearby[0].address||`${lat.toFixed(4)},${lng.toFixed(4)}`});
    }else{
      visited.add(p.id);
      clusters.push({...p,isCluster:false,count:1,lat:parseFloat(p.latitude),lng:parseFloat(p.longitude)});
    }
  });
  return clusters;
}
async function predictBinPlacements(){
  const r=await db.query(`SELECT latitude,longitude,COUNT(*) AS cnt FROM complaints WHERE created_at>NOW()-INTERVAL '90 days' GROUP BY latitude,longitude`);
  const pts=r.rows.map(r=>({lat:parseFloat(r.latitude),lng:parseFloat(r.longitude),count:parseInt(r.cnt)}));
  const placements=[];
  const visited=new Set();
  pts.forEach((p,i)=>{
    if(visited.has(i))return;
    const nearby=pts.filter((q,j)=>!visited.has(j)&&haversine(p.lat,p.lng,q.lat,q.lng)<=300);
    const totalComplaints=nearby.reduce((s,n)=>s+n.count,0);
    if(totalComplaints>=5){
      nearby.forEach((_,j)=>visited.add(j));
      placements.push({lat:nearby.reduce((s,n)=>s+n.lat,0)/nearby.length,lng:nearby.reduce((s,n)=>s+n.lng,0)/nearby.length,complaintsInArea:totalComplaints,recommendation:`Install ${totalComplaints>=15?'2 large bins':'1 medium bin'} here`,reason:`${totalComplaints} complaints reported within 300m`});
    }
  });
  return placements.sort((a,b)=>b.complaintsInArea-a.complaintsInArea).slice(0,10);
}
module.exports={clusterComplaints,predictBinPlacements};
