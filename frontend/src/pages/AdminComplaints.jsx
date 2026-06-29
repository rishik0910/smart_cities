import { useState, useEffect } from 'react';
import StatusBadge from '../components/StatusBadge';
import api from '../api';

const STATUSES   = ['', 'pending', 'assigned', 'in_progress', 'resolved', 'rejected'];
const CATEGORIES = ['', 'garbage_dump', 'missed_pickup', 'overflowing_bin', 'other'];

// Emojis/icons for categories
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

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [wards,      setWards]      = useState([]);
  const [officers,   setOfficers]   = useState([]);
  const [total,      setTotal]      = useState(0);
  const [page,       setPage]       = useState(1);
  const [pages,      setPages]      = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [selected,   setSelected]   = useState(null);
  const [newOfficer, setNewOfficer] = useState('');
  const [filters, setFilters] = useState({
    ward_id: '', status: '', category: '', from: '', to: '',
  });

  const load = (p = 1) => {
    setLoading(true);
    const params = { ...filters, page: p };
    api.get('/admin/complaints', { params })
      .then(r => {
        setComplaints(r.data.complaints);
        setTotal(r.data.total);
        setPage(r.data.page);
        setPages(r.data.pages);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api.get('/admin/wards').then(r => setWards(r.data.wards));
    api.get('/admin/officers').then(r => setOfficers(r.data.officers));
    load(1);
  }, []);

  const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: v }));

  const handleReassign = async () => {
    if (!newOfficer) return;
    await api.patch(`/admin/complaints/${selected.id}/reassign`, { officer_id: newOfficer });
    setSelected(null);
    load(page);
  };

  return (
    <div>
      <style>{`
        .filter-select, .filter-input {
          font-size: 13px;
          padding: 8px 14px;
          border-radius: 10px;
          border: 1.5px solid var(--sand-200);
          background: var(--white);
          color: var(--ink);
          outline: none;
          min-width: 150px;
          transition: all 0.2s ease;
          font-family: var(--font);
        }
        .filter-select:focus, .filter-input:focus {
          border-color: var(--green-500);
          box-shadow: 0 0 0 3px var(--green-50);
        }
        .btn-action {
          padding: 9px 20px;
          border-radius: 10px;
          font-size: 13px;
          fontWeight: 700;
          cursor: pointer;
          transition: all 0.2s;
          font-family: var(--font);
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .btn-primary-action {
          background: var(--green-500);
          color: #fff;
          border: none;
        }
        .btn-primary-action:hover {
          background: var(--green-600);
          transform: translateY(-1px);
        }
        .btn-secondary-action {
          background: none;
          color: var(--sand-600);
          border: 1.5px solid var(--sand-200);
        }
        .btn-secondary-action:hover {
          background: var(--sand-50);
          border-color: var(--sand-300);
          color: var(--ink);
        }
        .complaints-table-row {
          border-bottom: 1px solid var(--sand-50);
          transition: background 0.15s;
        }
        .complaints-table-row:hover {
          background: var(--sand-50);
        }
        .reassign-pill-btn {
          font-size: 12px;
          font-weight: 700;
          padding: 6px 12px;
          border-radius: 8px;
          border: 1.5px solid var(--sand-200);
          background: var(--white);
          cursor: pointer;
          color: var(--sand-600);
          transition: all 0.2s;
        }
        .reassign-pill-btn:hover {
          border-color: var(--green-200);
          background: var(--green-50);
          color: var(--green-600);
        }
      `}</style>

      {/* Filters card */}
      <div style={{
        background: 'var(--white)',
        border: '1.5px solid var(--sand-100)',
        borderRadius: '20px',
        padding: '20px 24px',
        marginBottom: '24px',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        alignItems: 'flex-end',
      }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--sand-400)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>District</div>
          <select className="filter-select" value={filters.ward_id} onChange={e => setFilter('ward_id', e.target.value)}>
            <option value="">All Districts</option>
            {wards.map(w => <option key={w.id} value={w.id}>{w.ward_name}</option>)}
          </select>
        </div>
        <div>
          <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--sand-400)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Status</div>
          <select className="filter-select" value={filters.status} onChange={e => setFilter('status', e.target.value)}>
            {STATUSES.map(s => <option key={s} value={s}>{s ? s.replace(/_/g,' ') : 'All Statuses'}</option>)}
          </select>
        </div>
        <div>
          <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--sand-400)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Category</div>
          <select className="filter-select" value={filters.category} onChange={e => setFilter('category', e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c ? c.replace(/_/g,' ') : 'All Categories'}</option>)}
          </select>
        </div>
        <div>
          <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--sand-400)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>From</div>
          <input className="filter-input" type="date" value={filters.from} onChange={e => setFilter('from', e.target.value)} />
        </div>
        <div>
          <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--sand-400)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>To</div>
          <input className="filter-input" type="date" value={filters.to} onChange={e => setFilter('to', e.target.value)} />
        </div>
        
        <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
          <button onClick={() => load(1)} className="btn-action btn-primary-action">
            🔍 Apply Filters
          </button>
          <button 
            onClick={() => { setFilters({ ward_id:'',status:'',category:'',from:'',to:'' }); load(1); }} 
            className="btn-action btn-secondary-action"
          >
            🧹 Clear
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div style={{ background: 'var(--white)', border: '1.5px solid var(--sand-100)', borderRadius: '20px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1.5px solid var(--sand-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '15px', fontWeight: '900', color: 'var(--ink)' }}>All Complaints</span>
          <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--sand-400)', background: 'var(--sand-50)', padding: '4px 12px', borderRadius: '12px' }}>
            {total} Results
          </span>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--sand-400)', padding: '48px', fontSize: '14px', fontWeight: 'bold' }}>Loading complaints...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid var(--sand-100)', background: 'var(--sand-50)' }}>
                  {['ID','Category','District','Citizen','Officer','Status','Date','Action'].map(h => (
                    <th key={h} style={{ padding: '12px 20px', textAlign: 'left', color: 'var(--sand-600)', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {complaints.map(c => (
                  <tr key={c.id} className="complaints-table-row">
                    <td style={{ padding: '16px 20px', color: 'var(--sand-400)', fontWeight: '700' }}>#{c.id}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}>
                        <span style={{ fontSize: '16px' }}>{CATEGORY_EMOJIS[c.category] || '📋'}</span>
                        <span style={{ textTransform: 'capitalize' }}>{c.category?.replace(/_/g,' ')}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: '600' }}>{c.ward_name || `Ward ${c.ward_id}`}</div>
                      {c.state && <div style={{ fontSize: '11px', color: 'var(--sand-400)', marginTop: '2px' }}>{c.state}</div>}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: '600' }}>{c.citizen_name || 'Anonymous'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--sand-400)', marginTop: '2px' }}>{c.citizen_phone || 'N/A'}</div>
                    </td>
                    <td style={{ padding: '16px 20px', fontWeight: '600', color: c.officer_name ? 'var(--ink)' : 'var(--sand-300)' }}>
                      {c.officer_name || '⚠️ Unassigned'}
                    </td>
                    <td style={{ padding: '16px 20px' }}><StatusBadge status={c.status} /></td>
                    <td style={{ padding: '16px 20px', color: 'var(--sand-600)', fontSize: '12px', fontWeight: '600' }}>
                      {new Date(c.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <button 
                        onClick={() => { setSelected(c); setNewOfficer(''); }} 
                        className="reassign-pill-btn"
                      >
                        Reassign
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div style={{ padding: '16px 24px', display: 'flex', gap: '8px', justifyContent: 'center', borderTop: '1.5px solid var(--sand-100)', background: 'var(--sand-50)' }}>
            {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
              <button 
                key={p} 
                onClick={() => load(p)} 
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  border: '1.5px solid var(--sand-200)',
                  background: p === page ? 'var(--green-500)' : 'var(--white)',
                  color: p === page ? '#ffffff' : 'var(--ink)',
                  boxShadow: p === page ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.15s'
                }}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Reassign modal */}
      {selected && (
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
              Reassign Complaint #{selected.id}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--sand-400)', fontWeight: '600', marginBottom: '20px' }}>
              Current Officer: {selected.officer_name || 'Unassigned'}
            </div>
            
            <select 
              value={newOfficer} 
              onChange={e => setNewOfficer(e.target.value)} 
              className="filter-select"
              style={{ width: '100%', marginBottom: '20px' }}
            >
              <option value="">Select Officer...</option>
              {officers.map(o => <option key={o.id} value={o.id}>{o.name} ({o.phone})</option>)}
            </select>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={handleReassign} 
                disabled={!newOfficer}
                className="btn-action btn-primary-action"
                style={{ flex: 1, justifyContent: 'center', opacity: newOfficer ? 1 : 0.6, cursor: newOfficer ? 'pointer' : 'not-allowed' }}
              >
                Confirm
              </button>
              <button 
                onClick={() => setSelected(null)} 
                className="btn-action btn-secondary-action"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
