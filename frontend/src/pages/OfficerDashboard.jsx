import { useState, useEffect } from 'react';
import StatusBadge from '../components/StatusBadge';
import StatusTimeline from '../components/StatusTimeline';
import SkeletonCard from '../components/SkeletonCard';
import { wardComplaints, updateStatus, getComplaint } from '../api';
import { showToast } from '../components/Toast';
import { SinglePinMap } from '../components/MapView';
import HeatmapView from '../components/HeatmapView';
import RouteOptimization from './RouteOptimization';

const NEXT = {
  pending:     [{ value: 'assigned',    label: '⚡ Accept & Assign', style: 'btn-accept' }],
  assigned:    [{ value: 'in_progress', label: '⚙️ Mark In Progress', style: 'btn-progress' }],
  in_progress: [
    { value: 'resolved', label: '✅ Mark Resolved', style: 'btn-resolve' },
    { value: 'rejected', label: '❌ Reject', style: 'btn-reject' },
  ],
};

const ICONS = { 
  garbage_dump: '🗑️', 
  missed_pickup: '🚛', 
  overflowing_bin: '♻️', 
  other: '📋' 
};

export default function OfficerDashboard() {
  const [tab, setTab]               = useState('overview'); // overview | complaints
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter]         = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected]     = useState(null);
  const [detail, setDetail]         = useState(null);
  const [note, setNote]             = useState('');
  const [updating, setUpdating]     = useState(false);
  const [loading, setLoading]       = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const load = async () => {
    setLoading(true);
    try {
      const r = await wardComplaints(filter ? { status: filter } : {});
      setComplaints(r.data.complaints || []);
    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    load(); 
  }, [filter]);

  const openDetail = async c => {
    setSelected(c); 
    setNote('');
    try { 
      const r = await getComplaint(c.id); 
      setDetail(r.data); 
    } catch { 
      setDetail(null); 
    }
  };

  const handleUpdate = async status => {
    if (!selected) return;
    setUpdating(true);
    try {
      await updateStatus(selected.id, { status, resolution_note: note });
      showToast(`Status updated to ${status.replace('_',' ')}`, 'success');
      setSelected(null); 
      setDetail(null);
      load();
    } catch { 
      showToast('Update failed', 'error'); 
    } finally { 
      setUpdating(false); 
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const openCount = complaints.filter(c => !['resolved','rejected'].includes(c.status)).length;
  const resolvedCount = complaints.filter(c => c.status === 'resolved').length;
  const nextActions = NEXT[selected?.status] || [];

  // Filter complaints list by search term
  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = !searchTerm || 
      c.id.toString().includes(searchTerm) || 
      c.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.citizen_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--sand-50)', color: 'var(--ink)', fontFamily: 'var(--font)' }}>
      <style>{`
        .sidebar {
          width: 260px;
          background: #141410;
          color: #fdfcf9;
          display: flex;
          flex-direction: column;
          border-right: 1px solid rgba(253, 252, 249, 0.08);
          position: fixed;
          top: 0;
          bottom: 0;
          left: 0;
          z-index: 1000;
        }
        .main-content {
          flex: 1;
          margin-left: 260px;
          padding: 40px;
          min-width: 0;
          box-sizing: border-box;
        }
        .sidebar-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: none;
          border: none;
          color: rgba(253, 252, 249, 0.65);
          font-size: 14px;
          font-weight: 700;
          text-align: left;
          cursor: pointer;
          border-radius: 12px;
          transition: all 0.2s ease;
          margin-bottom: 6px;
          font-family: inherit;
        }
        .sidebar-btn:hover {
          background: rgba(253, 252, 249, 0.06);
          color: #fdfcf9;
          transform: translateX(2px);
        }
        .sidebar-btn.active {
          background: var(--green-500);
          color: #ffffff;
        }
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }
        .kpi-card {
          background: var(--white);
          border: 1.5px solid var(--sand-100);
          border-radius: 20px;
          padding: 24px;
          box-shadow: var(--shadow-sm);
          transition: all 0.3s;
        }
        .kpi-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        .dashboard-card {
          background: var(--white);
          border: 1.5px solid var(--sand-100);
          border-radius: 20px;
          padding: 24px;
          box-shadow: var(--shadow-sm);
          margin-bottom: 24px;
        }
        .complaint-row {
          background: var(--white);
          border: 1.5px solid var(--sand-100);
          border-radius: 16px;
          padding: 18px 24px;
          margin-bottom: 12px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: var(--shadow-sm);
        }
        .complaint-row:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
          border-color: var(--sand-200);
        }
        .select-filter, .search-input {
          font-size: 13.5px;
          padding: 10px 14px;
          border-radius: 12px;
          border: 1.5px solid var(--sand-200);
          background: var(--white);
          color: var(--ink);
          outline: none;
          transition: all 0.2s;
          font-family: inherit;
        }
        .select-filter:focus, .search-input:focus {
          border-color: var(--green-500);
          box-shadow: 0 0 0 3px var(--green-50);
        }
        .detail-card {
          background: var(--white);
          border: 1.5px solid var(--sand-100);
          border-radius: 20px;
          padding: 24px;
          box-shadow: var(--shadow-sm);
          margin-bottom: 20px;
        }
        .btn-back {
          background: none;
          border: 1.5px solid var(--sand-200);
          color: var(--sand-600);
          padding: 8px 16px;
          border-radius: 10px;
          font-size: 12.5px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
          margin-bottom: 20px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .btn-back:hover {
          background: var(--sand-100);
          color: var(--ink);
        }
        .btn-action {
          padding: 12px 24px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
          border: none;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .btn-accept { background: var(--green-500); color: #fff; }
        .btn-accept:hover { background: var(--green-600); }
        .btn-progress { background: #3b82f6; color: #fff; }
        .btn-progress:hover { background: #2563eb; }
        .btn-resolve { background: var(--green-500); color: #fff; }
        .btn-resolve:hover { background: var(--green-600); }
        .btn-reject { background: none; border: 1.5px solid var(--sand-200); color: var(--sand-600); }
        .btn-reject:hover { background: var(--danger-bg); color: var(--danger-text); border-color: var(--danger-text); }
      `}</style>

      {/* Sidebar navigation */}
      <aside className="sidebar">
        {/* Sidebar Brand/Logo */}
        <div style={{ padding: '24px', borderBottom: '1px solid rgba(253, 252, 249, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>🏛️</span>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '900', letterSpacing: '-0.3px', color: '#fdfcf9' }}>
                India Smart Cities
              </div>
              <div style={{ fontSize: '11px', color: 'var(--green-500)', fontWeight: '700', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--green-500)' }} />
                Officer Console
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ flex: 1, padding: '24px 16px' }}>
          <button
            onClick={() => { setTab('overview'); setSelected(null); }}
            className={`sidebar-btn ${tab === 'overview' ? 'active' : ''}`}
          >
            <span style={{ fontSize: '18px', width: '24px', textAlign: 'center' }}>📊</span>
            <span>Overview</span>
          </button>

          <button
            onClick={() => { setTab('complaints'); }}
            className={`sidebar-btn ${tab === 'complaints' ? 'active' : ''}`}
          >
            <span style={{ fontSize: '18px', width: '24px', textAlign: 'center' }}>📋</span>
            <span>Complaints ({openCount})</span>
          </button>

          <button
            onClick={() => { setTab('route'); setSelected(null); }}
            className={`sidebar-btn ${tab === 'route' ? 'active' : ''}`}
          >
            <span style={{ fontSize: '18px', width: '24px', textAlign: 'center' }}>🗺️</span>
            <span>Route Planner</span>
          </button>
        </nav>

        {/* Profile & Logout */}
        <div style={{ padding: '20px 16px', borderTop: '1px solid rgba(253, 252, 249, 0.08)', background: 'rgba(0,0,0,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'var(--green-50)', color: 'var(--green-600)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: '900', fontSize: '14px', flexShrink: 0
              }}>
                {user.name ? user.name[0].toUpperCase() : 'O'}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#fdfcf9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.name}
                </div>
                <div style={{ fontSize: '10px', color: 'rgba(253, 252, 249, 0.4)', fontWeight: '700' }}>
                  Ward Officer
                </div>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              style={{
                background: 'none',
                border: '1px solid rgba(253, 252, 249, 0.15)',
                color: 'rgba(253, 252, 249, 0.7)',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontFamily: 'inherit'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#ea580c';
                e.currentTarget.style.color = '#ff9242';
                e.currentTarget.style.background = 'rgba(234, 88, 12, 0.05)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(253, 252, 249, 0.15)';
                e.currentTarget.style.color = 'rgba(253, 252, 249, 0.7)';
                e.currentTarget.style.background = 'none';
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="main-content">
        
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--sand-400)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Officer Console
          </div>
          <h2 style={{ fontSize: '32px', fontWeight: '900', color: 'var(--ink)', letterSpacing: '-0.8px', marginTop: '4px' }}>
            {tab === 'overview' ? 'Operations Overview' : (selected ? 'Complaint Workspace' : 'Manage Complaints')}
          </h2>
        </div>

        {/* TAB 1: OVERVIEW */}
        {tab === 'overview' && (
          <div style={{ animation: 'slideUp 0.3s ease' }}>
            {/* Welcome banner */}
            <div style={{ marginBottom: '28px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '850', color: 'var(--ink)' }}>
                Welcome back, {user.name}
              </h3>
              <p style={{ color: 'var(--sand-500)', fontSize: '13.5px', marginTop: '4px' }}>
                Monitor live complaints and manage your coverage area.
              </p>
            </div>

            {/* KPIs Grid */}
            <div className="kpi-grid">
              <div className="kpi-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--sand-400)', textTransform: 'uppercase' }}>Active Cases</div>
                <div style={{ fontSize: '24px', fontWeight: '900', marginTop: '6px', color: '#d97706' }}>{openCount}</div>
                <div style={{ fontSize: '11px', color: 'var(--sand-450)', marginTop: '2px' }}>Awaiting resolution</div>
              </div>

              <div className="kpi-card" style={{ borderLeft: '4px solid var(--ink)' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--sand-400)', textTransform: 'uppercase' }}>Total Assigned</div>
                <div style={{ fontSize: '24px', fontWeight: '900', marginTop: '6px' }}>{complaints.length}</div>
                <div style={{ fontSize: '11px', color: 'var(--sand-450)', marginTop: '2px' }}>Total caseload</div>
              </div>

              <div className="kpi-card" style={{ borderLeft: '4px solid var(--green-500)' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--sand-400)', textTransform: 'uppercase' }}>Resolved Cases</div>
                <div style={{ fontSize: '24px', fontWeight: '900', marginTop: '6px', color: 'var(--green-600)' }}>{resolvedCount}</div>
                <div style={{ fontSize: '11px', color: 'var(--sand-450)', marginTop: '2px' }}>Successfully closed</div>
              </div>
            </div>

            {/* Map Card */}
            <div className="dashboard-card">
              <div style={{ marginBottom: '18px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '900', color: 'var(--ink)' }}>
                  🗺️ Interactive Workload Dispatch Map
                </h4>
                <p style={{ color: 'var(--sand-400)', fontSize: '12.5px', marginTop: '2px' }}>
                  Pins representing all active complaints in your assigned districts across India.
                </p>
              </div>
              <div style={{ borderRadius: '14px', overflow: 'hidden', border: '1.5px solid var(--sand-100)' }}>
                <HeatmapView complaints={complaints.filter(c => c.status !== 'resolved')} height={380} />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COMPLAINTS */}
        {tab === 'complaints' && (
          <div style={{ animation: 'slideUp 0.3s ease' }}>
            {!selected ? (
              /* COMPLAINT LIST VIEW */
              <div>
                {/* Search & Filter Bar */}
                <div style={{
                  background: 'var(--white)',
                  border: '1.5px solid var(--sand-100)',
                  borderRadius: '20px',
                  padding: '20px 24px',
                  marginBottom: '24px',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  gap: '16px',
                  flexWrap: 'wrap',
                  alignItems: 'center'
                }}>
                  <div style={{ flex: 1, minWidth: '250px' }}>
                    <input 
                      type="text" 
                      placeholder="Search by ID, category, or citizen name..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="search-input"
                      style={{ width: '100%', margin: 0 }}
                    />
                  </div>
                  <div style={{ minWidth: '180px' }}>
                    <select 
                      value={filter} 
                      onChange={e => setFilter(e.target.value)}
                      className="select-filter"
                      style={{ width: '100%', margin: 0 }}
                    >
                      <option value="">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="assigned">Assigned</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                </div>

                {/* List */}
                {loading ? (
                  <SkeletonCard count={3} />
                ) : filteredComplaints.length === 0 ? (
                  <div style={{
                    background: 'var(--white)',
                    border: '1.5px solid var(--sand-100)',
                    borderRadius: '20px',
                    padding: '64px 32px',
                    textAlign: 'center',
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    <span style={{ fontSize: '48px' }}>🎉</span>
                    <h3 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--ink)', marginTop: '16px' }}>
                      All Clear!
                    </h3>
                    <p style={{ color: 'var(--sand-400)', fontSize: '13.5px', marginTop: '8px' }}>
                      No complaints match your search or filter settings.
                    </p>
                  </div>
                ) : (
                  <div>
                    {filteredComplaints.map(c => (
                      <div 
                        key={c.id} 
                        className="complaint-row"
                        onClick={() => openDetail(c)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0 }}>
                          <span style={{ fontSize: '24px' }}>{ICONS[c.category] || '📋'}</span>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '15px', fontWeight: '850', color: 'var(--ink)', textTransform: 'capitalize' }}>
                              #{c.id} {c.category?.replace(/_/g, ' ')}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--sand-450)', marginTop: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '450px' }}>
                              📍 {c.address || 'No address details'}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
                          <div style={{ textAlign: 'right', fontSize: '12px', color: 'var(--sand-400)', fontWeight: '600' }}>
                            <div>Citizen: {c.citizen_name}</div>
                            <div style={{ marginTop: '2px' }}>🕒 {Math.floor((Date.now() - new Date(c.created_at)) / 86400000)}d ago</div>
                          </div>
                          <StatusBadge status={c.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* COMPLAINT DETAIL VIEW (Full-width workspace) */
              <div style={{ animation: 'fadeIn 0.25s ease' }}>
                {/* Back button and title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
                  <button onClick={() => { setSelected(null); setDetail(null); }} className="btn-back" style={{ margin: 0 }}>
                    ← Back
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--ink)', margin: 0 }}>
                      Complaint #{selected.id}
                    </h3>
                    <StatusBadge status={selected.status} />
                  </div>
                </div>

                {/* Centered Single Column Workspace */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
                  
                  {/* 1. Citizen's Original Report */}
                  <div style={{ 
                    background: 'var(--white)', 
                    border: '1.5px solid var(--sand-100)', 
                    borderRadius: '20px', 
                    padding: '24px', 
                    boxShadow: 'var(--shadow-sm)' 
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <span style={{ fontSize: '10.5px', fontWeight: '850', color: 'var(--sand-400)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Original Report
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--sand-450)', fontWeight: '600' }}>
                        📅 {new Date(selected.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: 'var(--sand-100)', color: 'var(--ink)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: '900', fontSize: '14px'
                      }}>
                        {selected.citizen_name ? selected.citizen_name[0].toUpperCase() : 'C'}
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--ink)' }}>{selected.citizen_name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--sand-450)' }}>Citizen Reporter</div>
                      </div>
                    </div>

                    {selected.description && (
                      <div style={{ 
                        fontSize: '14px', color: 'var(--sand-700)', lineHeight: '1.6', 
                        background: 'var(--sand-50)', padding: '16px 20px', borderRadius: '12px', 
                        borderLeft: '4px solid var(--green-500)', fontStyle: 'italic'
                      }}>
                        "{selected.description}"
                      </div>
                    )}

                    {selected.photo_url && (
                      <div style={{ 
                        marginTop: '20px',
                        borderRadius: '12px', 
                        overflow: 'hidden', 
                        border: '1.5px solid var(--sand-150)', 
                        background: 'var(--sand-50)', 
                        display: 'flex', 
                        justifyContent: 'center' 
                      }}>
                        <img 
                          src={selected.photo_url} 
                          alt="complaint evidence"
                          style={{ width: '100%', maxHeight: 320, objectFit: 'contain', display: 'block' }}
                          onError={(e) => {
                            e.currentTarget.parentElement.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* 2. Incident Location */}
                  <div style={{ 
                    background: 'var(--white)', 
                    border: '1.5px solid var(--sand-100)', 
                    borderRadius: '20px', 
                    padding: '24px', 
                    boxShadow: 'var(--shadow-sm)' 
                  }}>
                    <span style={{ fontSize: '10.5px', fontWeight: '850', color: 'var(--sand-400)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '12px' }}>
                      Incident Location
                    </span>
                    <div style={{ fontSize: '13.5px', color: 'var(--ink)', lineHeight: '1.5', fontWeight: '750', marginBottom: '10px' }}>
                      📍 {selected.address || 'No address details provided'}
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <a 
                        href={`https://www.google.com/maps/dir/?api=1&destination=${selected.latitude},${selected.longitude}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ fontSize: '12px', fontWeight: '850', color: 'var(--green-600)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        🧭 Navigate with Google Maps ↗
                      </a>
                    </div>
                    <div style={{ borderRadius: '14px', overflow: 'hidden', border: '1.5px solid var(--sand-150)', height: '260px' }}>
                      <SinglePinMap latitude={selected.latitude} longitude={selected.longitude} height={260} />
                    </div>
                  </div>

                  {/* 3. Ticket Details & Citizen Contact */}
                  <div style={{ 
                    background: 'var(--white)', 
                    border: '1.5px solid var(--sand-100)', 
                    borderRadius: '20px', 
                    padding: '24px', 
                    boxShadow: 'var(--shadow-sm)' 
                  }}>
                    <span style={{ fontSize: '10.5px', fontWeight: '850', color: 'var(--sand-400)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '16px' }}>
                      Ticket Metadata
                    </span>
                    
                    {/* Category */}
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '11px', color: 'var(--sand-450)', fontWeight: '600' }}>Category</div>
                      <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--ink)', marginTop: '2px', textTransform: 'capitalize' }}>
                        {ICONS[selected.category] || '📋'} {selected.category?.replace(/_/g, ' ')}
                      </div>
                    </div>

                    {/* Severity */}
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '11px', color: 'var(--sand-450)', fontWeight: '600' }}>Severity</div>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: selected.severity === 'critical' ? '#dc2626' : selected.severity === 'high' ? '#2563eb' : '#d97706', marginTop: '4px', textTransform: 'capitalize' }}>
                        ● {selected.severity || 'Medium'}
                      </div>
                    </div>

                    <hr style={{ border: 'none', height: '1px', background: 'var(--sand-100)', margin: '16px 0' }} />

                    {/* Citizen Contact */}
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--sand-450)', fontWeight: '600', marginBottom: '6px' }}>Citizen Contact</div>
                      <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--ink)' }}>{selected.citizen_name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--sand-500)', marginTop: '2px', fontWeight: '600' }}>{selected.citizen_phone}</div>
                      <a 
                        href={`tel:${selected.citizen_phone}`}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                          padding: '10px', borderRadius: '10px', background: 'var(--sand-50)',
                          border: '1.5px solid var(--sand-200)', color: 'var(--ink)',
                          textDecoration: 'none', fontSize: '12px', fontWeight: '800',
                          marginTop: '12px', transition: 'all 0.2s', textAlign: 'center'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--sand-100)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'var(--sand-50)'}
                      >
                        📞 Call Citizen
                      </a>
                    </div>
                  </div>

                  {/* 4. Status Timeline */}
                  {detail?.history?.length > 0 && (
                    <div style={{ 
                      background: 'var(--white)', 
                      border: '1.5px solid var(--sand-100)', 
                      borderRadius: '20px', 
                      padding: '24px', 
                      boxShadow: 'var(--shadow-sm)' 
                    }}>
                      <span style={{ fontSize: '10.5px', fontWeight: '850', color: 'var(--sand-400)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '20px' }}>
                        Activity & Status History
                      </span>
                      <StatusTimeline history={detail.history} />
                    </div>
                  )}

                  {/* 5. Action Panel (Update Status) */}
                  {nextActions.length > 0 && (
                    <div style={{ 
                      background: 'var(--white)', 
                      border: '1.5px solid var(--sand-100)', 
                      borderRadius: '20px', 
                      padding: '24px', 
                      boxShadow: 'var(--shadow-sm)' 
                    }}>
                      <span style={{ fontSize: '10.5px', fontWeight: '850', color: 'var(--sand-400)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '16px' }}>
                        Take Action: Update Status
                      </span>
                      <textarea 
                        value={note} 
                        onChange={e => setNote(e.target.value)}
                        placeholder="Write an internal note or update message for the citizen (optional)..." 
                        rows={3}
                        style={{
                          width: '100%',
                          padding: '14px',
                          borderRadius: '12px',
                          border: '1.5px solid var(--sand-200)',
                          background: 'var(--sand-50)',
                          fontSize: '13.5px',
                          fontFamily: 'inherit',
                          color: 'var(--ink)',
                          outline: 'none',
                          resize: 'none',
                          marginBottom: '16px',
                          transition: 'all 0.2s'
                        }}
                      />
                      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        {nextActions.map(a => (
                          <button 
                            key={a.value} 
                            onClick={() => handleUpdate(a.value)} 
                            disabled={updating}
                            style={{
                              padding: '12px 24px',
                              borderRadius: '12px',
                              fontSize: '13px',
                              fontWeight: '800',
                              cursor: 'pointer',
                              border: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontFamily: 'inherit',
                              transition: 'all 0.2s',
                              background: a.value === 'resolved' || a.value === 'assigned' ? 'var(--green-500)' : a.value === 'in_progress' ? '#3b82f6' : 'none',
                              color: a.value === 'rejected' ? 'var(--sand-600)' : '#fff',
                              border: a.value === 'rejected' ? '1.5px solid var(--sand-200)' : 'none',
                              boxShadow: a.value !== 'rejected' ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
                            }}
                          >
                            {updating ? 'Updating...' : a.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 6. Resolved Banner */}
                  {selected.status === 'resolved' && (
                    <div style={{ 
                      background: 'var(--green-50)', border: '1.5px solid var(--green-200)',
                      borderRadius: '16px', padding: '20px', textAlign: 'center',
                      fontSize: '14px', fontWeight: '800', color: 'var(--green-600)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}>
                      <span>✅</span> This complaint has been successfully resolved.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        {tab === 'route' && <RouteOptimization />}
      </main>
    </div>
  );
}
