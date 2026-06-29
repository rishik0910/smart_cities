import { useState, useEffect } from 'react';
import api from '../api';

export default function NearbyWarning({ latitude, longitude }) {
  const [nearby, setNearby] = useState([]);

  useEffect(() => {
    if (!latitude||!longitude) return;
    api.get('/complaints/nearby', {params:{lat:latitude,lng:longitude,radius:200}})
      .then(r => setNearby(r.data.nearby||[]))
      .catch(()=>{});
  }, [latitude,longitude]);

  if (!nearby.length) return null;

  const ICONS = {garbage_dump:'🗑️',missed_pickup:'🚛',overflowing_bin:'♻️',other:'📋'};

  return (
    <div style={{background:'#FEF3C7',border:'1.5px solid #F59E0B',borderRadius:'var(--radius-sm)',
      padding:'12px 14px',marginBottom:16,animation:'fadeSlideUp 0.3s ease both'}}>
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
        <span style={{fontSize:16}}>⚠️</span>
        <span style={{fontSize:12,fontWeight:700,color:'#92400E'}}>
          {nearby.length} similar complaint{nearby.length>1?'s':''} nearby!
        </span>
      </div>
      {nearby.slice(0,2).map(c=>(
        <div key={c.id} style={{display:'flex',alignItems:'center',gap:8,
          fontSize:11,color:'#92400E',padding:'4px 0',
          borderTop:'0.5px solid rgba(245,158,11,0.3)'}}>
          <span>{ICONS[c.category]||'📋'}</span>
          <span style={{flex:1,textTransform:'capitalize'}}>{c.category?.replace(/_/g,' ')}</span>
          <span style={{fontWeight:600}}>{c.distance}m away</span>
          <span style={{opacity:0.7}}>·</span>
          <span style={{textTransform:'capitalize',opacity:0.7}}>{c.status?.replace(/_/g,' ')}</span>
        </div>
      ))}
      <div style={{fontSize:10,color:'#92400E',marginTop:6,opacity:0.8}}>
        You can still report — your report helps show the issue is widespread.
      </div>
    </div>
  );
}
