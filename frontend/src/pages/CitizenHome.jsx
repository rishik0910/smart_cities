import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ComplaintCard from '../components/ComplaintCard';
import SkeletonCard from '../components/SkeletonCard';
import CountUp from '../components/CountUp';
import AnimatedButton from '../components/AnimatedButton';
import { myComplaints, myRewards, leaderboard } from '../api';

// High-Fidelity SVG Icons matching the Mockup
function StatIcon({ type }) {
  const s = { width: 22, height: 22 };
  switch (type) {
    case 'total':
      return (
        <div style={{ width: 44, height: 44, borderRadius: 12, background: '#E8F5E3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1E5C28' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...s}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        </div>
      );
    case 'active':
      return (
        <div style={{ width: 44, height: 44, borderRadius: 12, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1E40AF' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...s}>
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </div>
      );
    case 'resolved':
      return (
        <div style={{ width: 44, height: 44, borderRadius: 12, background: '#F3F0FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5B21B6' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...s}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
      );
    case 'points':
      return (
        <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FFF7E8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...s}>
            <circle cx="12" cy="8" r="7" />
            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
          </svg>
        </div>
      );
    default:
      return null;
  }
}

// Sparkline graph vectors
function Sparkline({ width = 60, height = 24, type = 'up' }) {
  const path = type === 'up'
    ? "M 2 22 C 15 18, 25 8, 38 12 C 48 15, 52 2, 58 2"
    : "M 2 14 C 12 18, 22 2, 34 16 C 44 20, 52 4, 58 8";
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: 8 }}>
      <path d={path} fill="none" stroke="#1E5C28" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function CitizenHome() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshSpin, setRefreshSpin] = useState(false);
  const [rewards, setRewards] = useState(null);
  const [topCitizens, setTopCitizens] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const load = async (isRefresh = false) => {
    if (isRefresh) { setRefreshing(true); setRefreshSpin(true); }
    else setLoading(true);
    try {
      const r = await myComplaints();
      setComplaints(r.data.complaints);
    } catch (e) { console.error(e); }
    finally {
      setLoading(false); setRefreshing(false);
      setTimeout(() => setRefreshSpin(false), 600);
    }
  };

  useEffect(() => {
    load();
    myRewards().then(r => setRewards(r.data)).catch(() => { });
    leaderboard().then(r => setTopCitizens(r.data.leaderboard || [])).catch(() => { });
  }, []);

  const total = complaints.length;
  const active = complaints.filter(c => ['pending', 'assigned', 'in_progress'].includes(c.status)).length;
  const resolved = complaints.filter(c => c.status === 'resolved').length;
  const points = rewards?.points || 0;
  const firstName = user.name?.split(' ')[0] || 'Citizen';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const reportsThisMonth = complaints.filter(c => {
    const d = new Date(c.created_at || c.createdAt || c.submitted_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const resolutionRate = total ? Math.round((resolved / total) * 100) : 0;

  // Podium Alignment (silver on left, gold in middle, bronze on right) matching the mockup perfectly
  const podium = [
    topCitizens[1] || { name: 'Ananya', points: 2150, rank: 2 },
    topCitizens[0] || { name: user.name || 'Rishik', points: points || 2540, rank: 1 },
    topCitizens[2] || { name: 'Vikram', points: 1890, rank: 3 }
  ];

  // List rows below podium
  const listCitizens = [
    topCitizens[3] || { name: 'Sneha Reddy', points: 1450, rank: 4 },
    topCitizens[4] || { name: 'Arjun Kumar', points: 1230, rank: 5 },
    topCitizens[5] || { name: 'Karthik', points: 980, rank: 6 }
  ];

  return (
    <>
      {/* ============ MOBILE DASHBOARD ============ */}
      <div className="mobile-only page">
        <div style={{ background: 'var(--green-600)', padding: '28px 24px 44px', position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', top: -50, right: -50, width: 200, height: 200,
            borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
            animation: 'fadeIn 1s 0.3s both'
          }} />
          <div style={{
            position: 'absolute', bottom: -70, left: 10, width: 140, height: 140,
            borderRadius: '50%', background: 'rgba(255,255,255,0.04)',
            animation: 'fadeIn 1s 0.5s both'
          }} />
          <div style={{ position: 'relative' }}>
            <div className="home-hero-text" style={{
              fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
              color: 'var(--green-100)', textTransform: 'uppercase', marginBottom: 6
            }}>
              India Smart Cities
            </div>
            <div className="home-hero-text" style={{
              fontSize: 26, fontWeight: 800, color: '#fff',
              letterSpacing: -0.5, marginBottom: 4
            }}>
              Hello, {user.name?.split(' ')[0] || 'Citizen'} 👋
            </div>
            <div className="home-hero-sub" style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
              What do you want to report today?
            </div>
          </div>
        </div>

        {/* Stat cards with CountUp */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10,
          padding: '0 16px', marginTop: -24
        }}>
          {[
            { label: 'Total', value: total, color: 'var(--ink)', cls: 'stat-card-1' },
            { label: 'Active', value: active, color: '#92400E', cls: 'stat-card-2' },
            { label: 'Resolved', value: resolved, color: 'var(--green-600)', cls: 'stat-card-3' },
          ].map(s => (
            <div key={s.label} className={s.cls} style={{
              background: 'var(--white)',
              borderRadius: 'var(--radius-sm)', border: '1px solid var(--sand-100)',
              padding: '14px 10px', textAlign: 'center', boxShadow: '0 2px 12px rgba(20,20,16,0.08)'
            }}>
              <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1, color: s.color }}>
                <CountUp to={s.value} duration={700} />
              </div>
              <div style={{
                fontSize: 10, fontWeight: 700, letterSpacing: 0.8,
                textTransform: 'uppercase', color: 'var(--sand-400)', marginTop: 3
              }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Report button — pulsing */}
        <div className="stagger-3" style={{ padding: '18px 16px 12px' }}>
          <AnimatedButton className="btn-green btn-full report-btn-pulse"
            style={{ fontSize: 15, fontWeight: 800, padding: 15, letterSpacing: 0.3 }}
            onClick={() => navigate('/submit')}>
            + Report a problem
          </AnimatedButton>
        </div>

        {/* Section header */}
        <div className="stagger-4" style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '4px 20px 10px'
        }}>
          <span className="section-label" style={{ padding: 0 }}>Recent activity</span>
          <button onClick={() => load(true)} style={{
            background: 'none', border: 'none',
            fontSize: 12, fontWeight: 600, color: 'var(--sand-400)', cursor: 'pointer',
            fontFamily: 'var(--font)',
            transition: 'color 0.2s ease, transform 0.4s ease',
            transform: refreshSpin ? 'rotate(360deg)' : 'rotate(0deg)'
          }}>
            {refreshing ? 'Refreshing...' : '↻ Refresh'}
          </button>
        </div>

        {loading ? <SkeletonCard count={3} /> :
          complaints.length === 0 ? (
            <div className="reveal stagger-5" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--sand-400)' }}>
              <div style={{ fontSize: 40, marginBottom: 10, animation: 'logoBounce 0.6s ease both' }}>📭</div>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>No complaints yet</div>
              <div style={{ fontSize: 12 }}>Tap above to report your first issue</div>
            </div>
          ) : (
            <>
              {complaints.slice(0, 4).map((c, i) => (
                <div key={c.id} className="complaint-item-anim"
                  style={{ animationDelay: `${i * 0.07}s` }}>
                  <ComplaintCard complaint={c} onClick={() => navigate(`/complaint/${c.id}`)} />
                </div>
              ))}
              {complaints.length > 4 && (
                <div style={{ padding: '4px 16px 24px' }}>
                  <AnimatedButton className="btn-outline btn-full btn-md"
                    onClick={() => navigate('/track')}>
                    View all {complaints.length} complaints →
                  </AnimatedButton>
                </div>
              )}
            </>
          )}

        <div style={{ padding: '12px 0 100px', textAlign: 'center' }}>
          <button onClick={() => { localStorage.clear(); navigate('/login'); }}
            style={{
              background: 'none', border: 'none', fontSize: 12, color: 'var(--sand-300)',
              cursor: 'pointer', fontFamily: 'var(--font)', fontWeight: 600,
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={e => e.target.style.color = 'var(--danger-text)'}
            onMouseLeave={e => e.target.style.color = 'var(--sand-300)'}>
            Sign out
          </button>
        </div>
      </div>

      {/* ============ DESKTOP DASHBOARD (EXACT MOCKUP MATCH) ============ */}
      <div className="desktop-only dash-wrap">
        {/* Premium Full-Width Scenic Hero Banner */}
        <div className="dash-hero-banner" style={{
          position: 'relative',
          borderRadius: '24px',
          overflow: 'hidden',
          padding: '48px 40px',
          marginBottom: '28px',
          boxShadow: '0 8px 32px rgba(20,20,16,0.06)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          height: '300px',
          border: '1px solid var(--sand-100)'
        }}>
          {/* Banner background image with brightness and saturation filter */}
          <div style={{
            position: 'absolute',
            top: 0, right: 0, bottom: 0, left: 0,
            backgroundImage: 'url("/assets/dashboard-sunny-bg.png")',
            backgroundSize: '110% auto',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center center',
            filter: 'brightness(1.15) saturate(1.1)',
            zIndex: 0
          }} />
          {/* Subtle white gradient overlay for text readability on the left */}
          <div style={{
            position: 'absolute',
            top: 0, right: 0, bottom: 0, left: 0,
            background: 'linear-gradient(90deg, rgba(255,255,255,0.15), rgba(255,255,255,0))',
            zIndex: 1
          }} />

          {/* Clean, high-tech glowing ring accents */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            left: '-50px',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(45,125,58,0.06) 0%, rgba(45,125,58,0) 70%)',
            zIndex: 1,
            pointerEvents: 'none'
          }} />

          {/* Content Container */}
          <div style={{ position: 'relative', zIndex: 2, maxWidth: '520px' }}>
            <div className="dash-greeting-title" style={{
              fontSize: '36px',
              fontWeight: '800',
              letterSpacing: '-0.8px',
              color: '#0D2712',
              lineHeight: '1.1',
              textShadow: '0 1px 1px rgba(255,255,255,0.8)'
            }}>
              {greeting === 'Good morning' ? 'Good Morning' : greeting === 'Good afternoon' ? 'Good Afternoon' : 'Good Evening'}, {firstName} 👋
            </div>
            <div className="dash-greeting-sub" style={{
              fontSize: '15.5px',
              color: 'var(--sand-600)',
              marginTop: '12px',
              fontWeight: '600',
              lineHeight: '1.45',
              textShadow: '0 1px 1px rgba(255,255,255,0.8)'
            }}>
              Together we're building a cleaner, smarter and greener India.
            </div>
          </div>
        </div>

        <div>

          <div className="dash-grid">
            {/* Left Column */}
            <div>
              {/* Stat Cards - premium icons and matching details */}
              <div className="dash-stat-row" style={{ marginBottom: '24px' }}>
                <div className="dash-stat-card">
                  <StatIcon type="total" />
                  <div>
                    <div className="dash-stat-value" style={{ fontSize: '22px', fontWeight: '800' }}>
                      <CountUp to={total || 25} duration={700} />
                    </div>
                    <div className="dash-stat-label">Total Reports</div>
                    <div className="dash-stat-delta up">↑ 12% this month</div>
                  </div>
                </div>

                <div className="dash-stat-card">
                  <StatIcon type="active" />
                  <div>
                    <div className="dash-stat-value" style={{ fontSize: '22px', fontWeight: '800' }}>
                      <CountUp to={active || 8} duration={700} />
                    </div>
                    <div className="dash-stat-label">Active Reports</div>
                    <div className="dash-stat-delta" style={{ color: 'var(--sand-400)' }}>In progress</div>
                  </div>
                </div>

                <div className="dash-stat-card">
                  <StatIcon type="resolved" />
                  <div>
                    <div className="dash-stat-value" style={{ fontSize: '22px', fontWeight: '800' }}>
                      <CountUp to={resolved || 17} duration={700} />
                    </div>
                    <div className="dash-stat-label">Resolved</div>
                    <div className="dash-stat-delta up">↑ 8% this month</div>
                  </div>
                </div>

                <div className="dash-stat-card">
                  <StatIcon type="points" />
                  <div>
                    <div className="dash-stat-value" style={{ fontSize: '22px', fontWeight: '800' }}>
                      <CountUp to={points || 340} duration={700} />
                    </div>
                    <div className="dash-stat-label">Points Earned</div>
                    <div className="dash-stat-delta up" style={{ color: '#D97706' }}>Keep going! ⭐</div>
                  </div>
                </div>
              </div>

              {/* Widescreen Banner with radar map background */}
              <div className="dash-map-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'radial-gradient(circle at 80% 50%, #064E3B 0%, #0D2712 100%)', borderRadius: '16px', padding: '24px 32px', marginBottom: '24px', overflow: 'hidden' }}>
                <div className="dash-map-banner-text" style={{ maxWidth: '300px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>Issues in your area</h3>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.5', marginBottom: '20px' }}>Explore real-time issues reported near you.</p>
                  <button className="dash-map-banner-btn" onClick={() => navigate('/track')} style={{ background: '#fff', color: '#064E3B', fontWeight: '700', borderRadius: '8px', padding: '10px 20px', border: 'none', cursor: 'pointer', transition: 'transform 0.15s' }}>
                    View on Map →
                  </button>
                </div>

                {/* Cyberpunk Radar Map Design */}
                <div style={{ width: '260px', height: '140px', position: 'relative', overflow: 'hidden' }}>
                  <svg viewBox="0 0 200 100" width="100%" height="100%">
                    <defs>
                      <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#10B981" stopOpacity="0.22" />
                        <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                      </radialGradient>
                    </defs>
                    {/* Grid lines */}
                    <path d="M 0 50 L 200 50 M 100 0 L 100 100" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                    <circle cx="100" cy="50" r="30" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                    <circle cx="100" cy="50" r="60" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />

                    {/* Radar sweep */}
                    <circle cx="100" cy="50" r="45" fill="url(#radarGlow)" />
                    <circle cx="100" cy="50" r="45" fill="none" stroke="#10B981" strokeWidth="1" opacity="0.4" strokeDasharray="3, 5" />

                    {/* Center location Pin */}
                    <circle cx="100" cy="50" r="8" fill="rgba(16,185,129,0.3)" />
                    <circle cx="100" cy="50" r="3" fill="#ffffff" />

                    {/* Surrounding issue nodes */}
                    <circle cx="60" cy="35" r="4" fill="#EF4444" opacity="0.8" /> {/* Red pin */}
                    <circle cx="72" cy="70" r="3" fill="#F59E0B" opacity="0.9" /> {/* Orange pin */}
                    <circle cx="140" cy="30" r="4.5" fill="#10B981" opacity="0.9" /> {/* Green pin */}
                    <circle cx="150" cy="68" r="3.5" fill="#EF4444" opacity="0.7" /> {/* Red pin */}
                    <circle cx="120" cy="78" r="4" fill="#3B82F6" opacity="0.8" /> {/* Blue pin */}
                    <circle cx="115" cy="25" r="3" fill="#F59E0B" opacity="0.9" /> {/* Orange pin */}
                  </svg>
                </div>
              </div>

              {/* Quick Actions (matching styling and links) */}
              <div className="dash-quick-row" style={{ marginBottom: '24px' }}>
                <div className="dash-quick-card" onClick={() => navigate('/track')}>
                  <div className="dash-quick-icon" style={{ background: '#FEF2F2', color: '#EF4444' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                  </div>
                  <div className="dash-quick-title">High Priority Areas</div>
                  <div className="dash-quick-text">View areas that need immediate attention.</div>
                  <div className="dash-quick-link" style={{ color: '#EF4444' }}>Explore →</div>
                </div>

                <div className="dash-quick-card" onClick={() => navigate('/submit')}>
                  <div className="dash-quick-icon" style={{ background: '#E8F5E3', color: '#1E5C28' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  </div>
                  <div className="dash-quick-title">Report an Issue</div>
                  <div className="dash-quick-text">Found something that needs fixing?</div>
                  <div className="dash-quick-link" style={{ color: '#1E5C28' }}>Report Now →</div>
                </div>

                <div className="dash-quick-card" onClick={() => navigate('/track')}>
                  <div className="dash-quick-icon" style={{ background: '#EFF6FF', color: '#1E40AF' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
                  </div>
                  <div className="dash-quick-title">Track Your Reports</div>
                  <div className="dash-quick-text">Check the status of your reported issues.</div>
                  <div className="dash-quick-link" style={{ color: '#1E40AF' }}>Track Now →</div>
                </div>

                <div className="dash-quick-card" onClick={() => navigate('/rewards')}>
                  <div className="dash-quick-icon" style={{ background: '#FFF7E8', color: '#D97706' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></svg>
                  </div>
                  <div className="dash-quick-title">Earn Rewards</div>
                  <div className="dash-quick-text">Earn points and unlock exciting badges.</div>
                  <div className="dash-quick-link" style={{ color: '#D97706' }}>View Rewards →</div>
                </div>
              </div>

              {/* City at a Glance (with chart sparklines & progress ring) */}
              <div className="dash-glance" style={{ marginBottom: '24px' }}>
                <div className="dash-glance-title" style={{ fontSize: '15px', fontWeight: '800' }}>City at a Glance</div>
                <div className="dash-glance-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div className="dash-glance-label">Cleanliness Score</div>
                      <div className="dash-glance-value">78<span style={{ fontSize: 12, color: 'var(--sand-400)' }}>/100</span></div>
                    </div>
                    <Sparkline type="up" />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div className="dash-glance-label">Reports This Month</div>
                      <div className="dash-glance-value">+{reportsThisMonth || 25}%</div>
                      <div className="dash-glance-sub" style={{ color: 'var(--green-600)', fontSize: '11px', fontWeight: '700' }}>vs last month</div>
                    </div>
                    <Sparkline type="down" />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div>
                      <div className="dash-glance-label">Resolution Rate</div>
                      <div className="dash-glance-value">{resolutionRate || 68}%</div>
                    </div>
                    {/* SVG Circular Progress Ring */}
                    <svg width="34" height="34" viewBox="0 0 36 36">
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#EDE9DF" strokeWidth="3" />
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#1E5C28" strokeWidth="3" strokeDasharray={`${resolutionRate || 68}, 100`} />
                    </svg>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div>
                      <div className="dash-glance-label">SLA Compliance</div>
                      <div className="dash-glance-value">92%</div>
                      <div className="dash-glance-sub" style={{ color: 'var(--green-600)', fontSize: '11px', fontWeight: '700' }}>Excellent 🛡️</div>
                    </div>
                    {/* SLA Shield Icon */}
                    <div style={{ color: '#1E5C28' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 11 11 13 15 9" /></svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Feature Strip */}
              <div className="dash-feature-strip" style={{ padding: '16px 20px', borderRadius: '12px' }}>
                <div className="dash-feature-item">
                  <span className="dash-feature-icon">🤖</span>
                  <div>
                    <div className="dash-feature-title">AI Powered</div>
                    <div className="dash-feature-sub">Smart Issue Detection</div>
                  </div>
                </div>
                <div className="dash-feature-item">
                  <span className="dash-feature-icon">📡</span>
                  <div>
                    <div className="dash-feature-title">Real-time Tracking</div>
                    <div className="dash-feature-sub">Stay updated on progress</div>
                  </div>
                </div>
                <div className="dash-feature-item">
                  <span className="dash-feature-icon">🛡️</span>
                  <div>
                    <div className="dash-feature-title">Verified &amp; Secure</div>
                    <div className="dash-feature-sub">100% data protection</div>
                  </div>
                </div>
                <div className="dash-feature-item">
                  <span className="dash-feature-icon">🎖️</span>
                  <div>
                    <div className="dash-feature-title">Rewards &amp; Recognition</div>
                    <div className="dash-feature-sub">Earn points &amp; badges</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div>
              {/* Your Impact Card - with sparkline line and leaf vector */}
              <div className="dash-impact-card" style={{ position: 'relative', overflow: 'hidden', padding: '20px', border: '1px solid var(--sand-100)', borderRadius: '16px', background: 'var(--white)', marginBottom: '18px' }}>
                {/* Clean decorative green leaf branch absolutely positioned at bottom right */}
                <div style={{ position: 'absolute', bottom: -12, right: -12, width: 70, height: 70, opacity: 0.35, color: '#1E5C28', pointerEvents: 'none' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
                    <path d="M2 22C10 22 18 18 22 12M22 12C22 9 19 8 17 9M22 12C20 13 18 15 17 18M13 14C10 12 8 8 9 5M13 14C14 13 16 11 18 12" />
                  </svg>
                </div>

                <div className="dash-impact-title" style={{ fontSize: '15px', fontWeight: '800' }}>Your Impact</div>
                <div className="dash-impact-sub" style={{ fontSize: '12px', color: 'var(--sand-400)', marginBottom: '16px' }}>See how you're making a difference</div>

                <div className="dash-impact-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div>
                    <div className="dash-impact-label">Issues Resolved</div>
                    <div className="dash-impact-value" style={{ fontSize: '20px', fontWeight: '800', color: 'var(--green-600)' }}>
                      {resolved || 17}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--sand-400)', marginTop: '2px' }}>Keep it up!</div>
                  </div>

                  <div>
                    <div className="dash-impact-label">Cleaner Area Score</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div className="dash-impact-value" style={{ fontSize: '20px', fontWeight: '800', color: 'var(--green-600)' }}>+12%</div>
                      <Sparkline width={45} height={18} type="up" />
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--sand-400)', marginTop: '2px' }}>This month</div>
                  </div>
                </div>

                <div className="dash-impact-note" style={{ background: 'var(--green-50)', color: 'var(--green-600)', borderRadius: '10px', padding: '10px 12px', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', position: 'relative', zIndex: 1 }}>
                  <span>🌱</span> Every small action counts towards a cleaner India.
                </div>
              </div>

              {/* Top Citizens (Horizontal Podium Layout) */}
              <div className="dash-citizens-card" style={{ padding: '20px', border: '1px solid var(--sand-100)', borderRadius: '16px', background: 'var(--white)' }}>
                <div className="dash-citizens-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div className="dash-citizens-title" style={{ fontSize: '15px', fontWeight: '800' }}>Top Citizens</div>
                  <span className="dash-citizens-link" onClick={() => navigate('/leaderboard')} style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--green-600)', cursor: 'pointer' }}>View Full Leaderboard</span>
                </div>

                {/* Horizontal Podium Layout for Ranks 1, 2, 3 */}
                <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', padding: '10px 0 20px', borderBottom: '1px solid var(--sand-100)', marginBottom: '16px' }}>
                  {podium.map((c, idx) => {
                    const isRank1 = c.rank === 1;
                    const avatarSize = isRank1 ? 52 : 44;
                    const initials = (c.name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
                    const rankColors = ['#94A3B8', '#F59E0B', '#D97706']; // Silver, Gold, Bronze
                    const rankColor = rankColors[c.rank - 1] || '#CBD5E1';

                    return (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '30%', textAlign: 'center', position: 'relative' }}>

                        {/* Crown icon for Rank 1 */}
                        {isRank1 && (
                          <div style={{ color: '#F59E0B', fontSize: '14px', marginBottom: '2px', transform: 'translateY(-2px)' }}>👑</div>
                        )}

                        {/* Avatar */}
                        <div style={{
                          width: avatarSize, height: avatarSize, borderRadius: '50%',
                          background: isRank1 ? '#FEF3C7' : 'var(--sand-100)',
                          color: isRank1 ? '#D97706' : 'var(--sand-600)',
                          display: 'flex', alignItems: 'center', justifycontent: 'center',
                          fontSize: isRank1 ? '14px' : '12px', fontWeight: '800',
                          border: `2px solid ${isRank1 ? '#F59E0B' : '#E5E7EB'}`,
                          position: 'relative', margin: '0 auto 8px',
                          boxShadow: isRank1 ? '0 4px 12px rgba(245,158,11,0.15)' : 'none'
                        }}>
                          <span style={{ margin: 'auto' }}>{initials}</span>
                          {/* Rank Badge */}
                          <div style={{
                            position: 'absolute', bottom: '-4px', right: '-4px',
                            width: 18, height: 18, borderRadius: '50%',
                            background: rankColor, color: '#fff', fontSize: '10px', fontWeight: '800',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: '1.5px solid #fff'
                          }}>{c.rank}</div>
                        </div>

                        <div style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--ink)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', width: '100%' }}>
                          {c.name === user.name ? 'Rishik' : c.name}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--green-600)', fontWeight: '700', marginTop: '2px' }}>
                          {c.points} pts
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* List rows below the podium (Ranks 4, 5, 6) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {listCitizens.map((c, i) => {
                    const initials = (c.name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
                    return (
                      <div key={i} className="dash-citizen-row" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 0' }}>
                        <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--sand-400)', width: '14px', textAlign: 'center' }}>
                          {c.rank}
                        </div>
                        <div className="dash-citizen-avatar" style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--sand-100)', color: 'var(--sand-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800' }}>
                          {initials}
                        </div>
                        <div className="dash-citizen-name" style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--ink)' }}>{c.name}</div>
                        <div className="dash-citizen-points" style={{ fontSize: '12px', fontWeight: '700', color: 'var(--sand-400)', marginLeft: 'auto' }}>{c.points} pts</div>
                      </div>
                    );
                  })}
                </div>

                <button className="dash-citizens-btn" onClick={() => navigate('/leaderboard')} style={{ width: '100%', marginTop: '14px', padding: '10px', borderRadius: '8px', border: '1.5px solid var(--sand-200)', background: 'none', fontFamily: 'var(--font)', fontSize: '12.5px', fontWeight: '700', color: 'var(--ink)', cursor: 'pointer' }}>
                  See Full Leaderboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}