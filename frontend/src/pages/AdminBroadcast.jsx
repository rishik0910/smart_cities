import { useState } from 'react';
import api from '../api';

export default function AdminBroadcast() {
  const [message, setMessage] = useState('');
  const [target,  setTarget]  = useState('all');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [history, setHistory] = useState([
    { id: 1, message: '🚨 Heavy rainfall expected in Hyderabad over the next 24 hours. Citizens are advised to avoid waterlogged underpasses.', target: 'citizens', date: '28 Jun 2026, 09:15 AM' },
    { id: 2, message: '🚛 Notice: Municipal waste pickup in Goa will be delayed by 1 day due to the public holiday.', target: 'all', date: '25 Jun 2026, 04:30 PM' },
    { id: 3, message: '📋 Training Session: All Ward Officers must attend the online portal training at 11:00 AM tomorrow.', target: 'officers', date: '20 Jun 2026, 02:00 PM' }
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!message.trim()) {
      setError('Message cannot be empty');
      return;
    }
    setLoading(true);
    try {
      const r = await api.post('/admin/broadcast', { message, target });
      setSuccess(r.data.message || 'Broadcast alert sent successfully!');
      
      // Add to local history
      setHistory(prev => [
        {
          id: Date.now(),
          message,
          target,
          date: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
        },
        ...prev
      ]);
      setMessage('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send broadcast');
    } finally {
      setLoading(false);
    }
  };

  const getTargetBadgeColor = (t) => {
    if (t === 'all') return { bg: 'var(--green-50)', color: 'var(--green-600)' };
    if (t === 'officers') return { bg: '#eff6ff', color: '#1d4ed8' };
    return { bg: '#fffbeb', color: '#b45309' };
  };

  return (
    <div>
      <style>{`
        .broadcast-card {
          background: var(--white);
          border: 1.5px solid var(--sand-100);
          border-radius: 20px;
          padding: 24px;
          box-shadow: var(--shadow-sm);
          margin-bottom: 24px;
        }
        .broadcast-textarea {
          width: 100%;
          height: 100px;
          font-size: 14px;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1.5px solid var(--sand-200);
          background: var(--white);
          color: var(--ink);
          outline: none;
          resize: none;
          font-family: var(--font);
          box-sizing: border-box;
          transition: all 0.2s;
        }
        .broadcast-textarea:focus {
          border-color: var(--green-500);
          box-shadow: 0 0 0 3px var(--green-50);
        }
        .target-label {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 10px;
          border: 1.5px solid var(--sand-200);
          cursor: pointer;
          font-size: 13px;
          font-weight: 700;
          transition: all 0.15s;
          user-select: none;
          background: var(--white);
        }
        .target-radio:checked + .target-label {
          border-color: var(--green-500);
          background: var(--green-50);
          color: var(--green-600);
        }
        .btn-broadcast {
          background: var(--ink);
          color: #fff;
          border: none;
          padding: 12px 24px;
          border-radius: 12px;
          font-size: 13.5px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 16px;
        }
        .btn-broadcast:hover {
          background: #000000;
          transform: translateY(-1px);
        }
        .history-item {
          background: var(--white);
          border: 1.5px solid var(--sand-100);
          border-radius: 16px;
          padding: 18px;
          margin-bottom: 12px;
          transition: border-color 0.2s;
        }
        .history-item:hover {
          border-color: var(--sand-200);
        }
      `}</style>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Composer Card */}
        <div className="broadcast-card">
          <div style={{ fontSize: '15px', fontWeight: '900', color: 'var(--ink)', marginBottom: '16px' }}>
            Compose Announcement
          </div>

          {error && (
            <div style={{ background: 'var(--danger-bg)', color: 'var(--danger-text)', padding: '10px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: '700', marginBottom: '16px' }}>
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div style={{ background: 'var(--green-50)', color: 'var(--green-600)', padding: '10px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: '700', marginBottom: '16px' }}>
              ✓ {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <textarea 
              value={message}
              onChange={e => setMessage(e.target.value.slice(0, 160))}
              placeholder="Type your emergency alert or announcement here..."
              className="broadcast-textarea"
            />
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '11px', color: 'var(--sand-400)', fontWeight: '700', marginTop: '4px' }}>
              {message.length}/160 Characters (SMS Limit)
            </div>

            {/* Target Selector */}
            <div style={{ marginTop: '20px' }}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--sand-400)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                Target Audience
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {[
                  { id: 'all', label: 'All Users', icon: '🌍' },
                  { id: 'officers', label: 'Officers Only', icon: '👥' },
                  { id: 'citizens', label: 'Citizens Only', icon: '👤' }
                ].map(t => (
                  <div key={t.id} style={{ position: 'relative' }}>
                    <input 
                      type="radio" 
                      id={`target-${t.id}`}
                      name="broadcast-target" 
                      value={t.id} 
                      checked={target === t.id}
                      onChange={() => setTarget(t.id)}
                      className="target-radio"
                      style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                    />
                    <label htmlFor={`target-${t.id}`} className="target-label">
                      <span>{t.icon}</span> {t.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-broadcast">
              {loading ? 'Sending...' : '📢 Send Broadcast'}
            </button>
          </form>
        </div>

        {/* History Card */}
        <div>
          <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--sand-400)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>
            Broadcast History
          </div>
          
          {history.map(h => {
            const badge = getTargetBadgeColor(h.target);
            return (
              <div key={h.id} className="history-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: badge.bg,
                    color: badge.color
                  }}>
                    {h.target === 'all' ? '🌍 Everyone' : h.target === 'officers' ? '👥 Officers' : '👤 Citizens'}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--sand-400)', fontWeight: '700' }}>
                    {h.date}
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--ink)', lineHeight: '1.45', fontWeight: '600', margin: 0 }}>
                  {h.message}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
