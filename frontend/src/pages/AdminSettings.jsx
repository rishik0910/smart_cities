import { useState, useEffect } from 'react';
import api from '../api';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    points_complaint_submitted: 50,
    points_vote_recorded: 10,
    sla_garbage_dump: 3,
    sla_missed_pickup: 2,
    sla_overflowing_bin: 2,
    sla_other: 5
  });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState('');
  const [error,   setError]   = useState('');

  useEffect(() => {
    api.get('/admin/settings')
      .then(r => setSettings(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (k, v) => {
    setSettings(s => ({ ...s, [k]: parseInt(v) || 0 }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');
    try {
      await api.post('/admin/settings', settings);
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p style={{ color: 'var(--sand-400)', textAlign: 'center', padding: 48, fontWeight: 'bold' }}>Loading settings...</p>;

  return (
    <div>
      <style>{`
        .settings-card {
          background: var(--white);
          border: 1.5px solid var(--sand-100);
          border-radius: 20px;
          padding: 24px;
          box-shadow: var(--shadow-sm);
          flex: 1;
        }
        .settings-input {
          width: 100%;
          font-size: 14px;
          padding: 10px 14px;
          border-radius: 12px;
          border: 1.5px solid var(--sand-200);
          background: var(--white);
          color: var(--ink);
          outline: none;
          margin-top: 6px;
          transition: all 0.2s;
          font-family: var(--font);
          box-sizing: border-box;
        }
        .settings-input:focus {
          border-color: var(--green-500);
          box-shadow: 0 0 0 3px var(--green-50);
        }
        .settings-group {
          margin-bottom: 20px;
        }
        .settings-group-title {
          font-size: 11px;
          font-weight: 800;
          color: var(--sand-400);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .btn-save-settings {
          background: var(--green-500);
          color: #fff;
          border: none;
          padding: 12px 24px;
          border-radius: 12px;
          font-size: 13.5px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          font-family: var(--font);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .btn-save-settings:hover {
          background: var(--green-600);
          transform: translateY(-1px);
        }
      `}</style>

      {success && (
        <div style={{ background: 'var(--green-50)', color: 'var(--green-600)', padding: '12px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: '700', marginBottom: '24px', animation: 'slideDown 0.2s' }}>
          ✓ {success}
        </div>
      )}
      {error && (
        <div style={{ background: 'var(--danger-bg)', color: 'var(--danger-text)', padding: '12px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: '700', marginBottom: '24px', animation: 'slideDown 0.2s' }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '24px' }}>
          
          {/* Rewards Card */}
          <div className="settings-card">
            <div style={{ fontSize: '16px', fontWeight: '900', color: 'var(--ink)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🎁 Citizen Rewards System
            </div>
            
            <div className="settings-group">
              <label className="settings-group-title">Points for Complaint Submission</label>
              <input 
                type="number" 
                value={settings.points_complaint_submitted} 
                onChange={e => handleChange('points_complaint_submitted', e.target.value)}
                className="settings-input"
              />
              <div style={{ fontSize: '11px', color: 'var(--sand-400)', marginTop: '4px' }}>
                Points awarded to citizens when they submit a new verified complaint.
              </div>
            </div>

            <div className="settings-group">
              <label className="settings-group-title">Points for Upvoting</label>
              <input 
                type="number" 
                value={settings.points_vote_recorded} 
                onChange={e => handleChange('points_vote_recorded', e.target.value)}
                className="settings-input"
              />
              <div style={{ fontSize: '11px', color: 'var(--sand-400)', marginTop: '4px' }}>
                Points awarded to citizens for upvoting and validating others' complaints.
              </div>
            </div>
          </div>

          {/* SLA Card */}
          <div className="settings-card">
            <div style={{ fontSize: '16px', fontWeight: '900', color: 'var(--ink)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⏱️ Service Level Agreements (SLAs)
            </div>
            
            <div className="settings-group">
              <label className="settings-group-title">Garbage Dump Resolution SLA (Days)</label>
              <input 
                type="number" 
                value={settings.sla_garbage_dump} 
                onChange={e => handleChange('sla_garbage_dump', e.target.value)}
                className="settings-input"
              />
            </div>

            <div className="settings-group">
              <label className="settings-group-title">Missed Pickup Resolution SLA (Days)</label>
              <input 
                type="number" 
                value={settings.sla_missed_pickup} 
                onChange={e => handleChange('sla_missed_pickup', e.target.value)}
                className="settings-input"
              />
            </div>

            <div className="settings-group">
              <label className="settings-group-title">Overflowing Bin Resolution SLA (Days)</label>
              <input 
                type="number" 
                value={settings.sla_overflowing_bin} 
                onChange={e => handleChange('sla_overflowing_bin', e.target.value)}
                className="settings-input"
              />
            </div>

            <div className="settings-group">
              <label className="settings-group-title">Other Categories Resolution SLA (Days)</label>
              <input 
                type="number" 
                value={settings.sla_other} 
                onChange={e => handleChange('sla_other', e.target.value)}
                className="settings-input"
              />
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-save-settings">
          {saving ? 'Saving...' : '💾 Save Settings'}
        </button>
      </form>
    </div>
  );
}
