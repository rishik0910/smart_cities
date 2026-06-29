const db=require('../config/db');
const WORKER_COST_PER_DAY=700;
const FUEL_COST_PER_KM=12;
const VEHICLE_COSTS={small:800,medium:1500,large:3000};

async function estimateMonthlyBudget(){
  try{
    const complaints=await db.query(`SELECT category,severity,COUNT(*) AS cnt FROM complaints WHERE created_at>NOW()-INTERVAL '30 days' GROUP BY category,severity`);
    let totalWorkerDays=0,totalFuel=0,totalVehicle=0;
    complaints.rows.forEach(c=>{
      const cnt=parseInt(c.cnt);
      const sev=c.severity||'medium';
      const workerMap={low:0.5,medium:1,high:2,critical:4};
      const fuelMap={low:10,medium:25,high:50,critical:80};
      const vehMap={low:'small',medium:'medium',high:'large',critical:'large'};
      totalWorkerDays+=cnt*(workerMap[sev]||1);
      totalFuel+=cnt*(fuelMap[sev]||25);
      totalVehicle+=cnt*(VEHICLE_COSTS[vehMap[sev]||'medium']);
    });
    const workers=Math.round(totalWorkerDays*WORKER_COST_PER_DAY);
    const fuel=Math.round(totalFuel*FUEL_COST_PER_KM);
    const vehicles=Math.round(totalVehicle*0.1);
    const misc=Math.round((workers+fuel+vehicles)*0.1);
    const total=workers+fuel+vehicles+misc;
    return{workers,fuel,vehicles,misc,total,breakdown:[
      {label:'Workers',amount:workers,color:'#1E5C28',pct:Math.round(workers/total*100)},
      {label:'Fuel',amount:fuel,color:'#F59E0B',pct:Math.round(fuel/total*100)},
      {label:'Vehicles',amount:vehicles,color:'#3B82F6',pct:Math.round(vehicles/total*100)},
      {label:'Miscellaneous',amount:misc,color:'#8B5CF6',pct:Math.round(misc/total*100)},
    ]};
  }catch(err){return{workers:0,fuel:0,vehicles:0,misc:0,total:0,breakdown:[]};}
}
module.exports={estimateMonthlyBudget};
