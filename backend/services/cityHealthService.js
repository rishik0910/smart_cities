const db = require('../config/db');

async function calculateCityHealthIndex() {
  try {
    const [total,pending,resolved,overflowing,avgRes,emergency] = await Promise.all([
      db.query(`SELECT COUNT(*) FROM complaints`),
      db.query(`SELECT COUNT(*) FROM complaints WHERE status='pending'`),
      db.query(`SELECT COUNT(*) FROM complaints WHERE status='resolved'`),
      db.query(`SELECT COUNT(*) FROM complaints WHERE category='overflowing_bin' AND status NOT IN ('resolved','rejected')`),
      db.query(`SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (resolved_at-created_at))/3600),0) AS avg FROM complaints WHERE status='resolved' AND resolved_at IS NOT NULL`),
      db.query(`SELECT COUNT(*) FROM complaints WHERE is_emergency=true AND status NOT IN ('resolved','rejected')`),
    ]);
    const t=parseInt(total.rows[0].count)||1;
    const p=parseInt(pending.rows[0].count)||0;
    const r=parseInt(resolved.rows[0].count)||0;
    const ov=parseInt(overflowing.rows[0].count)||0;
    const em=parseInt(emergency.rows[0].count)||0;
    const avgHours=parseFloat(avgRes.rows[0].avg)||0;
    const resolutionRate=t>0?(r/t)*100:100;
    const score=Math.round(Math.max(0,Math.min(100,
      70+(Math.min(resolutionRate*0.3,30))-(Math.min(p*0.5,30))-(Math.min(ov*2,20))-(Math.min(em*5,25))-(avgHours>48?Math.min((avgHours-48)*0.1,15):0)
    )));
    const status=score>=85?'Excellent':score>=70?'Good':score>=50?'Moderate':'Critical';
    const color=score>=85?'#10B981':score>=70?'#F59E0B':score>=50?'#F97316':'#DC2626';
    const emoji=score>=85?'🟢':score>=70?'🟡':score>=50?'🟠':'🔴';
    const trend=await db.query(`SELECT DATE_TRUNC('month',created_at) AS month,COUNT(*) AS total,COUNT(*) FILTER(WHERE status='resolved') AS resolved FROM complaints WHERE created_at>NOW()-INTERVAL '6 months' GROUP BY month ORDER BY month`);
    return {score,status,color,emoji,metrics:{totalComplaints:t,pending:p,resolved:r,resolutionRate:Math.round(resolutionRate),avgResolutionHrs:Math.round(avgHours*10)/10,emergencyPending:em},trend:trend.rows.map(r=>({month:new Date(r.month).toLocaleString('default',{month:'short'}),total:parseInt(r.total),resolved:parseInt(r.resolved)}))};
  } catch(err){return{score:0,status:'Unknown',color:'#888',emoji:'⚪',metrics:{},trend:[]};}
}
module.exports={calculateCityHealthIndex};
