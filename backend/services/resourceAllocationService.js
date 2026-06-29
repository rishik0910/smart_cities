const TABLE={
  garbage_dump:{low:{workers:1,vehicle:'Small pickup',equipment:['1 Shovel','1 Bag'],cost:800},medium:{workers:2,vehicle:'Medium truck',equipment:['2 Shovels','Bags','Rake'],cost:1500},high:{workers:4,vehicle:'Large garbage truck',equipment:['4 Shovels','1 JCB','Bags'],cost:4200},critical:{workers:6,vehicle:'Large truck + JCB',equipment:['6 Shovels','JCB','10 Bags'],cost:8500}},
  overflowing_bin:{low:{workers:1,vehicle:'Small pickup',equipment:['Bags'],cost:400},medium:{workers:1,vehicle:'Collection vehicle',equipment:['2 Bags','Shovel'],cost:700},high:{workers:2,vehicle:'Collection vehicle',equipment:['4 Bags','2 Shovels'],cost:1200},critical:{workers:3,vehicle:'Large truck',equipment:['6 Bags','Shovels','PPE'],cost:2000}},
  medical_waste:{low:{workers:2,vehicle:'Biohazard vehicle',equipment:['PPE Kits','Biohazard bags'],cost:3000},medium:{workers:3,vehicle:'Biohazard vehicle',equipment:['PPE','Bags','Disinfectant'],cost:5000},high:{workers:4,vehicle:'Specialized vehicle',equipment:['Full PPE','Drums','Disinfectant spray'],cost:8000},critical:{workers:6,vehicle:'Specialized + Ambulance',equipment:['Full PPE','Drums','Disinfectant','Barrier tape'],cost:15000}},
  hazardous_waste:{low:{workers:2,vehicle:'Hazmat vehicle',equipment:['PPE','Containment bags'],cost:4000},medium:{workers:3,vehicle:'Hazmat vehicle',equipment:['Full PPE','Drums'],cost:7000},high:{workers:5,vehicle:'Hazmat + Tanker',equipment:['Full PPE','Drums','Neutralizer'],cost:12000},critical:{workers:8,vehicle:'Full Hazmat team',equipment:['Hazmat suits','Drums','Neutralizer','Fire unit'],cost:25000}},
  default:{low:{workers:1,vehicle:'Small pickup',equipment:['Shovel','Bags'],cost:600},medium:{workers:2,vehicle:'Medium truck',equipment:['2 Shovels','Bags'],cost:1200},high:{workers:3,vehicle:'Large truck',equipment:['3 Shovels','Bags'],cost:2500},critical:{workers:5,vehicle:'Large truck + JCB',equipment:['JCB','Shovels','Bags'],cost:5000}},
};
function allocateResources(category,severity,votes=0){
  const t=TABLE[category]||TABLE.default;
  const b=t[severity]||t.medium;
  const m=votes>10?1.5:votes>5?1.2:1;
  return{...b,estimatedCost:Math.round(b.cost*m),votesAdjusted:votes>5,estimatedTime:severity==='critical'?'2-4 hours':severity==='high'?'4-8 hours':severity==='medium'?'1-2 days':'3-5 days'};
}
module.exports={allocateResources};
