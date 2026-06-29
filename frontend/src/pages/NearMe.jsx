import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InteractiveIndiaMap from '../components/InteractiveIndiaMap';

// High-fidelity category icons for the preview panel
const CATEGORY_ICONS = {
  garbage_dump: (
    <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="garbageGradPanel" x1="4" y1="4" x2="20" y2="20">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#5B21B6" />
        </linearGradient>
      </defs>
      <path d="M6 9h12l-1.5 11h-9L6 9z" fill="url(#garbageGradPanel)" opacity="0.9" />
      <path d="M4 7h16v2H4V7z" fill="#7C3AED" />
      <path d="M10 4h4v3h-4V4z" fill="#6D28D9" rx="1" />
    </svg>
  ),
  missed_pickup: (
    <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="truckGradPanel" x1="2" y1="2" x2="22" y2="22">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>
      <rect x="2" y="6" width="13" height="10" rx="1.5" fill="url(#truckGradPanel)" />
      <path d="M15 8h4.5l2.5 3.5V16h-7V8z" fill="#1D4ED8" />
      <circle cx="6.5" cy="17.5" r="3" fill="#1E293B" />
      <circle cx="16.5" cy="17.5" r="3" fill="#1E293B" />
    </svg>
  ),
  overflowing_bin: (
    <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="overflowGradPanel" x1="4" y1="4" x2="20" y2="20">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
      </defs>
      <path d="M5 9h14l-1.5 11.5h-11L5 9z" fill="url(#overflowGradPanel)" />
      <path d="M12 12l2 3h-4l2-3z" fill="#FFFFFF" opacity="0.9" />
    </svg>
  ),
  pothole: (
    <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="coneGradPanel" x1="12" y1="4" x2="20" y2="24">
          <stop offset="0%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#C2410C" />
        </linearGradient>
      </defs>
      <path d="M12.5 6l4.5 15H9l4.5-15z" fill="url(#coneGradPanel)" />
      <ellipse cx="12.5" cy="21" rx="5.5" ry="1.5" fill="#9A3412" />
    </svg>
  ),
  street_light: (
    <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lightGradPanel" x1="4" y1="4" x2="20" y2="20">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>
      <path d="M5 21h4v-2H7v-9.5C7 7.5 9.5 5 12.5 5h2C16 5 18 7 18 9.5V11h-2V9.5C16 8 15 7 13.5 7h-2C10 7 9 8 9 9.5V19H5v2z" fill="#64748B" />
      <rect x="15" y="8.5" width="8" height="4" rx="2" fill="#1E293B" />
    </svg>
  ),
  water_leak: (
    <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="waterGradPanel" x1="4" y1="4" x2="20" y2="20">
          <stop offset="0%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#0891B2" />
        </linearGradient>
      </defs>
      <rect x="2" y="8" width="22" height="6" rx="1.5" fill="#64748B" />
      <path d="M12 11c0 0-2 2.5-2 4s1 2.5 2 2.5 2-1 2-2.5-2-4-2-4z" fill="url(#waterGradPanel)" />
    </svg>
  ),
  construction_waste: (
    <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="brickGradPanel" x1="4" y1="12" x2="16" y2="28">
          <stop offset="0%" stopColor="#EA580C" />
          <stop offset="100%" stopColor="#9A3412" />
        </linearGradient>
      </defs>
      <rect x="4" y="20" width="10" height="5" rx="1" fill="url(#brickGradPanel)" />
      <rect x="12" y="15" width="10" height="5" rx="1" fill="#brickGradPanel" transform="rotate(-15 12 15)" />
    </svg>
  ),
  other: (
    <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="boardGradPanel" x1="4" y1="4" x2="28" y2="28">
          <stop offset="0%" stopColor="#78350F" />
          <stop offset="100%" stopColor="#451A03" />
        </linearGradient>
      </defs>
      <rect x="5" y="4" width="22" height="25" rx="3" fill="url(#boardGradPanel)" />
      <rect x="6" y="5" width="20" height="23" rx="2" fill="#9A3412" opacity="0.3" />
    </svg>
  )
};

