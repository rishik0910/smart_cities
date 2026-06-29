import { useState, useEffect } from 'react';
import api from '../api';

const BADGE_ICONS = {
  first_report:'🌱', active_citizen:'⭐', champion:'🏆', guardian:'🛡️',
};

export default function RewardsCard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/rewards/my').then(r=>setData(r.data)).catch(console.error);
  },[]);

  if (!data) return null;

  const nextProgress = data.nextBadge
    ? Math.round((data.points/data.nextBadge.points)*100)
    : 100;

  return (
    <div style={{background:'var(--white)',border:'1px solid var(--sand-100)',
      borderRadius:'var(--radius-sm)',padding:'16px 18px',marginBottom:12}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:1,textTransform:'uppercase',color:'var(--sand-400)'}}>
          My rewards
        </div>
        <div style={{fontSize:20,fontWeight:800,color:'var(--green-600)'}}>
          {data.points} pts
        </div>
      </div>

      {/* Progress to next badge */}
      {data.nextBadge && (
        <div style={{marginBottom:12}}>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'var(--sand-400)',marginBottom:5}}>
            <span>Next: {data.nextBadge.icon} {data.nextBadge.label}</span>
            <span>{data.points}/{data.nextBadge.points}</span>
          </div>
          <div style={{height:5,background:'var(--sand-100)',borderRadius:3,overflow:'hidden'}}>
            <div style={{height:'100%',background:'var(--green-500)',borderRadius:3,
              width:`${nextProgress}%`,transition:'width 0.8s cubic-bezier(0.34,1.56,0.64,1)'}} />
          </div>
        </div>
      )}

      {/* Earned badges */}
      {data.earnedBadges?.length > 0 && (
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          {data.earnedBadges.map(b => (
            <div key={b.id} title={b.desc} style={{
              display:'flex',alignItems:'center',gap:5,fontSize:11,fontWeight:600,
              background:'var(--green-50)',color:'var(--green-600)',
              padding:'4px 10px',borderRadius:20,cursor:'help',
            }}>
              {b.icon} {b.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
