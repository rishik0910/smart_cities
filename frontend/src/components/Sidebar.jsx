import { useNavigate, useLocation } from 'react-router-dom';

function Icon({ name }) {
  switch (name) {
    case 'grid':
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="gridGrad" x1="3" y1="3" x2="21" y2="21">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
          <rect x="3" y="3" width="7" height="7" rx="2" fill="url(#gridGrad)" opacity="0.9" />
          <rect x="14" y="3" width="7" height="7" rx="2" stroke="url(#gridGrad)" strokeWidth="2" />
          <rect x="3" y="14" width="7" height="7" rx="2" stroke="url(#gridGrad)" strokeWidth="2" />
          <rect x="14" y="14" width="7" height="7" rx="2" fill="url(#gridGrad)" opacity="0.4" />
        </svg>
      );
    case 'pencil':
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="pencilGrad" x1="2" y1="22" x2="22" y2="2">
              <stop offset="0%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
          </defs>
          <path d="M12 20h9" stroke="url(#pencilGrad)" strokeWidth="2" strokeLinecap="round" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" fill="url(#pencilGrad)" opacity="0.2" stroke="url(#pencilGrad)" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="18" cy="6" r="1" fill="#FFFFFF" />
        </svg>
      );
    case 'file':
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="fileGrad" x1="4" y1="2" x2="20" y2="22">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
          </defs>
          <path d="M14.5 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5Z" fill="url(#fileGrad)" opacity="0.15" stroke="url(#fileGrad)" strokeWidth="2" />
          <path d="M14 3v5h5" stroke="url(#fileGrad)" strokeWidth="2" strokeLinejoin="round" />
          <line x1="8" y1="13" x2="16" y2="13" stroke="url(#fileGrad)" strokeWidth="2" strokeLinecap="round" />
          <line x1="8" y1="17" x2="13" y2="17" stroke="url(#fileGrad)" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'pin':
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="pinGradSide" x1="12" y1="2" x2="12" y2="22">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
          <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-8a8 8 0 0 0-8-8z" fill="url(#pinGradSide)" opacity="0.2" stroke="url(#pinGradSide)" strokeWidth="2" />
          <circle cx="12" cy="10" r="3" fill="url(#pinGradSide)" stroke="#FFFFFF" strokeWidth="1.5" />
          <path d="M7 18c-2 1-3 2-3 3 0 1.5 3.5 2 8 2s8-.5 8-2c0-1-1-2-3-3" stroke="url(#pinGradSide)" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
        </svg>
      );
    case 'trophy':
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="trophyGrad" x1="6" y1="2" x2="18" y2="22">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>
          <path d="M6 9c0 3 2.5 5.5 5.5 5.5s5.5-2.5 5.5-5.5V4H6v5z" fill="url(#trophyGrad)" opacity="0.2" stroke="url(#trophyGrad)" strokeWidth="2" />
          <path d="M6 6H4c-1.5 0-2 1-2 2.5S3.5 11 5 11h1M18 6h2c1.5 0 2 1 2 2.5S20.5 11 19 11h-1" stroke="url(#trophyGrad)" strokeWidth="2" strokeLinecap="round" />
          <path d="M12 14.5V20M8 20h8" stroke="url(#trophyGrad)" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'award':
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="awardGrad" x1="6" y1="2" x2="18" y2="22">
              <stop offset="0%" stopColor="#EC4899" />
              <stop offset="100%" stopColor="#BE185D" />
            </linearGradient>
          </defs>
          <circle cx="12" cy="9" r="6" fill="url(#awardGrad)" opacity="0.2" stroke="url(#awardGrad)" strokeWidth="2" />
          <path d="M9 14.5 L7 22 L12 19.5 L17 22 L15 14.5" stroke="url(#awardGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="9" r="2.5" fill="url(#awardGrad)" />
        </svg>
      );
    case 'chart':
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="chartGrad" x1="3" y1="3" x2="21" y2="21">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#4F46E5" />
            </linearGradient>
          </defs>
          <path d="M3 3v18h18" stroke="url(#chartGrad)" strokeWidth="2" strokeLinecap="round" />
          <rect x="6" y="12" width="3" height="6" rx="1.5" fill="url(#chartGrad)" opacity="0.3" stroke="url(#chartGrad)" strokeWidth="1.5" />
          <rect x="11" y="8" width="3" height="10" rx="1.5" fill="url(#chartGrad)" opacity="0.6" stroke="url(#chartGrad)" strokeWidth="1.5" />
          <rect x="16" y="5" width="3" height="13" rx="1.5" fill="url(#chartGrad)" opacity="0.9" stroke="url(#chartGrad)" strokeWidth="1.5" />
        </svg>
      );
    case 'user':
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="userGrad" x1="4" y1="4" x2="20" y2="20">
              <stop offset="0%" stopColor="#0EA5E9" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
          </defs>
          <circle cx="12" cy="7" r="4" fill="url(#userGrad)" opacity="0.25" stroke="url(#userGrad)" strokeWidth="2" />
          <path d="M5 21a7 7 0 0 1 14 0" stroke="url(#userGrad)" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'gear':
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="gearGrad" x1="4" y1="4" x2="20" y2="20">
              <stop offset="0%" stopColor="#64748B" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
          </defs>
          <circle cx="12" cy="12" r="3" fill="url(#gearGrad)" opacity="0.3" stroke="url(#gearGrad)" strokeWidth="2" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="url(#gearGrad)" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      );
    case 'help':
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="helpGrad" x1="4" y1="4" x2="20" y2="20">
              <stop offset="0%" stopColor="#0D9488" />
              <stop offset="100%" stopColor="#0F766E" />
            </linearGradient>
          </defs>
          <circle cx="12" cy="12" r="10" fill="url(#helpGrad)" opacity="0.15" stroke="url(#helpGrad)" strokeWidth="2" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="url(#helpGrad)" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="12" cy="17" r="1.25" fill="url(#helpGrad)" />
        </svg>
      );
    case 'logout':
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="logoutGrad" x1="4" y1="4" x2="20" y2="20">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="100%" stopColor="#DC2626" />
            </linearGradient>
          </defs>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="url(#logoutGrad)" strokeWidth="2" strokeLinecap="round" />
          <polyline points="16 17 21 12 16 7" stroke="url(#logoutGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="21" y1="12" x2="9" y2="12" stroke="url(#logoutGrad)" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'shield':
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="shieldGrad" x1="4" y1="2" x2="20" y2="22">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>
          </defs>
          <path d="M12 2 4 5v6c0 5 3.4 8.7 8 11 4.6-2.3 8-6 8-11V5Z" fill="url(#shieldGrad)" opacity="0.25" stroke="url(#shieldGrad)" strokeWidth="2" />
        </svg>
      );
    default:
      return null;
  }
}

