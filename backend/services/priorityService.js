const {haversineDistance} = require('../middleware/nearbyCheck');

const HIGH_PRIORITY_LOCATIONS = [
  {name:'MGM Hospital',lat:17.9784,lng:79.5941},
  {name:'KMC Hospital',lat:17.9850,lng:79.5990},
  {name:'SR University',lat:17.9700,lng:79.5800},
  {name:'Kakatiya University',lat:17.9500,lng:79.5600},
  {name:'Bus Stand',lat:17.9880,lng:79.5960},
];
const EMERGENCY_CATS = ['medical_waste','hazardous_waste','e_waste'];

function calculatePriority(lat,lng,category,severity) {
  if (EMERGENCY_CATS.includes(category)) return 'critical';
  if (severity==='critical') return 'critical';
  if (severity==='high') return 'high';
  const near = HIGH_PRIORITY_LOCATIONS.some(l=>haversineDistance(parseFloat(lat),parseFloat(lng),l.lat,l.lng)<300);
  if (near) return 'high';
  return severity||'medium';
}

function getEstimatedDays(priority,category) {
  if (EMERGENCY_CATS.includes(category)) return 1;
  return {critical:1,high:2,medium:4,low:7}[priority]||4;
}

module.exports = {calculatePriority,getEstimatedDays,EMERGENCY_CATS,HIGH_PRIORITY_LOCATIONS};
