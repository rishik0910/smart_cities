import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../components/Toast';
import api, { myRewards, myComplaints } from '../api';
import indiaStatesDistricts from '../data/indiaStatesDistricts.json';

export default function Profile() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [stateName, setStateName] = useState(user.state || '');
  const [district, setDistrict] = useState(user.district || '');
  const [points, setPoints] = useState(0);
  const [reportsCount, setReportsCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });

  const initials = (name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const memberSince = user.created_at 
    ? new Date(user.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    : 'June 2026';

  useEffect(() => {
    myRewards()
      .then(r => setPoints(r.data.points || 0))
      .catch(console.error);

    myComplaints()
      .then(r => setReportsCount(r.data.complaints?.length || 0))
      .catch(console.error);
  }, []);

  const states = Object.keys(indiaStatesDistricts).sort((a, b) => a.localeCompare(b));
  const districts = stateName && indiaStatesDistricts[stateName] 
    ? [...indiaStatesDistricts[stateName]].sort((a, b) => a.localeCompare(b)) 
    : [];

  const handleStateChange = (e) => {
    setStateName(e.target.value);
    setDistrict('');
  };

  const saveProfile = async () => {
    if (!name.trim()) return showToast('Name cannot be empty', 'error');
    setSaving(true);
    try {
      await api.patch('/auth/profile', { name, email, state: stateName, district });
      localStorage.setItem('user', JSON.stringify({ ...user, name, email, state: stateName, district }));
      window.dispatchEvent(new Event('user-updated'));
      showToast('Profile updated!', 'success');
    } catch (err) { showToast(err.response?.data?.error || 'Update failed', 'error'); }
    finally { setSaving(false); }
  };

  const savePassword = async () => {
    if (pwd.next.length < 6) return showToast('Minimum 6 characters', 'error');
    if (pwd.next !== pwd.confirm) return showToast('Passwords do not match', 'error');
    setSaving(true);
    try {
      await api.patch('/auth/password', { currentPassword: pwd.current, newPassword: pwd.next });
      showToast('Password changed!', 'success');
      setPwd({ current: '', next: '', confirm: '' }); setShowPwd(false);
    } catch (err) { showToast(err.response?.data?.error || 'Failed', 'error'); }
    finally { setSaving(false); }
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
          My Profile
        </div>
      </div>

      <div style={{ padding: '24px 20px', maxWidth: 480, margin: '0 auto', boxSizing: 'border-box' }}>
        
        {/* Premium ID Pass Card */}
        <div style={{
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          borderRadius: '24px',
          padding: '30px 24px',
          color: '#FFFFFF',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 12px 24px rgba(16, 185, 129, 0.15)',
          marginBottom: '20px',
          textAlign: 'left'
        }}>
          {/* Decorative background circle */}
          <div style={{
            position: 'absolute', right: '-40px', top: '-40px', width: '160px', height: '160px',
            borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none'
          }} />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', position: 'relative', zIndex: 2 }}>
            {/* Large Avatar */}
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              border: '3px solid #FFFFFF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '28px', fontWeight: '900', color: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              flexShrink: 0
            }}>
              {initials}
            </div>
            
            <div>
              <span style={{
                background: 'rgba(255,255,255,0.2)', color: '#FFFFFF', fontSize: '10px', fontWeight: '800',
                letterSpacing: '1px', textTransform: 'uppercase', padding: '4px 10px', borderRadius: '20px',
                display: 'inline-block', marginBottom: '8px'
              }}>
                {user.role || 'Citizen'} Pass
              </span>
              <h2 style={{ fontSize: '22px', fontWeight: '900', margin: 0, letterSpacing: '-0.5px', lineHeight: '1.2' }}>
                {user.name}
              </h2>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', marginTop: '4px', fontFamily: 'var(--mono)' }}>
                {user.phone}
              </div>
            </div>
          </div>
        </div>

        {/* Citizen Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '12px',
          marginBottom: '24px'
        }}>
          <div style={{ background: 'var(--white)', border: '1.5px solid var(--sand-100)', borderRadius: '16px', padding: '14px', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--sand-400)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reports</div>
            <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--ink)', marginTop: '4px' }}>{reportsCount}</div>
          </div>
          <div style={{ background: 'var(--white)', border: '1.5px solid var(--sand-100)', borderRadius: '16px', padding: '14px', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--sand-400)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Points</div>
            <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--green-600)', marginTop: '4px' }}>{points}</div>
          </div>
          <div style={{ background: 'var(--white)', border: '1.5px solid var(--sand-100)', borderRadius: '16px', padding: '14px', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--sand-400)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Joined</div>
            <div style={{ fontSize: '13px', fontWeight: '900', color: 'var(--ink)', marginTop: '6px' }}>{memberSince}</div>
          </div>
        </div>

        {/* Personal Details Card */}
        <div style={{
          background: 'var(--white)',
          border: '1.5px solid var(--sand-100)',
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '20px',
          boxShadow: 'var(--shadow-sm)',
          boxSizing: 'border-box'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green-600)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--ink)', margin: 0 }}>
              Personal Details
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--sand-500)', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'block', marginBottom: '6px' }}>
                Full Name
              </label>
              <input 
                className="form-input" 
                value={name} 
                onChange={e => setName(e.target.value)}
                placeholder="Your full name" 
                style={{ width: '100%', boxSizing: 'border-box', background: 'var(--white)', color: 'var(--ink)', borderColor: 'var(--sand-200)' }} 
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--sand-500)', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'block', marginBottom: '6px' }}>
                Email Address
              </label>
              <input 
                className="form-input" 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" 
                style={{ width: '100%', boxSizing: 'border-box', background: 'var(--white)', color: 'var(--ink)', borderColor: 'var(--sand-200)' }} 
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--sand-500)', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'block', marginBottom: '6px' }}>
                  State / UT
                </label>
                <select 
                  value={stateName} 
                  onChange={handleStateChange} 
                  className="form-input" 
                  style={{ width: '100%', boxSizing: 'border-box', height: '42px', padding: '8px 12px', background: 'var(--white)', color: 'var(--ink)', borderColor: 'var(--sand-200)' }}
                >
                  <option value="" style={{ background: 'var(--white)', color: 'var(--ink)' }}>Select State</option>
                  {states.map(s => <option key={s} value={s} style={{ background: 'var(--white)', color: 'var(--ink)' }}>{s}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--sand-500)', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'block', marginBottom: '6px' }}>
                  District
                </label>
                <select 
                  value={district} 
                  onChange={e => setDistrict(e.target.value)} 
                  disabled={!stateName}
                  className="form-input" 
                  style={{ width: '100%', boxSizing: 'border-box', height: '42px', padding: '8px 12px', background: 'var(--white)', color: 'var(--ink)', borderColor: 'var(--sand-200)' }}
                >
                  <option value="" style={{ background: 'var(--white)', color: 'var(--ink)' }}>Select District</option>
                  {districts.map(d => <option key={d} value={d} style={{ background: 'var(--white)', color: 'var(--ink)' }}>{d}</option>)}
                </select>
              </div>
            </div>

            <button 
              className="btn btn-green btn-md" 
              style={{ width: '100%', marginTop: '8px', fontWeight: '700', borderRadius: '12px' }}
              onClick={saveProfile} 
              disabled={saving}
            >
              {saving ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </div>
        </div>

        {/* Security & Password Card */}
        <div style={{
          background: 'var(--white)',
          border: '1.5px solid var(--sand-100)',
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: 'var(--shadow-sm)',
          boxSizing: 'border-box'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green-600)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--ink)', margin: 0 }}>
                Security & Password
              </h3>
            </div>
            
            <button 
              onClick={() => setShowPwd(s => !s)} 
              style={{
                background: 'none', border: 'none',
                fontSize: '13px', fontWeight: '800', color: 'var(--green-600)', cursor: 'pointer',
                fontFamily: 'var(--font)'
              }}
            >
              {showPwd ? 'Cancel' : 'Update →'}
            </button>
          </div>

          {showPwd && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '20px' }}>
              {[
                { k: 'current', ph: 'Current password' },
                { k: 'next', ph: 'New password (min 6 chars)' },
                { k: 'confirm', ph: 'Confirm new password' },
              ].map(f => (
                <input 
                  key={f.k} 
                  type="password" 
                  className="form-input" 
                  placeholder={f.ph}
                  value={pwd[f.k]} 
                  onChange={e => setPwd(p => ({ ...p, [f.k]: e.target.value }))}
                  style={{ width: '100%', boxSizing: 'border-box', background: 'var(--white)', color: 'var(--ink)', borderColor: 'var(--sand-200)' }} 
                />
              ))}
              
              <button 
                className="btn btn-primary btn-md" 
                style={{ width: '100%', fontWeight: '700', borderRadius: '12px' }}
                onClick={savePassword} 
                disabled={saving}
              >
                {saving ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          )}
        </div>

        {/* Sign Out Row */}
        <button style={{
          width: '100%', 
          padding: '14px', 
          borderRadius: '16px',
          background: 'var(--danger-bg)', 
          color: 'var(--danger-text)', 
          border: '1.5px solid var(--danger-bg)',
          fontSize: '14px', 
          fontWeight: '800', 
          cursor: 'pointer', 
          fontFamily: 'var(--font)',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          onClick={() => { localStorage.clear(); navigate('/login'); }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Sign Out of Account
        </button>
      </div>
    </div>
  );
}