import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Leaderboard() {
  const [data,setData]     = useState([]);
  const [loading,setLoading]=useState(true);
  const navigate = useNavigate();

  useEffect(()=>{
    api.get('/rewards/leaderboard').then(r=>setData(r.data.leaderboard||[])).finally(()=>setLoading(false));
  },[]);

  const medals=['🥇','🥈','🥉'];
  const BADGES = {first_report:'🌱',active_citizen:'⭐',champion:'🏆',guardian:'🛡️'};

  return (
    <div className="page">
      <div className="topbar">
        <button className="back-btn" onClick={()=>navigate(-1)}>←</button>
        <div className="topbar-title">Leaderboard</div>
      </div>
      <div style={{padding:'20px 16px'}}>
        <div style={{textAlign:'center',marginBottom:24}}>
          <div style={{fontSize:40,marginBottom:8,animation:'logoBounce 0.6s ease both'}}>🏆</div>
          <div style={{fontSize:14,fontWeight:700}}>Top reporters this month</div>
          <div style={{fontSize:12,color:'var(--sand-400)',marginTop:4}}>Help your city — climb the ranks!</div>
        </div>
        {loading ? <p style={{textAlign:'center',color:'var(--sand-400)'}}>Loading...</p> :
          data.map((u,i)=>(
            <div key={i} className="complaint-item-anim" style={{animationDelay:`${i*0.06}s`}}>
              <div style={{background:'var(--white)',border:'1px solid var(--sand-100)',
                borderRadius:'var(--radius-sm)',padding:'14px 16px',marginBottom:8,
                display:'flex',alignItems:'center',gap:12,
                ...(i===0?{border:'2px solid #F59E0B',background:'#FFFBEB'}:{})}}>
                <div style={{fontSize:22,width:30,textAlign:'center'}}>
                  {medals[i]||`#${u.rank}`}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:700}}>{u.name}</div>
                  <div style={{display:'flex',gap:4,marginTop:3,flexWrap:'wrap'}}>
                    {(u.badges||[]).map(b=>(
                      <span key={b} style={{fontSize:12}}>{BADGES[b]||'🏅'}</span>
                    ))}
                  </div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:16,fontWeight:800,color:'var(--green-600)'}}>{u.points}</div>
                  <div style={{fontSize:10,color:'var(--sand-400)'}}>points</div>
                </div>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}
