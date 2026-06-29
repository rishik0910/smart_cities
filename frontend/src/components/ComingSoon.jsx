import { useNavigate } from 'react-router-dom';
 
export default function ComingSoon({ title, description, icon = '🚧' }) {
  const navigate = useNavigate();
  return (
    <div className="page">
      <div className="topbar">
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <div className="topbar-title">{title}</div>
      </div>
      <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--sand-400)' }}>
        <div style={{ fontSize: 40, marginBottom: 14 }}>{icon}</div>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: 'var(--ink)' }}>{title} is on the way</div>
        <div style={{ fontSize: 13, maxWidth: 360, margin: '0 auto' }}>{description}</div>
        <button className="btn-outline btn-md" style={{ marginTop: 20 }} onClick={() => navigate('/home')}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
