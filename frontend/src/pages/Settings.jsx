import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../components/Toast';

const ToggleRow = ({ label, description, checked, onChange }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--sand-50)' }}>
    <div style={{ flex: 1, paddingRight: '16px' }}>
      <div style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--ink)' }}>{label}</div>
      <div style={{ fontSize: '11.5px', color: 'var(--sand-400)', marginTop: '3px', lineHeight: '1.4' }}>{description}</div>
    </div>
    <div 
      onClick={onChange}
      style={{
        width: '44px',
        height: '24px',
        borderRadius: '12px',
        background: checked ? 'var(--green-500)' : 'var(--sand-200)',
        position: 'relative',
        cursor: 'pointer',
        transition: 'background 0.2s ease',
        flexShrink: 0
      }}
    >
      <div style={{
        width: '18px',
        height: '18px',
        borderRadius: '50%',
        background: '#FFFFFF',
        position: 'absolute',
        top: '3px',
        left: checked ? '23px' : '3px',
        transition: 'left 0.2s ease',
        boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
      }} />
    </div>
  </div>
);

export default function Settings() {
  const navigate = useNavigate();
  
  // Local states for settings
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'en');
  
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  
  const [leaderboardOptIn, setLeaderboardOptIn] = useState(true);
  const [anonymousReporting, setAnonymousReporting] = useState(false);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.body.classList.toggle('dark-theme', newTheme === 'dark');
    showToast(`Switched to ${newTheme} mode!`, 'success');
  };

  const handleSave = () => {
    localStorage.setItem('lang', lang);
    showToast('Settings saved successfully!', 'success');
  };

  return (
    <div className="page" style={{ paddingBottom: 80, background: 'var(--sand-50)', minHeight: '100vh' }}>
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
          Settings
        </div>
      </div>

      <div style={{ padding: '24px 20px', maxWidth: 480, margin: '0 auto', boxSizing: 'border-box' }}>
        
        {/* Appearance & Theme Card */}
        <div style={{
          background: 'var(--white)',
          border: '1.5px solid var(--sand-100)',
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '20px',
          boxShadow: 'var(--shadow-sm)',
          boxSizing: 'border-box'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green-600)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path>
              <circle cx="12" cy="12" r="5"></circle>
            </svg>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--ink)', margin: 0 }}>
              Appearance & Theme
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
            {/* Light Mode Card */}
            <div 
              onClick={() => handleThemeChange('light')}
              style={{
                padding: '16px',
                borderRadius: '16px',
                border: theme === 'light' ? '2.5px solid var(--green-500)' : '1.5px solid var(--sand-100)',
                background: theme === 'light' ? 'var(--green-50)' : 'var(--white)',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s',
                boxSizing: 'border-box'
              }}
            >
              <span style={{ fontSize: '24px' }}>☀️</span>
              <div style={{ fontSize: '13px', fontWeight: '800', marginTop: '6px', color: 'var(--ink)' }}>Light Mode</div>
            </div>

            {/* Dark Mode Card */}
            <div 
              onClick={() => handleThemeChange('dark')}
              style={{
                padding: '16px',
                borderRadius: '16px',
                border: theme === 'dark' ? '2.5px solid var(--green-500)' : '1.5px solid var(--sand-100)',
                background: theme === 'dark' ? 'var(--green-50)' : 'var(--white)',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s',
                boxSizing: 'border-box'
              }}
            >
              <span style={{ fontSize: '24px' }}>🌙</span>
              <div style={{ fontSize: '13px', fontWeight: '800', marginTop: '6px', color: 'var(--ink)' }}>Dark Mode</div>
            </div>
          </div>
        </div>

        {/* Language Selection Card */}
        <div style={{
          background: 'var(--white)',
          border: '1.5px solid var(--sand-100)',
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '20px',
          boxShadow: 'var(--shadow-sm)',
          boxSizing: 'border-box'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green-600)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--ink)', margin: 0 }}>
              Preferred Language
            </h3>
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--sand-500)', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'block', marginBottom: '8px' }}>
              System Language
            </label>
            <select 
              value={lang} 
              onChange={e => setLang(e.target.value)} 
              className="form-input" 
              style={{ width: '100%', boxSizing: 'border-box', height: '42px', padding: '8px 12px', background: 'var(--white)', color: 'var(--ink)', borderColor: 'var(--sand-200)' }}
            >
              <option value="en" style={{ background: 'var(--white)', color: 'var(--ink)' }}>English (US / UK)</option>
              <option value="te" style={{ background: 'var(--white)', color: 'var(--ink)' }}>తెలుగు (Telugu)</option>
              <option value="hi" style={{ background: 'var(--white)', color: 'var(--ink)' }}>हिन्दी (Hindi)</option>
            </select>
          </div>
        </div>

        {/* Notifications Card */}
        <div style={{
          background: 'var(--white)',
          border: '1.5px solid var(--sand-100)',
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '20px',
          boxShadow: 'var(--shadow-sm)',
          boxSizing: 'border-box'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green-600)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--ink)', margin: 0 }}>
              Notification Preferences
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <ToggleRow 
              label="Push Notifications" 
              description="Get instant alerts on your screen when complaints are resolved."
              checked={pushEnabled}
              onChange={() => setPushEnabled(!pushEnabled)}
            />
            <ToggleRow 
              label="Email Alerts" 
              description="Receive weekly summaries and important civic notices in your inbox."
              checked={emailEnabled}
              onChange={() => setEmailEnabled(!emailEnabled)}
            />
            <ToggleRow 
              label="SMS Alerts" 
              description="Receive critical emergency alerts directly to your registered mobile number."
              checked={smsEnabled}
              onChange={() => setSmsEnabled(!smsEnabled)}
            />
          </div>
        </div>

        {/* Privacy & Safety Card */}
        <div style={{
          background: 'var(--white)',
          border: '1.5px solid var(--sand-100)',
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: 'var(--shadow-sm)',
          boxSizing: 'border-box'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green-600)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--ink)', margin: 0 }}>
              Privacy & Safety
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <ToggleRow 
              label="Show on Leaderboard" 
              description="Display your name and points on the public citizen leaderboard."
              checked={leaderboardOptIn}
              onChange={() => setLeaderboardOptIn(!leaderboardOptIn)}
            />
            <ToggleRow 
              label="Anonymous Reporting" 
              description="Hide your name on complaint details. Only assigned officers can view it."
              checked={anonymousReporting}
              onChange={() => setAnonymousReporting(!anonymousReporting)}
            />
          </div>
        </div>

        {/* Save Settings Button */}
        <button 
          className="btn btn-green btn-full" 
          style={{ fontWeight: '800', borderRadius: '16px' }}
          onClick={handleSave}
        >
          Save Settings &amp; Preferences
        </button>
      </div>
    </div>
  );
}
