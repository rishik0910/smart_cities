import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight:'100vh', background:'var(--sand-50)', display:'flex',
      alignItems:'center', justifyContent:'center', textAlign:'center', padding:20 }}>
      <div>
        <div style={{ fontSize:64, marginBottom:16 }}>🗺️</div>
        <div style={{ fontSize:24, fontWeight:800, marginBottom:8 }}>Page not found</div>
        <div style={{ fontSize:14, color:'var(--sand-400)', marginBottom:24 }}>
          The page you are looking for does not exist.
        </div>
        <button className="btn btn-primary btn-md" onClick={() => navigate('/')}>
          Go home →
        </button>
      </div>
    </div>
  );
}
