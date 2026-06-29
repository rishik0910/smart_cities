import { useNavigate } from 'react-router-dom';
import RewardsCard from '../components/RewardsCard';
 
export default function Rewards() {
  const navigate = useNavigate();
  return (
    <div className="page">
      <div className="topbar">
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <div className="topbar-title">Rewards</div>
      </div>
      <div style={{ padding: '20px 16px', maxWidth: 520 }}>
        <RewardsCard />
        <button className="btn-outline btn-full btn-md" onClick={() => navigate('/leaderboard')}>
          View Leaderboard →
        </button>
      </div>
    </div>
  );
}
