import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import HeatmapView from '../components/HeatmapView';
import CountUp from '../components/CountUp';
import StatusBadge from '../components/StatusBadge';
import indiaStatesDistricts from '../data/indiaStatesDistricts.json';
import api from '../api';

const PIE_COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#06b6d4', '#64748b'];

// Themed category icons
const CATEGORY_EMOJIS = {
  garbage_dump: '🗑️',
  overflowing_bin: '♻️',
  missed_pickup: '🚛',
  construction_waste: '🏗️',
  plastic_waste: '🛍️',
  e_waste: '💻',
  medical_waste: '☣️',
  hazardous_waste: '⚠️',
  other: '📋'
};

function StatCard({ label, value, sub, color = 'var(--ink)', accentColor, icon, iconClass, delay = '0s', hoverBg }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div 
      className="stagger-1 stat-card-hover" 
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered && hoverBg ? hoverBg : 'var(--white)',
        border: '1.5px solid var(--sand-100)',
        borderRadius: '16px',
        padding: '20px 24px',
        flex: '1 1 200px',
        minWidth: '180px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: hovered ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        transform: hovered ? 'translateY(-4px)' : 'none',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        animationDelay: delay
      }}
    >
      {/* Left accent bar */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '5px', background: accentColor || color }} />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--sand-400)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {label}
          </span>
          <h2 style={{ fontSize: '32px', fontWeight: '900', color: color, marginTop: '6px', letterSpacing: '-1px', fontFamily: 'var(--font-display)' }}>
            <CountUp to={parseInt(value) || 0} duration={800} />
            {typeof value === 'string' && value.includes('h') ? 'h' : ''}
          </h2>
        </div>
        <div className={`stat-icon ${iconClass}`} style={{ fontSize: '26px', display: 'inline-block', transition: 'transform 0.3s' }}>
          {icon}
        </div>
      </div>
      {sub && <div style={{ fontSize: '11px', color: 'var(--sand-400)', fontWeight: '700', marginTop: '6px' }}>{sub}</div>}
    </div>
  );
}

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [allComplaints, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('charts'); // charts | heatmap
  const [showAllWards, setShowAllWards] = useState(false);
  const [groupBy, setGroupBy] = useState('state'); // state | district
  const [selectedStateFilter, setSelectedStateFilter] = useState(null);
  const [mapCategory, setMapCategory] = useState('');
  const [mapPriority, setMapPriority] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/complaints?limit=500'),
    ]).then(([s, c]) => {
      setStats(s.data);
      setAll(c.data.complaints || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: 'var(--sand-400)', textAlign: 'center', padding: 40, fontWeight: 'bold' }}>Loading dashboard...</p>;
  if (!stats) return <p style={{ color: '#A32D2D', textAlign: 'center', padding: 40 }}>Failed to load stats.</p>;

  const catData = stats.perCategory.map(c => ({
    name: c.category.replace(/_/g, ' '),
    value: parseInt(c.count)
  }));

  // Handle grouping and filtering data with 0-value placeholders
  const ALL_STATES = Object.keys(indiaStatesDistricts);

  // 1. Merge States
  const stateStatsMap = {};
  (stats.perState || []).forEach(s => {
    stateStatsMap[s.state_name] = s;
  });

  const mergedStates = ALL_STATES.map(stateName => {
    const existing = stateStatsMap[stateName];
    return {
      state_name: stateName,
      total: existing ? parseInt(existing.total) : 0,
      resolved: existing ? parseInt(existing.resolved) : 0,
      pending: existing ? parseInt(existing.pending) : 0,
      in_progress: existing ? parseInt(existing.in_progress) : 0,
    };
  });

  const sortedStates = mergedStates.sort((a, b) => {
    if (b.total !== a.total) return b.total - a.total;
    return a.state_name.localeCompare(b.state_name);
  });

  // 2. Merge Wards/Districts
  let sortedWards = [];
  if (selectedStateFilter) {
    const districtsInState = indiaStatesDistricts[selectedStateFilter] || [];
    const wardStatsMap = {};
    (stats.perWard || []).forEach(w => {
      wardStatsMap[w.ward_name] = w;
    });

    const mergedWards = districtsInState.map(dName => {
      const existing = wardStatsMap[dName];
      return {
        ward_name: dName,
        total: existing ? parseInt(existing.total) : 0,
        resolved: existing ? parseInt(existing.resolved) : 0,
        pending: existing ? parseInt(existing.pending) : 0,
        in_progress: existing ? parseInt(existing.in_progress) : 0,
      };
    });

    sortedWards = mergedWards.sort((a, b) => {
      if (b.total !== a.total) return b.total - a.total;
      return a.ward_name.localeCompare(b.ward_name);
    });
  } else {
    // National view: only show districts with at least 1 complaint to prevent overcrowding
    sortedWards = [...(stats.perWard || [])]
      .filter(w => (parseInt(w.total) || 0) > 0)
      .sort((a, b) => b.total - a.total);
  }

  const displayData = groupBy === 'state'
    ? (showAllWards ? sortedStates : sortedStates.slice(0, 8))
    : (showAllWards ? sortedWards : sortedWards.slice(0, 8));

  const totalGroupCount = groupBy === 'state' ? sortedStates.length : sortedWards.length;

  const handleBarClick = (barData) => {
    if (!barData) return;
    const payload = barData.payload || barData;
    if (groupBy === 'state' && payload.state_name) {
      setSelectedStateFilter(payload.state_name);
      setGroupBy('district');
      setShowAllWards(true); // Show all districts for that state
    }
  };

  // Get latest 5 complaints for the activity stream
  const recentComplaints = allComplaints.slice(0, 5);

  return (
    <div>
      <style>{`
        @keyframes flipHourglass {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(180deg); }
        }
        @keyframes bounceChart {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-5px) scale(1.1); }
        }
        @keyframes checkPop {
          0% { transform: scale(1); }
          50% { transform: scale(1.35); }
          100% { transform: scale(1.15); }
        }
        @keyframes flameFlicker {
          0%, 100% { transform: scale(1) rotate(0deg); filter: drop-shadow(0 0 0px rgba(239,68,68,0)); }
          25% { transform: scale(1.2) rotate(-5deg); filter: drop-shadow(0 0 4px rgba(239,68,68,0.4)); }
          75% { transform: scale(0.95) rotate(5deg); filter: drop-shadow(0 0 2px rgba(239,68,68,0.3)); }
        }
        @keyframes lightningStrike {
          0%, 100% { transform: scale(1) translate(0, 0); filter: drop-shadow(0 0 0px rgba(234,179,8,0)); }
          15%, 45%, 75% { transform: scale(1.25) translate(-2px, 2px); filter: drop-shadow(0 0 6px rgba(234,179,8,0.6)); }
          30%, 60% { transform: scale(1.25) translate(2px, -2px); filter: drop-shadow(0 0 3px rgba(234,179,8,0.4)); }
        }

        .stat-card-hover:hover .icon-hourglass {
          animation: flipHourglass 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .stat-card-hover:hover .icon-chart {
          animation: bounceChart 0.6s ease-in-out infinite alternate;
        }
        .stat-card-hover:hover .icon-check {
          animation: checkPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        .stat-card-hover:hover .icon-flame {
          animation: flameFlicker 0.5s ease-in-out infinite;
        }
        .stat-card-hover:hover .icon-lightning {
          animation: lightningStrike 0.4s ease-out forwards;
        }

        .toggle-btn {
          font-family: var(--font);
          font-size: 12px;
          font-weight: 700;
          padding: 8px 16px;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .chart-card {
          background: var(--white);
          border: 1.5px solid var(--sand-100);
          border-radius: 20px;
          padding: 24px;
          box-shadow: var(--shadow-sm);
          transition: border-color 0.2s;
        }
        .chart-card:hover {
          border-color: var(--sand-200);
        }
        .activity-row {
          transition: background 0.15s;
        }
        .activity-row:hover {
          background: var(--sand-50);
        }
      `}</style>

      {/* Stat cards */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '32px' }}>
        <StatCard label="Total Complaints" value={stats.total} icon="📊" iconClass="icon-chart" accentColor="var(--ink)" hoverBg="rgba(20,20,16,0.02)" delay="0s" />
        <StatCard label="Pending" value={stats.pending} color="#d97706" accentColor="#f59e0b" icon="⏳" iconClass="icon-hourglass" hoverBg="rgba(245,158,11,0.04)" delay="0.05s" />
        <StatCard label="Resolved" value={stats.resolved} color="var(--green-600)" accentColor="var(--green-500)" icon="✅" iconClass="icon-check" hoverBg="rgba(16,185,129,0.04)" delay="0.1s" />
        <StatCard label="Resolved Today" value={stats.resolvedToday} color="#2563eb" accentColor="#3b82f6" icon="🔥" iconClass="icon-flame" hoverBg="rgba(59,130,246,0.04)" delay="0.15s" />
        <StatCard label="Avg Resolution" value={`${stats.avgHours}h`} sub="average response time" color="#4f46e5" accentColor="#6366f1" icon="⚡" iconClass="icon-lightning" hoverBg="rgba(99,102,241,0.04)" delay="0.2s" />
      </div>

      {/* View toggle (Charts vs Heatmap) */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
        <button 
          onClick={() => setView('charts')} 
          className="toggle-btn"
          style={{
            border: view === 'charts' ? '2px solid var(--ink)' : '1.5px solid var(--sand-200)',
            background: view === 'charts' ? 'var(--ink)' : 'var(--white)',
            color: view === 'charts' ? '#fff' : 'var(--sand-600)'
          }}
        >
          📊 Analytics Charts
        </button>
        <button 
          onClick={() => setView('heatmap')} 
          className="toggle-btn"
          style={{
            border: view === 'heatmap' ? '2px solid var(--ink)' : '1.5px solid var(--sand-200)',
            background: view === 'heatmap' ? 'var(--ink)' : 'var(--white)',
            color: view === 'heatmap' ? '#fff' : 'var(--sand-600)'
          }}
        >
          🗺️ Density Heatmap
        </button>
      </div>

      {/* Heatmap View */}
      {view === 'heatmap' && (() => {
        const filteredMapComplaints = allComplaints.filter(c => {
          const matchesCategory = !mapCategory || c.category === mapCategory;
          const matchesPriority = !mapPriority || c.priority === mapPriority;
          return matchesCategory && matchesPriority;
        });

        return (
          <div className="chart-card" style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--sand-400)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Geospatial Analysis
                </span>
                <h4 style={{ fontSize: '16px', fontWeight: '900', color: 'var(--ink)', marginTop: '2px' }}>
                  Complaint Density Map — India
                </h4>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <select 
                  value={mapCategory} 
                  onChange={e => setMapCategory(e.target.value)}
                  style={{
                    fontSize: '12px', padding: '6px 12px', borderRadius: '10px',
                    border: '1.5px solid var(--sand-200)', background: 'var(--white)',
                    color: 'var(--ink)', outline: 'none', fontWeight: '700'
                  }}
                >
                  <option value="">All Categories</option>
                  <option value="garbage_dump">Garbage Dump</option>
                  <option value="missed_pickup">Missed Pickup</option>
                  <option value="overflowing_bin">Overflowing Bin</option>
                  <option value="other">Other</option>
                </select>
                <select 
                  value={mapPriority} 
                  onChange={e => setMapPriority(e.target.value)}
                  style={{
                    fontSize: '12px', padding: '6px 12px', borderRadius: '10px',
                    border: '1.5px solid var(--sand-200)', background: 'var(--white)',
                    color: 'var(--ink)', outline: 'none', fontWeight: '700'
                  }}
                >
                  <option value="">All Priorities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
            <HeatmapView complaints={filteredMapComplaints} height={450} />
          </div>
        );
      })()}

      {/* Charts View */}
      {view === 'charts' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          
          {/* Bar Chart: Complaints per Ward/State */}
          <div className="chart-card" style={{ gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--sand-400)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Regional Statistics
                </span>
                <h4 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--ink)', marginTop: '2px' }}>
                  {selectedStateFilter 
                    ? `Districts in ${selectedStateFilter}` 
                    : (showAllWards 
                        ? (groupBy === 'state' ? 'All States' : 'All Districts') 
                        : (groupBy === 'state' ? 'Top States by Complaints' : 'Top Districts by Complaints'))}
                </h4>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                {/* Back to States button */}
                {selectedStateFilter && (
                  <button
                    onClick={() => {
                      setSelectedStateFilter(null);
                      setGroupBy('state');
                      setShowAllWards(false);
                    }}
                    style={{
                      background: 'var(--sand-100)',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '6px 14px',
                      fontSize: '11px',
                      fontWeight: '700',
                      color: 'var(--ink)',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--sand-200)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--sand-100)'}
                  >
                    ← Back to States
                  </button>
                )}

                {/* Group By Toggle */}
                {!selectedStateFilter && (
                  <div style={{ display: 'flex', gap: '4px', background: 'var(--sand-50)', padding: '3px', borderRadius: '8px', border: '1px solid var(--sand-200)' }}>
                    <button 
                      onClick={() => { setGroupBy('state'); setShowAllWards(false); }}
                      style={{
                        fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                        background: groupBy === 'state' ? 'var(--white)' : 'none',
                        color: groupBy === 'state' ? 'var(--ink)' : 'var(--sand-400)',
                        boxShadow: groupBy === 'state' ? 'var(--shadow-sm)' : 'none',
                        transition: 'all 0.15s'
                      }}
                    >
                      States
                    </button>
                    <button 
                      onClick={() => { setGroupBy('district'); setShowAllWards(false); }}
                      style={{
                        fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                        background: groupBy === 'district' ? 'var(--white)' : 'none',
                        color: groupBy === 'district' ? 'var(--ink)' : 'var(--sand-400)',
                        boxShadow: groupBy === 'district' ? 'var(--shadow-sm)' : 'none',
                        transition: 'all 0.15s'
                      }}
                    >
                      Districts
                    </button>
                  </div>
                )}

                <button
                  onClick={() => setShowAllWards(!showAllWards)}
                  style={{
                    background: 'var(--sand-50)',
                    border: '1.5px solid var(--sand-200)',
                    borderRadius: '12px',
                    padding: '6px 12px',
                    fontSize: '11px',
                    fontWeight: '700',
                    color: 'var(--sand-600)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--sand-300)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--sand-200)'}
                >
                  {showAllWards ? 'Show Top 8' : `Show All (${totalGroupCount})`}
                </button>
              </div>
            </div>
            
            <div style={{ width: '100%', height: 380 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={displayData} margin={{ bottom: 10 }}>
                  <defs>
                    <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4b5563" stopOpacity={0.95}/>
                      <stop offset="100%" stopColor="#9ca3af" stopOpacity={0.3}/>
                    </linearGradient>
                    <linearGradient id="resolvedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.95}/>
                      <stop offset="100%" stopColor="#34d399" stopOpacity={0.3}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey={groupBy === 'state' ? 'state_name' : 'ward_name'} 
                    tick={{ fontSize: 9, fill: 'var(--sand-600)', fontWeight: 600 }} 
                    interval={0} 
                    angle={-45} 
                    textAnchor="end" 
                    height={130}
                  />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--sand-400)' }} />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(20, 20, 16, 0.95)', 
                      borderRadius: '12px', 
                      border: 'none', 
                      color: '#fff',
                      fontSize: '12px',
                      boxShadow: 'var(--shadow-md)'
                    }} 
                  />
                  <Bar 
                    dataKey="total" 
                    name="Total" 
                    fill="url(#totalGrad)" 
                    radius={[4, 4, 0, 0]} 
                    barSize={showAllWards ? (groupBy === 'state' ? 24 : 8) : 24} 
                    onClick={handleBarClick}
                    style={{ cursor: groupBy === 'state' ? 'pointer' : 'default' }}
                  />
                  <Bar 
                    dataKey="resolved" 
                    name="Resolved" 
                    fill="url(#resolvedGrad)" 
                    radius={[4, 4, 0, 0]} 
                    barSize={showAllWards ? (groupBy === 'state' ? 24 : 8) : 24} 
                    onClick={handleBarClick}
                    style={{ cursor: groupBy === 'state' ? 'pointer' : 'default' }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>


          {/* Donut Chart: By Category */}
          <div className="chart-card">
            <div style={{ marginBottom: '20px' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--sand-400)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Distribution
              </span>
              <h4 style={{ fontSize: '16px', fontWeight: '900', color: 'var(--ink)', marginTop: '2px' }}>
                Complaints by Category
              </h4>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
              {/* Donut Chart Container */}
              <div style={{ position: 'relative', width: '180px', height: '180px', margin: '0 auto' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={catData} 
                      dataKey="value" 
                      nameKey="name" 
                      cx="50%" 
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {catData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        background: 'rgba(20, 20, 16, 0.95)', 
                        borderRadius: '12px', 
                        border: 'none', 
                        color: '#fff',
                        fontSize: '12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Centered Total Overlay */}
                <div style={{
                  position: 'absolute', top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)', textAlign: 'center',
                  pointerEvents: 'none'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--ink)', fontFamily: 'var(--font-display)', letterSpacing: '-0.5px' }}>
                    {stats.total}
                  </div>
                  <div style={{ fontSize: '9px', color: 'var(--sand-400)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Total
                  </div>
                </div>
              </div>

              {/* Custom Legend */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '180px' }}>
                {catData.slice(0, 5).map((item, idx) => {
                  const percentage = ((item.value / stats.total) * 100).toFixed(0);
                  return (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12.5px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: PIE_COLORS[idx % PIE_COLORS.length], flexShrink: 0 }} />
                        <span style={{ color: 'var(--ink)', fontWeight: '600', textTransform: 'capitalize', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.name}
                        </span>
                      </div>
                      <span style={{ color: 'var(--sand-400)', fontWeight: '700', marginLeft: '12px' }}>
                        {item.value} ({percentage}%)
                      </span>
                    </div>
                  );
                })}
                {catData.length > 5 && (
                  <div style={{ fontSize: '11px', color: 'var(--sand-400)', fontWeight: '700', paddingLeft: '16px', fontStyle: 'italic' }}>
                    + {catData.length - 5} more categories
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Activity Stream (Recent Complaints Table) */}
      <div className="chart-card" style={{ padding: 0, overflow: 'hidden', marginBottom: '24px' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1.5px solid var(--sand-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--sand-400)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Real-time Feed
            </span>
            <h4 style={{ fontSize: '16px', fontWeight: '900', color: 'var(--ink)', marginTop: '2px' }}>
              Recent Complaints
            </h4>
          </div>
          <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--green-600)', background: 'var(--green-50)', padding: '4px 12px', borderRadius: '12px' }}>
            Live Stream
          </span>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid var(--sand-100)', background: 'var(--sand-50)', textAlign: 'left' }}>
                {['ID', 'Category', 'District / Location', 'Reported By', 'Status', 'Date'].map(h => (
                  <th key={h} style={{ padding: '12px 24px', color: 'var(--sand-600)', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentComplaints.map(c => (
                <tr key={c.id} className="activity-row" style={{ borderBottom: '1px solid var(--sand-50)' }}>
                  <td style={{ padding: '14px 24px', color: 'var(--sand-400)', fontWeight: '700' }}>#{c.id}</td>
                  <td style={{ padding: '14px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}>
                      <span style={{ fontSize: '16px' }}>{CATEGORY_EMOJIS[c.category] || '📋'}</span>
                      <span style={{ textTransform: 'capitalize' }}>{c.category?.replace(/_/g, ' ')}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 24px' }}>
                    <div style={{ fontWeight: '600' }}>{c.ward_name || `Ward ${c.ward_id}`}</div>
                    <div style={{ fontSize: '11px', color: 'var(--sand-400)', marginTop: '2px', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.address || 'GPS Coordinates'}
                    </div>
                  </td>
                  <td style={{ padding: '14px 24px' }}>
                    <div style={{ fontWeight: '600' }}>{c.citizen_name || 'Anonymous'}</div>
                    <div style={{ fontSize: '11px', color: 'var(--sand-400)', marginTop: '2px' }}>{c.citizen_phone || 'N/A'}</div>
                  </td>
                  <td style={{ padding: '14px 24px' }}>
                    <StatusBadge status={c.status} />
                  </td>
                  <td style={{ padding: '14px 24px', color: 'var(--sand-600)', fontSize: '12px', fontWeight: '600' }}>
                    {new Date(c.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
