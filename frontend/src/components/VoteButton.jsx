import { useState } from 'react';
import api from '../api';
import { showToast } from './Toast';

export default function VoteButton({ complaintId, votes=0 }) {
  const [count, setCount] = useState(votes);
  const [voted, setVoted] = useState(false);
  const [loading,setLoading] = useState(false);

  const handleVote = async () => {
    if (voted||loading) return;
    setLoading(true);
    try {
      await api.post(`/complaints/${complaintId}/vote`);
      setCount(c=>c+1);
      setVoted(true);
      showToast('Vote recorded!','success');
    } catch(err) {
      if(err.response?.status===400) showToast('Already voted','error');
      else showToast('Vote failed','error');
    } finally {setLoading(false);}
  };

  return (
    <button onClick={handleVote} disabled={voted||loading} style={{
      display:'flex',alignItems:'center',gap:8,padding:'9px 16px',
      borderRadius:'var(--radius-sm)',border:`1.5px solid ${voted?'var(--green-200)':'var(--sand-200)'}`,
      background:voted?'var(--green-50)':'var(--white)',cursor:voted?'default':'pointer',
      fontFamily:'var(--font)',transition:'all 0.2s ease',width:'100%',
    }}>
      <span style={{fontSize:18}}>{voted?'✅':'👍'}</span>
      <div style={{flex:1,textAlign:'left'}}>
        <div style={{fontSize:12,fontWeight:700,color:voted?'var(--green-600)':'var(--ink)'}}>
          {voted?'You reported this too':'I also see this issue'}
        </div>
        <div style={{fontSize:11,color:'var(--sand-400)',marginTop:1}}>
          {count} {count===1?'person':'people'} reported this
        </div>
      </div>
    </button>
  );
}