// Single source of truth for active reports per state
const STATE_STATS = {
  'IN-TG': {
    name: 'Telangana',
    reports: 8,
    health: 68,
    status: 'Active Monitoring',
    color: '#F59E0B',
    topIssue: 'garbage_dump',
    recent: [
      { id: 32, category: 'garbage_dump', title: 'Garbage Dump near Hanamkonda', address: 'Teachers Colony, Hanamkonda', time: 'Today' },
      { id: 24, category: 'missed_pickup', title: 'Missed Pickup', address: 'Prashanth Nagar Colony', time: '2 days ago' },
      { id: 23, category: 'construction_waste', title: 'Construction Waste Pile', address: 'Teachers Colony, Hanamkonda', time: '3 days ago' }
    ]
  },
  'IN-KL': {
    name: 'Kerala',
    reports: 9,
    health: 65,
    status: 'Active Monitoring',
    color: '#F59E0B',
    topIssue: 'garbage_dump',
    recent: [
      { id: 30, category: 'garbage_dump', title: 'Garbage Dump in Market', address: 'Center of Thrissur', time: 'Today' },
      { id: 29, category: 'garbage_dump', title: 'Garbage Dump on Roadside', address: 'Near Railway Station', time: 'Yesterday' },
      { id: 28, category: 'water_leak', title: 'Water Leak near Bus Stand', address: 'Palayam, Thiruvananthapuram', time: '2 days ago' }
    ]
  },
  'IN-MH': {
    name: 'Maharashtra',
    reports: 5,
    health: 82,
    status: 'Healthy',
    color: '#10B981',
    topIssue: 'pothole',
    recent: [
      { id: 18, category: 'pothole', title: 'Major Pothole on Highway', address: 'Dharavi, Mumbai', time: 'Yesterday' },
      { id: 15, category: 'water_leak', title: 'Water Pipe Leakage', address: 'Andheri West, Mumbai', time: '4 days ago' }
    ]
  },
  'IN-KA': {
    name: 'Karnataka',
    reports: 4,
    health: 85,
    status: 'Healthy',
    color: '#10B981',
    topIssue: 'street_light',
    recent: [
      { id: 14, category: 'street_light', title: 'Street Light Out', address: 'Indiranagar, Bengaluru', time: 'Yesterday' },
      { id: 11, category: 'overflowing_bin', title: 'Overflowing Waste Bin', address: 'Koramangala, Bengaluru', time: '3 days ago' }
    ]
  },
  'IN-DL': {
    name: 'Delhi',
    reports: 6,
    health: 60,
    status: 'Active Monitoring',
    color: '#EF4444',
    topIssue: 'pothole',
    recent: [
      { id: 12, category: 'pothole', title: 'Pothole near Metro Station', address: 'Connaught Place, New Delhi', time: 'Today' },
      { id: 9, category: 'street_light', title: 'Dark Alleyway Light Out', address: 'Karol Bagh, New Delhi', time: 'Yesterday' }
    ]
  },
  'IN-AP': {
    name: 'Andhra Pradesh',
    reports: 3,
    health: 78,
    status: 'Satisfactory',
    color: '#34D399',
    topIssue: 'water_leak',
    recent: [
      { id: 41, category: 'water_leak', title: 'Water Valve Leakage', address: 'Benz Circle, Vijayawada', time: 'Today' }
    ]
  },
  'IN-TN': {
    name: 'Tamil Nadu',
    reports: 2,
    health: 88,
    status: 'Healthy',
    color: '#34D399',
    topIssue: 'missed_pickup',
    recent: [
      { id: 51, category: 'missed_pickup', title: 'Missed Garbage Collection', address: 'T. Nagar, Chennai', time: 'Yesterday' }
    ]
  },
  'IN-UP': {
    name: 'Uttar Pradesh',
    reports: 1,
    health: 92,
    status: 'Healthy',
    color: '#6EE7B7',
    topIssue: 'garbage_dump',
    recent: [
      { id: 61, category: 'garbage_dump', title: 'Garbage Dump near Park', address: 'Gomti Nagar, Lucknow', time: '3 days ago' }
    ]
  },
  'IN-GJ': {
    name: 'Gujarat',
    reports: 2,
    health: 89,
    status: 'Healthy',
    color: '#34D399',
    topIssue: 'street_light',
    recent: [
      { id: 71, category: 'street_light', title: 'Flickering Lamp Post', address: 'Satellite Area, Ahmedabad', time: '2 days ago' }
    ]
  }
};

