import { useState } from 'react';
import AdminOverview   from './AdminOverview';
import AdminComplaints from './AdminComplaints';
import AdminWards      from './AdminWards';
import AdminReports    from './AdminReports';
import AdminOfficers   from './AdminOfficers';
import AdminBroadcast  from './AdminBroadcast';
import AdminSettings   from './AdminSettings';

const TABS = [
  { id: 'overview',    label: 'Overview',            icon: '📊' },
  { id: 'complaints',  label: 'Complaints',          icon: '📋' },
  { id: 'wards',       label: 'Districts',           icon: '🏘️' },
  { id: 'officers',    label: 'Officers',            icon: '👥' },
  { id: 'broadcast',   label: 'Broadcast Alert',     icon: '📢' },
  { id: 'reports',     label: 'Reports & Export',    icon: '📈' },
  { id: 'settings',    label: 'System Settings',     icon: '⚙️' },
];

export default function AdminPanel() {
  const [tab, setTab] = useState('overview');
  const [menuOpen, setMenuOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{"name": "Admin User"}');

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const activeTabLabel = TABS.find(t => t.id === tab)?.label || '';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--sand-50)', color: 'var(--ink)' }}>
      {/* Embedded CSS for sidebar, layout, and animations */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.9); opacity: 0.6; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(0.9); opacity: 0.6; }
        }
        
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
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .main-content {
          flex: 1;
          margin-left: 260px;
          padding: 40px;
          min-width: 0;
          transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-sizing: border-box;
        }
        
        .mobile-header {
          display: none;
          background: #141410;
          color: #fdfcf9;
          padding: 14px 20px;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 999;
          border-bottom: 1px solid rgba(253, 252, 249, 0.08);
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

        .backdrop {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 998;
          backdrop-filter: blur(4px);
        }
        
        @media (max-width: 900px) {
          .sidebar {
            transform: translateX(${menuOpen ? '0' : '-100%'});
          }
          .main-content {
            margin-left: 0;
            padding: 24px 20px;
          }
          .mobile-header {
            display: flex;
          }
          .backdrop {
            display: ${menuOpen ? 'block' : 'none'};
          }
        }
      `}</style>

      {/* Backdrop for mobile */}
      <div className="backdrop" onClick={() => setMenuOpen(false)} />

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
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--green-500)', animation: 'pulse 1.5s infinite' }} />
                Admin Console
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ flex: 1, padding: '24px 16px' }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => {
                setTab(t.id);
                setMenuOpen(false);
              }}
              className={`sidebar-btn ${tab === t.id ? 'active' : ''}`}
            >
              <span style={{ fontSize: '18px', width: '24px', textAlign: 'center' }}>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </nav>

        {/* Admin Profile & Logout at bottom */}
        <div style={{ padding: '20px 16px', borderTop: '1px solid rgba(253, 252, 249, 0.08)', background: 'rgba(0,0,0,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'var(--green-50)', color: 'var(--green-600)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: '900', fontSize: '14px', flexShrink: 0
              }}>
                {user.name ? user.name[0].toUpperCase() : 'A'}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#fdfcf9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.name || 'Admin'}
                </div>
                <div style={{ fontSize: '10px', color: 'rgba(253, 252, 249, 0.4)', fontWeight: '700' }}>
                  System Admin
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                background: 'none', border: '1px solid rgba(253, 252, 249, 0.15)',
                color: 'rgba(253, 252, 249, 0.7)', padding: '6px 12px', borderRadius: '8px',
                fontSize: '11px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#ea580c';
                e.currentTarget.style.color = '#ff9242';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(253, 252, 249, 0.15)';
                e.currentTarget.style.color = 'rgba(253, 252, 249, 0.7)';
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setMenuOpen(true)}
            style={{ background: 'none', border: 'none', color: '#fdfcf9', fontSize: '20px', cursor: 'pointer' }}
          >
            ☰
          </button>
          <span style={{ fontSize: '15px', fontWeight: '900', letterSpacing: '-0.3px' }}>
            India Smart Cities
          </span>
        </div>
        <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--green-500)', background: 'rgba(34,197,94,0.1)', padding: '4px 10px', borderRadius: '12px' }}>
          {activeTabLabel}
        </span>
      </header>

      {/* Main Content Pane */}
      <main className="main-content">
        {/* Dynamic header for desktop view */}
        <div style={{ marginBottom: '32px' }} className="desktop-header">
          <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--sand-400)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Admin Console
          </div>
          <h2 style={{ fontSize: '32px', fontWeight: '900', color: 'var(--ink)', letterSpacing: '-0.8px', marginTop: '4px' }}>
            {activeTabLabel}
          </h2>
        </div>

        {/* Tab pages */}
        <div style={{ animation: 'slideUp 0.3s ease' }}>
          {tab === 'overview'   && <AdminOverview   />}
          {tab === 'complaints' && <AdminComplaints />}
          {tab === 'wards'      && <AdminWards      />}
          {tab === 'officers'   && <AdminOfficers   />}
          {tab === 'broadcast'  && <AdminBroadcast  />}
          {tab === 'reports'    && <AdminReports    />}
          {tab === 'settings'   && <AdminSettings   />}
        </div>
      </main>
    </div>
  );
}
