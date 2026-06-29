import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import StatusTimeline from '../components/StatusTimeline';
import PriorityBadge from '../components/PriorityBadge';
import BeforeAfterView from '../components/BeforeAfterView';
import VoteButton from '../components/VoteButton';
import { SinglePinMap } from '../components/MapView';
import { getComplaint } from '../api';

const ICONS = {
  garbage_dump:'🗑️',missed_pickup:'🚛',overflowing_bin:'♻️',
  construction_waste:'🏗️',plastic_waste:'🛍️',e_waste:'💻',
  medical_waste:'☣️',hazardous_waste:'⚠️',other:'📋',
};

export default function ComplaintDetail() {
  const {id} = useParams();
  const navigate = useNavigate();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getComplaint(id).then(r=>setData(r.data)).catch(console.error).finally(()=>setLoading(false));
  },[id]);

  if (loading) return (
    <div className="page" style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh'}}>
      <div style={{textAlign:'center'}}>
        <div style={{width:40,height:40,borderRadius:'50%',border:'3px solid var(--green-100)',
          borderTop:'3px solid var(--green-500)',animation:'spin 0.8s linear infinite',margin:'0 auto 12px'}}/>
        <div style={{fontSize:13,color:'var(--sand-400)',fontWeight:600}}>Loading...</div>
      </div>
    </div>
  );

  if (!data) return (
    <div className="page" style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:48,marginBottom:12}}>😕</div>
        <div style={{fontSize:14,fontWeight:700}}>Complaint not found</div>
      </div>
    </div>
  );

  const {complaint:c, history} = data;
  const daysAgo   = Math.floor((Date.now()-new Date(c.created_at))/86400000);
  const timeLabel = daysAgo===0?'Today':daysAgo===1?'Yesterday':`${daysAgo} days ago`;
  const isEmergency = c.is_emergency;

  const Section = ({title,children,delay='0s'}) => (
    <div className="reveal" style={{padding:'16px 20px',borderBottom:'1px solid var(--sand-100)',animationDelay:delay}}>
      <div style={{fontSize:10,fontWeight:700,letterSpacing:1.2,textTransform:'uppercase',
        color:'var(--sand-400)',marginBottom:12}}>{title}</div>
      {children}
    </div>
  );

  return (
    <div className="page">
      <div className="topbar">
        <button className="back-btn" onClick={()=>navigate(-1)}>←</button>
        <div>
          <div className="topbar-title">
            {c.complaint_code||`#${c.id}`}
          </div>
        </div>
        <div style={{marginLeft:'auto',display:'flex',gap:6,alignItems:'center'}}>
          {isEmergency&&<span style={{fontSize:10,fontWeight:700,padding:'3px 8px',borderRadius:20,background:'#FEE2E2',color:'#991B1B'}}>⚠️ Emergency</span>}
          <StatusBadge status={c.status} />
        </div>
      </div>

      {/* Hero */}
      <div className="stagger-1" style={{background:'var(--white)',padding:'18px 20px',
        borderBottom:'1px solid var(--sand-100)',display:'flex',alignItems:'flex-start',gap:14}}>
        <div style={{width:54,height:54,borderRadius:14,
          background:isEmergency?'#FEE2E2':'var(--green-50)',
          display:'flex',alignItems:'center',justifyContent:'center',
          fontSize:26,flexShrink:0,animation:'scaleInBounce 0.4s ease both'}}>
          {ICONS[c.category]||'📋'}
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:17,fontWeight:800,textTransform:'capitalize',letterSpacing:-0.3,marginBottom:6}}>
            {c.category?.replace(/_/g,' ')}
          </div>
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            {c.priority&&<PriorityBadge priority={c.priority} />}
          </div>
          <div style={{fontSize:11,color:'var(--sand-400)',marginTop:6}}>
            📍 {c.address||`${parseFloat(c.latitude).toFixed(4)}, ${parseFloat(c.longitude).toFixed(4)}`}{c.ward_id ? ` · ${c.ward_id}` : ''}{c.state ? `, ${c.state}` : ''}
            &nbsp;·&nbsp; 🕐 {timeLabel}
          </div>
        </div>
      </div>

      {/* Estimated resolution */}
      {c.estimated_days&&c.status!=='resolved'&&(
        <div style={{padding:'12px 20px',background:'var(--green-50)',
          borderBottom:'1px solid var(--green-100)'}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <span style={{fontSize:16}}>⏱️</span>
            <div>
              <div style={{fontSize:11,fontWeight:700,color:'var(--green-600)'}}>Expected resolution</div>
              <div style={{fontSize:13,fontWeight:800,color:'var(--green-600)'}}>
                {c.estimated_days<=1?'Within 24 hours':`${c.estimated_days} days`}
              </div>
            </div>
          </div>
        </div>
      )}

      {c.description&&<Section title="Description" delay="0.05s">
        <p style={{fontSize:13,color:'var(--sand-600)',lineHeight:1.7}}>{c.description}</p>
      </Section>}

      {/* Before & After */}
      {(c.photo_url||c.after_photo_url)&&(
        <Section title="Before & After" delay="0.1s">
          <BeforeAfterView beforeUrl={c.photo_url} afterUrl={c.after_photo_url} />
        </Section>
      )}

      <Section title="Location" delay="0.15s">
        <SinglePinMap latitude={c.latitude} longitude={c.longitude} height={180} />
      </Section>

      {/* Vote */}
      {!['resolved','rejected'].includes(c.status)&&(
        <Section title="Community" delay="0.2s">
          <VoteButton complaintId={c.id} votes={c.votes||0} />
        </Section>
      )}

      {c.resolution_note&&<Section title="Officer note" delay="0.25s">
        <div style={{background:'var(--green-50)',border:'1px solid var(--green-100)',
          borderRadius:'var(--radius-sm)',padding:'12px 14px'}}>
          <div style={{fontSize:13,color:'var(--green-600)',lineHeight:1.5}}>{c.resolution_note}</div>
        </div>
      </Section>}

      <Section title="Status timeline" delay="0.3s">
        <StatusTimeline history={history} />
      </Section>
      <div style={{height:40}}/>
    </div>
  );
}