// Map of state names to their ISO codes
const STATE_NAME_TO_ID = {
  'telangana': 'IN-TG',
  'kerala': 'IN-KL',
  'maharashtra': 'IN-MH',
  'karnataka': 'IN-KA',
  'delhi': 'IN-DL',
  'andhra pradesh': 'IN-AP',
  'tamil nadu': 'IN-TN',
  'uttar pradesh': 'IN-UP',
  'gujarat': 'IN-GJ',
  'west bengal': 'IN-WB',
  'haryana': 'IN-HR',
  'punjab': 'IN-PB',
  'rajasthan': 'IN-RJ',
  'madhya pradesh': 'IN-MP'
};

const getStateData = (stateId, stateName) => {
  if (!stateId && stateName) {
    stateId = STATE_NAME_TO_ID[stateName.toLowerCase()] || '';
  }
  
  const displayName = stateName || 'Selected State';
  
  if (stateId && STATE_STATS[stateId]) {
    return STATE_STATS[stateId];
  }
  
  // Return a clean 0-report state if no active reports exist in this region
  return {
    name: displayName,
    reports: 0,
    health: 100,
    status: 'Healthy',
    color: '#10B981',
    topIssue: 'none',
    recent: []
  };
};

export default function NearMe() {
  const navigate = useNavigate();
  const [hoveredState, setHoveredState] = useState(null);
  const [userHomeState, setUserHomeState] = useState(null);

  useEffect(() => {
    // Get user's home state from localStorage to show personalized data by default
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.state) {
        setUserHomeState({
          name: user.state,
          id: STATE_NAME_TO_ID[user.state.toLowerCase()] || ''
        });
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Calculate national stats when location is unknown and no state is hovered
  const getNationalData = () => {
    const activeStates = Object.keys(STATE_STATS);
    let totalReports = 0;
    let sumHealth = 0;
    const recent = [];

    activeStates.forEach((stateId, idx) => {
      const data = STATE_STATS[stateId];
      totalReports += data.reports;
      sumHealth += data.health;
      
      // Grab one recent report from each of the first 3 states to show a mixed national list
      if (idx < 3 && data.recent && data.recent[0]) {
        recent.push({
          ...data.recent[0],
          title: `${data.recent[0].title} (${data.name})`
        });
      }
    });

    const avgHealth = Math.round(sumHealth / activeStates.length);

    return {
      name: 'India (National)',
      reports: totalReports,
      health: avgHealth,
      status: 'Satisfactory',
      color: '#F59E0B',
      topIssue: 'garbage_dump',
      recent
    };
  };

  // Determine which state details to display
  const activeStateInfo = hoveredState 
    ? getStateData(hoveredState.id, hoveredState.title)
    : userHomeState 
      ? getStateData(userHomeState.id, userHomeState.name)
      : getNationalData(); // Show National Overview by default if location is unknown!

  return (
    <div className="page" style={{ background: 'var(--sand-50)', minHeight: '100vh', padding: 0 }}>
      {/* Topbar */}
      <div className="topbar" style={{
        background: 'var(--white)', borderBottom: '1px solid var(--sand-100)', padding: '16px 24px',
        display: 'flex', alignItems: 'center', gap: '14px'
      }}>
        <button className="back-btn" onClick={() => navigate(-1)}
          style={{ 
            transition: 'transform 0.2s ease', background: 'var(--sand-100)', border: 'none',
            width: '36px', height: '36px', borderRadius: '50%', display: 'flex',
            alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateX(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}>
          ←
        </button>
        <div className="topbar-title" style={{ fontSize: '20px', fontWeight: '900', color: 'var(--ink)', letterSpacing: '-0.4px' }}>
          Near Me
        </div>
      </div>

      {/* Two-Column Dashboard Grid */}
      <div className="near-me-grid" style={{
        padding: '24px',
        maxWidth: '1280px',
        margin: '0 auto',
        boxSizing: 'border-box'
      }}>
        {/* Left Column: Interactive Map */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <InteractiveIndiaMap stateStats={STATE_STATS} onHoverState={setHoveredState} />
        </div>

        {/* Right Column: State Details Panel */}
        <div style={{ 
          background: 'var(--white)', 
          border: '1.5px solid var(--sand-100)', 
          borderRadius: '16px', 
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-sm)',
          height: 'fit-content'
        }}>
          {/* Panel Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1.5px solid var(--sand-100)', paddingBottom: '16px', marginBottom: '20px' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--sand-400)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                {hoveredState ? 'Live Hover Inspection' : 'Your Region Overview'}
              </span>
              <h3 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--ink)', margin: '4px 0 0', letterSpacing: '-0.4px', fontFamily: 'var(--font-display)' }}>
                {activeStateInfo.name}
              </h3>
            </div>
            {hoveredState && (
              <span style={{
                background: 'var(--green-50)', color: 'var(--green-600)', fontSize: '11px', fontWeight: '700',
                padding: '4px 10px', borderRadius: '12px', marginLeft: 'auto'
              }}>
                Hovered
              </span>
            )}
          </div>

          {/* Stats Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            {/* Active Reports Stat */}
            <div style={{ background: 'var(--sand-50)', padding: '16px', borderRadius: '12px', border: '1px solid var(--sand-100)' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--sand-600)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                Active Issues
              </div>
              <div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--ink)', marginTop: '6px', fontFamily: 'var(--font-display)' }}>
                {activeStateInfo.reports}
              </div>
            </div>

            {/* Health Index Stat */}
            <div style={{ background: 'var(--sand-50)', padding: '16px', borderRadius: '12px', border: '1px solid var(--sand-100)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--sand-600)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  Health Index
                </span>
                <span style={{ fontSize: '11px', fontWeight: '700', color: activeStateInfo.color }}>
                  {activeStateInfo.status}
                </span>
              </div>
              <div style={{ fontSize: '28px', fontWeight: '900', color: activeStateInfo.color, marginTop: '6px', fontFamily: 'var(--font-display)' }}>
                {activeStateInfo.health}%
              </div>
            </div>
          </div>

          {/* Top Issue Type Banner */}
          <div style={{
            background: activeStateInfo.reports > 0 ? 'var(--green-50)' : 'var(--sand-50)', 
            border: activeStateInfo.reports > 0 ? '1.5px solid var(--green-100)' : '1.5px solid var(--sand-100)', 
            borderRadius: '12px',
            padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px'
          }}>
            <div style={{ fontSize: '18px' }}>{activeStateInfo.reports > 0 ? '🔥' : '✨'}</div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '800', color: activeStateInfo.reports > 0 ? 'var(--green-600)' : 'var(--sand-500)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                Top Issue Category
              </div>
              <div style={{ fontSize: '13.5px', fontWeight: '700', color: activeStateInfo.reports > 0 ? 'var(--green-600)' : 'var(--sand-700)', marginTop: '2px', textTransform: 'capitalize' }}>
                {activeStateInfo.topIssue.replace(/_/g, ' ')}
              </div>
            </div>
          </div>

          {/* Recent Reports List Section */}
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--sand-600)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
              Recent Reports
            </h4>
            
            {activeStateInfo.recent.length === 0 ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '30px 20px',
                textAlign: 'center',
                background: 'var(--green-50)',
                border: '1.5px dashed var(--green-100)',
                borderRadius: '12px',
                marginTop: '10px'
              }}>
                <span style={{ fontSize: '32px', marginBottom: '8px' }}>✓</span>
                <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--green-600)' }}>No Active Reports</div>
                <div style={{ fontSize: '12px', color: 'var(--green-500)', marginTop: '4px' }}>This region is clean and healthy! Keep up the great work.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {activeStateInfo.recent.map(report => (
                  <div 
                    key={report.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      borderRadius: '10px',
                      border: '1.5px solid var(--sand-100)',
                      transition: 'all 0.2s ease',
                      background: 'var(--white)'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'var(--sand-200)';
                      e.currentTarget.style.transform = 'translateX(2px)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--sand-100)';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    {/* Category Icon */}
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: 'var(--sand-50)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {CATEGORY_ICONS[report.category] || CATEGORY_ICONS.other}
                    </div>

                    {/* Text Details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {report.title}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--sand-400)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {report.address}
                      </div>
                    </div>

                    {/* Relative Time */}
                    <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--sand-500)', flexShrink: 0 }}>
                      {report.time}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
