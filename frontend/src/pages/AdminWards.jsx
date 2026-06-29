import { useState, useEffect } from 'react';
import indiaStatesDistricts from '../data/indiaStatesDistricts.json';
import api from '../api';

export default function AdminWards() {
  const [wards,    setWards]    = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [editing,  setEditing]  = useState(null);
  const [picked,   setPicked]   = useState('');
  
  // Filters
  const [selectedState, setSelectedState] = useState('');
  const [searchTerm,    setSearchTerm]    = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([api.get('/admin/wards'), api.get('/admin/officers')])
      .then(([w, o]) => { setWards(w.data.wards); setOfficers(o.data.officers); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleAssign = async () => {
    if (!picked) return;
    await api.patch(`/admin/wards/${editing.id}/officer`, { officer_id: picked });
    setEditing(null);
    load();
  };

  const filteredWards = wards.filter(w => {
    const matchesState = !selectedState || w.state === selectedState;
    const matchesSearch = !searchTerm || w.ward_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesState && matchesSearch;
  });

  const shouldShowPlaceholder = !selectedState && !searchTerm && filteredWards.length > 40;

  if (loading) return <p style={{ color: 'var(--sand-400)', textAlign: 'center', padding: 48, fontWeight: 'bold' }}>Loading districts...</p>;

  return (
    <div>
      <style>{`
        .district-card {
          background: var(--white);
          border: 1.5px solid var(--sand-100);
          border-radius: 20px;
          padding: 24px;
          box-shadow: var(--shadow-sm);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
        }
        .district-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
          border-color: var(--sand-200);
        }
        .assign-btn {
          width: 100%;
          margin-top: 16px;
          padding: 10px;
          border-radius: 12px;
          border: 1.5px solid var(--sand-200);
          background: var(--white);
          font-size: 13px;
          font-weight: 700;
          color: var(--sand-600);
          cursor: pointer;
          transition: all 0.2s;
          font-family: var(--font);
        }
        .assign-btn:hover {
          border-color: var(--green-200);
          background: var(--green-50);
          color: var(--green-600);
        }
        .modal-select {
          width: 100%;
          font-size: 13.5px;
          padding: 10px 14px;
          border-radius: 12px;
          border: 1.5px solid var(--sand-200);
          background: var(--white);
          color: var(--ink);
          outline: none;
          margin-bottom: 20px;
          transition: all 0.2s;
          font-family: var(--font);
          box-sizing: border-box;
        }
        .modal-select:focus {
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
        }
        .btn-modal-primary {
          background: var(--green-500);
          color: #fff;
          border: none;
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
      `}</style>

      {/* Filters Bar */}
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
        <div style={{ minWidth: '200px' }}>
          <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--sand-400)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Filter by State</div>
          <select 
            value={selectedState} 
            onChange={e => { setSelectedState(e.target.value); setSearchTerm(''); }}
            className="modal-select"
            style={{ margin: 0 }}
          >
            <option value="">All States ({Object.keys(indiaStatesDistricts).length})</option>
            {Object.keys(indiaStatesDistricts).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--sand-400)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Search District</div>
          <input 
            type="text" 
            placeholder="Search district name... (e.g. Panaji, Wayanad, Warangal)"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="modal-select"
            style={{ margin: 0 }}
          />
        </div>
      </div>

      {shouldShowPlaceholder ? (
        /* Placeholder to prevent rendering 780 cards at once */
        <div style={{
          background: 'var(--white)',
          border: '1.5px solid var(--sand-100)',
          borderRadius: '20px',
          padding: '64px 32px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '48px', animation: 'bounce 2s infinite' }}>🗺️</span>
          <h3 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--ink)', marginTop: '16px' }}>
            Select a State or Search a District
          </h3>
          <p style={{ color: 'var(--sand-400)', fontSize: '13.5px', marginTop: '8px', maxWidth: '440px', lineHeight: '1.5' }}>
            To maintain high performance and easily navigate India's <strong>{wards.length} districts</strong>, please select a state from the dropdown or type a district name above.
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '24px', maxWidth: '600px' }}>
            {['Telangana', 'Goa', 'Kerala', 'Delhi', 'Maharashtra'].map(s => (
              <button
                key={s}
                onClick={() => setSelectedState(s)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: '1.5px solid var(--sand-200)',
                  background: 'var(--white)',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: 'var(--sand-600)',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--green-500)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--sand-200)'}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Districts Grid */
        <div>
          <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--sand-400)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '20px' }}>
            District Management — {filteredWards.length} Districts Found
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {filteredWards.map(w => {
              const openCount = parseInt(w.open_count) || 0;
              let badgeBg = 'var(--green-50)';
              let badgeColor = 'var(--green-600)';
              let badgeText = '✓ Healthy';
              
              if (openCount > 10) {
                badgeBg = 'var(--danger-bg)';
                badgeColor = 'var(--danger-text)';
                badgeText = '🚨 Critical';
              } else if (openCount > 0) {
                badgeBg = 'var(--warn-bg)';
                badgeColor = 'var(--warn-text)';
                badgeText = '⏳ Monitoring';
              }

              return (
                <div key={w.id} className="district-card">
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <div style={{ fontSize: '17px', fontWeight: '900', color: 'var(--ink)' }}>{w.ward_name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--sand-400)', fontWeight: '700', marginTop: '2px' }}>
                        State: {w.state || 'Unknown'}
                      </div>
                    </div>
                    <div style={{
                      background: badgeBg,
                      color: badgeColor,
                      fontSize: '11px',
                      fontWeight: '800',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {badgeText}
                    </div>
                  </div>

                  {/* Stats Counters */}
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <div style={{ flex: 1, textAlign: 'center', background: 'var(--sand-50)', border: '1px solid var(--sand-100)', borderRadius: '12px', padding: '10px 0' }}>
                      <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--ink)' }}>{w.total_count}</div>
                      <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--sand-400)', textTransform: 'uppercase', marginTop: '2px' }}>Total</div>
                    </div>
                    <div style={{ flex: 1, textAlign: 'center', background: 'var(--sand-50)', border: '1px solid var(--sand-100)', borderRadius: '12px', padding: '10px 0' }}>
                      <div style={{ fontSize: '18px', fontWeight: '900', color: openCount > 0 ? badgeColor : 'var(--ink)' }}>{openCount}</div>
                      <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--sand-400)', textTransform: 'uppercase', marginTop: '2px' }}>Open</div>
                    </div>
                  </div>

                  {/* Officer Details */}
                  <div style={{ 
                    marginTop: 'auto',
                    paddingTop: '16px', 
                    borderTop: '1.5px solid var(--sand-50)',
                  }}>
                    <div style={{ fontSize: '10px', fontWeight: '800', color: 'var(--sand-400)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                      Assigned Ward Officer
                    </div>
                    {w.officer_name ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '50%',
                          background: 'var(--green-50)', color: 'var(--green-600)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: '800', fontSize: '12px'
                        }}>
                          {w.officer_name[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--ink)' }}>
                            {w.officer_name}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--sand-400)', marginTop: '1px' }}>
                            📞 {w.officer_phone}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ 
                        display: 'flex', alignItems: 'center', gap: '8px',
                        background: 'var(--warn-bg)', color: 'var(--warn-text)',
                        padding: '8px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: '700'
                      }}>
                        ⚠️ No Officer Assigned
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={() => { setEditing(w); setPicked(w.officer_id || ''); }} 
                    className="assign-btn"
                  >
                    {w.officer_name ? 'Change Officer' : 'Assign Officer'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Assign officer modal */}
      {editing && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(20, 20, 16, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000,
        }}>
          <div style={{ 
            background: 'var(--white)', 
            borderRadius: '20px', 
            padding: '24px', 
            width: '360px', 
            border: '1.5px solid var(--sand-100)',
            boxShadow: 'var(--shadow-md)' 
          }}>
            <div style={{ fontSize: '17px', fontWeight: '900', color: 'var(--ink)', marginBottom: '4px' }}>
              Assign Officer to {editing.ward_name}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--sand-400)', fontWeight: '600', marginBottom: '20px' }}>
              Current Officer: {editing.officer_name || 'None'}
            </div>
            
            <select 
              value={picked} 
              onChange={e => setPicked(e.target.value)} 
              className="modal-select"
            >
              <option value="">Select Officer...</option>
              {officers.map(o => (
                <option key={o.id} value={o.id}>{o.name} ({o.phone})</option>
              ))}
            </select>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleAssign} className="btn-modal btn-modal-primary">
                Assign
              </button>
              <button onClick={() => setEditing(null)} className="btn-modal btn-modal-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
