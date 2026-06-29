import { useState, useEffect } from 'react';
import api from '../api';

export default function AdminOfficers() {
  const [officers, setOfficers] = useState([]);
  const [wards,    setWards]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showAdd,  setShowAdd]  = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', password: '' });
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([api.get('/admin/officers'), api.get('/admin/wards')])
      .then(([o, w]) => {
        setOfficers(o.data.officers || []);
        setWards(w.data.wards || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!formData.name || !formData.phone || !formData.password) {
      setError('All fields are required');
      return;
    }
    try {
      await api.post('/admin/officers', formData);
      setSuccess('Officer registered successfully!');
      setFormData({ name: '', phone: '', password: '' });
      setTimeout(() => setShowAdd(false), 1200);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create officer');
    }
  };

  // Helper to find which wards are assigned to an officer
  const getAssignedWards = (officerId) => {
    return wards.filter(w => w.officer_id === officerId).map(w => w.ward_name);
  };

  if (loading) return <p style={{ color: 'var(--sand-400)', textAlign: 'center', padding: 48, fontWeight: 'bold' }}>Loading officers...</p>;

  return (
    <div>
      <style>{`
        .officer-card {
          background: var(--white);
          border: 1.5px solid var(--sand-100);
          border-radius: 20px;
          padding: 24px;
          box-shadow: var(--shadow-sm);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          position: relative;
        }
        .officer-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
          border-color: var(--sand-200);
        }
        .btn-add-officer {
          background: var(--green-500);
          color: #fff;
          border: none;
          padding: 10px 20px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          font-family: var(--font);
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .btn-add-officer:hover {
          background: var(--green-600);
          transform: translateY(-1px);
        }
        .form-input {
          width: 100%;
          font-size: 13.5px;
          padding: 10px 14px;
          border-radius: 12px;
          border: 1.5px solid var(--sand-200);
          background: var(--white);
          color: var(--ink);
          outline: none;
          margin-bottom: 16px;
          transition: all 0.2s;
          font-family: var(--font);
          box-sizing: border-box;
        }
        .form-input:focus {
          border-color: var(--green-500);
          box-shadow: 0 0 0 3px var(--green-50);
        }
        .btn-modal {
          padding: 10px 20px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          font-family: var(--font);
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
        }
        .btn-modal-primary {
          background: var(--green-500);
          color: #fff;
        }
        .btn-modal-primary:hover {
          background: var(--green-600);
        }
        .btn-modal-secondary {
          background: none;
          border: 1.5px solid var(--sand-200);
          color: var(--sand-600);
        }
        .btn-modal-secondary:hover {
          background: var(--sand-50);
          color: var(--ink);
        }
        .ward-tag {
          font-size: 11px;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 6px;
          background: var(--sand-50);
          color: var(--sand-600);
          border: 1px solid var(--sand-150);
        }
      `}</style>

      {/* Header bar with Add button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--sand-400)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Ward Officers Directory — {officers.length} Active Staff
        </div>
        <button onClick={() => { setShowAdd(true); setError(''); setSuccess(''); }} className="btn-add-officer">
          ➕ Register New Officer
        </button>
      </div>

      {/* Officers Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {officers.map(o => {
          const assigned = getAssignedWards(o.id);
          return (
            <div key={o.id} className="officer-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '50%',
                  background: 'var(--green-50)', color: 'var(--green-600)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '900', fontSize: '16px', border: '1.5px solid var(--green-100)'
                }}>
                  {o.name ? o.name[0].toUpperCase() : 'U'}
                </div>
                <div>
                  <div style={{ fontSize: '15.5px', fontWeight: '900', color: 'var(--ink)' }}>{o.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--sand-400)', fontWeight: '700', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Ward Officer
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '13px', color: 'var(--sand-600)', marginBottom: '16px', fontWeight: '600' }}>
                📞 Phone: {o.phone}
              </div>

              <div style={{ borderTop: '1.5px solid var(--sand-50)', paddingTop: '14px', marginTop: 'auto' }}>
                <div style={{ fontSize: '10px', fontWeight: '800', color: 'var(--sand-400)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                  Assigned Districts ({assigned.length})
                </div>
                {assigned.length > 0 ? (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {assigned.slice(0, 4).map(wName => (
                      <span key={wName} className="ward-tag">{wName}</span>
                    ))}
                    {assigned.length > 4 && (
                      <span className="ward-tag" style={{ background: 'var(--green-50)', color: 'var(--green-600)', borderColor: 'var(--green-100)' }}>
                        +{assigned.length - 4} More
                      </span>
                    )}
                  </div>
                ) : (
                  <div style={{ fontSize: '11.5px', color: 'var(--sand-300)', fontWeight: '700', fontStyle: 'italic' }}>
                    No districts currently assigned
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Officer Modal */}
      {showAdd && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(20, 20, 16, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000,
        }}>
          <form onSubmit={handleSubmit} style={{ 
            background: 'var(--white)', 
            borderRadius: '20px', 
            padding: '24px', 
            width: '360px', 
            border: '1.5px solid var(--sand-100)',
            boxShadow: 'var(--shadow-md)' 
          }}>
            <div style={{ fontSize: '17px', fontWeight: '900', color: 'var(--ink)', marginBottom: '16px' }}>
              Register New Ward Officer
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

            <input 
              type="text" 
              placeholder="Officer Full Name"
              value={formData.name}
              onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
              className="form-input"
            />
            <input 
              type="tel" 
              placeholder="Phone Number"
              value={formData.phone}
              onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))}
              className="form-input"
            />
            <input 
              type="password" 
              placeholder="Create Password"
              value={formData.password}
              onChange={e => setFormData(f => ({ ...f, password: e.target.value }))}
              className="form-input"
            />

            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button type="submit" className="btn-modal btn-modal-primary">
                Register
              </button>
              <button type="button" onClick={() => setShowAdd(false)} className="btn-modal btn-modal-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