const MAIN_NAV = [
  { path: '/home',              label: 'Dashboard',           icon: 'grid' },
  { path: '/submit',             label: 'Report an Issue',     icon: 'pencil' },
  { path: '/track',              label: 'My Reports',          icon: 'file' },
  { path: '/near-me',            label: 'Near Me',             icon: 'pin' },
  { path: '/leaderboard',        label: 'Leaderboard',         icon: 'trophy' },
  { path: '/rewards',            label: 'Rewards',             icon: 'award' },
];

const ACCOUNT_NAV = [
  { path: '/profile',  label: 'Profile',         icon: 'user' },
  { path: '/settings',  label: 'Settings',        icon: 'gear' },
  { path: '/help',      label: 'Help & Support', icon: 'help' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path ||
    (path === '/home' && location.pathname === '/');

  const signOut = () => { localStorage.clear(); navigate('/login'); };

  const NavRow = ({ item, onClick }) => {
    const active = isActive(item.path);
    return (
      <button
        className="sidebar-nav-row"
        data-active={active ? 'true' : 'false'}
        onClick={onClick || (() => navigate(item.path))}
      >
        <span className="sidebar-nav-icon"><Icon name={item.icon} /></span>
        <span>{item.label}</span>
      </button>
    );
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo" onClick={() => navigate('/home')} style={{ display: 'flex', alignItems: 'center', gap: '11px', padding: '12px 14px 22px', cursor: 'pointer' }}>
        <span style={{ display: 'flex', alignItems: 'center', color: 'var(--green-600)', flexShrink: 0 }}>
          <svg width="34" height="34" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 34H34" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
            <path d="M10 34V18C10 17.4477 10.4477 17 11 17H15C15.5523 17 16 17.4477 16 18V34" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"/>
            <path d="M16 34V10C16 9.44772 16.4477 9 17 9H23C23.5523 9 24 9.44772 24 10V34" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"/>
            <path d="M24 34V22C24 21.4477 24.4477 21 25 21H29C29.5523 21 30 21.4477 30 22V34" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"/>
            <path d="M13 21H14" stroke="currentColor" strokeWidth="2.0" strokeLinecap="round"/>
            <path d="M13 25H14" stroke="currentColor" strokeWidth="2.0" strokeLinecap="round"/>
            <path d="M13 29H14" stroke="currentColor" strokeWidth="2.0" strokeLinecap="round"/>
            <path d="M19 13H21" stroke="currentColor" strokeWidth="2.0" strokeLinecap="round"/>
            <path d="M19 17H21" stroke="currentColor" strokeWidth="2.0" strokeLinecap="round"/>
            <path d="M19 21H21" stroke="currentColor" strokeWidth="2.0" strokeLinecap="round"/>
            <path d="M19 25H21" stroke="currentColor" strokeWidth="2.0" strokeLinecap="round"/>
            <path d="M19 29H21" stroke="currentColor" strokeWidth="2.0" strokeLinecap="round"/>
            <path d="M27 25H28" stroke="currentColor" strokeWidth="2.0" strokeLinecap="round"/>
            <path d="M27 29H28" stroke="currentColor" strokeWidth="2.0" strokeLinecap="round"/>
          </svg>
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
          <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--ink)', letterSpacing: '-0.4px', lineHeight: '1.1', fontFamily: 'var(--font-display)' }}>
            SMART CITIES
          </span>
          <span style={{ fontSize: '9px', color: '#888780', fontWeight: '600', letterSpacing: '0.05px', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>
            Building Better Tomorrow
          </span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {MAIN_NAV.map(item => <NavRow key={item.path} item={item} />)}
      </nav>

      <div className="sidebar-section-label">ACCOUNT</div>
      <nav className="sidebar-nav">
        {ACCOUNT_NAV.map(item => <NavRow key={item.path} item={item} />)}
        <NavRow item={{ path: '/signout', label: 'Sign Out', icon: 'logout' }} onClick={signOut} />
      </nav>

      <div className="sidebar-cta">
        <div className="sidebar-cta-title">Be a Smart Citizen</div>
        <div className="sidebar-cta-text">Your report can make a big difference!</div>
        <button className="sidebar-cta-btn" onClick={() => navigate('/submit')}>
          Report an Issue <span style={{ marginLeft: 4 }}>→</span>
        </button>
      </div>
    </aside>
  );
}
