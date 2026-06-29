import { useState, useEffect } from 'react';
import indiaStatesDistricts from '../data/indiaStatesDistricts.json';
import api from '../api';

export default function AdminReports() {
  const [wards,   setWards]   = useState([]);
  const [filters, setFilters] = useState({ from: '', to: '', state: '', ward_id: '' });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/admin/wards')
      .then(r => {
        setWards(r.data.wards);
        // Trigger default preview on load
        loadPreview();
      })
      .catch(console.error);
  }, []);

  const setF = (k, v) => {
    setFilters(f => {
      const next = { ...f, [k]: v };
      // If state changes, reset district
      if (k === 'state') next.ward_id = '';
      return next;
    });
  };

  const loadPreview = async () => {
    setLoading(true);
    try {
      const params = { ...filters, page: 1, limit: 15 };
      // Backend expects ward_id (district name) or state
      const r = await api.get('/admin/complaints', { params });
      setPreview(r.data);
    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleExport = async () => {
    const params = new URLSearchParams(
      Object.fromEntries(Object.entries(filters).filter(([,v]) => v))
    );
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/admin/export?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `complaints-report-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filter districts based on selected state
  const availableDistricts = filters.state 
    ? (indiaStatesDistricts[filters.state] || [])
    : [];

  // Calculate statistics for the previewed data
  const calculateStats = () => {
    if (!preview || !preview.complaints) return { total: 0, resolved: 0, rate: 0, avgRating: 0 };
    const complaints = preview.complaints;
    const total = preview.total || complaints.length;
    
    // Since preview is paginated, we approximate or use the count from the database if available
    const resolved = complaints.filter(c => c.status === 'resolved').length;
    const rate = complaints.length > 0 ? Math.round((resolved / complaints.length) * 100) : 0;
    
    const rated = complaints.filter(c => c.rating);
    const avgRating = rated.length > 0 
      ? (rated.reduce((s, c) => s + c.rating, 0) / rated.length).toFixed(1)
      : 'N/A';

    return { total, resolved: preview.complaints.filter(c => c.status === 'resolved').length, rate, avgRating };
  };

  const stats = calculateStats();

  return (
    <div>
      <style>{`
        .report-input, .report-select {
          font-size: 13.5px;
          padding: 10px 14px;
          border-radius: 12px;
          border: 1.5px solid var(--sand-200);
          background: var(--white);
          color: var(--ink);
          outline: none;
          width: 100%;
          transition: all 0.2s ease;
          font-family: var(--font);
          box-sizing: border-box;
        }
        .report-input:focus, .report-select:focus {
          border-color: var(--green-500);
          box-shadow: 0 0 0 3px var(--green-50);
        }
        .report-label {
          font-size: 11px;
          font-weight: 800;
          color: var(--sand-400);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
          display: block;
        }
        .btn-report {
          padding: 10px 20px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          font-family: var(--font);
          display: flex;
          align-items: center;
          gap: 6px;
          border: none;
        }
        .btn-report-primary {
          background: var(--ink);
          color: #fff;
        }
        .btn-report-primary:hover {
          background: #000000;
          transform: translateY(-1px);
        }
        .btn-report-success {
          background: var(--green-500);
          color: #fff;
        }
        .btn-report-success:hover {
          background: var(--green-600);
          transform: translateY(-1px);
        }
        .preview-table-row {
          border-bottom: 1px solid var(--sand-50);
          transition: background 0.15s;
        }
        .preview-table-row:hover {
          background: var(--sand-50);
        }
        .mini-stat-card {
          background: var(--white);
          border: 1.5px solid var(--sand-100);
          border-radius: 16px;
          padding: 16px 20px;
          flex: 1 1 180px;
          box-shadow: var(--shadow-sm);
        }
      `}</style>

      {/* Filter card */}
      <div style={{
        background: 'var(--white)',
        border: '1.5px solid var(--sand-100)',
        borderRadius: '20px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ fontSize: '15px', fontWeight: '900', color: 'var(--ink)', marginBottom: '20px' }}>
          Generate Municipal Report
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div>
            <label className="report-label">State</label>
            <select value={filters.state} onChange={e => setF('state', e.target.value)} className="report-select">
              <option value="">All States</option>
              {Object.keys(indiaStatesDistricts).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="report-label">District</label>
            <select 
              value={filters.ward_id} 
              onChange={e => setF('ward_id', e.target.value)} 
              className="report-select"
              disabled={!filters.state}
              style={{ opacity: filters.state ? 1 : 0.6, cursor: filters.state ? 'pointer' : 'not-allowed' }}
            >
              <option value="">{filters.state ? 'All Districts' : 'Select State First'}</option>
              {availableDistricts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="report-label">From Date</label>
            <input type="date" value={filters.from} onChange={e => setF('from', e.target.value)} className="report-input" />
          </div>
          <div>
            <label className="report-label">To Date</label>
            <input type="date" value={filters.to} onChange={e => setF('to', e.target.value)} className="report-input" />
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={loadPreview} className="btn-report btn-report-primary">
            📊 Preview Report
          </button>
          <button onClick={handleExport} className="btn-report btn-report-success">
            📥 Export CSV
          </button>
        </div>
      </div>

      {/* Analytics Summary Row */}
      {preview && !loading && (
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
          <div className="mini-stat-card" style={{ borderLeft: '4px solid var(--ink)' }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--sand-400)', textTransform: 'uppercase' }}>Period Total</div>
            <div style={{ fontSize: '24px', fontWeight: '900', marginTop: '4px' }}>{stats.total}</div>
            <div style={{ fontSize: '10px', color: 'var(--sand-450)', marginTop: '2px' }}>Complaints filed</div>
          </div>
          
          <div className="mini-stat-card" style={{ borderLeft: '4px solid var(--green-500)' }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--sand-400)', textTransform: 'uppercase' }}>Resolved</div>
            <div style={{ fontSize: '24px', fontWeight: '900', marginTop: '4px', color: 'var(--green-600)' }}>{stats.resolved}</div>
            <div style={{ fontSize: '10px', color: 'var(--sand-450)', marginTop: '2px' }}>Issues closed</div>
          </div>

          <div className="mini-stat-card" style={{ borderLeft: '4px solid #3b82f6' }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--sand-400)', textTransform: 'uppercase' }}>Resolution Rate</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <div style={{ fontSize: '24px', fontWeight: '900', marginTop: '4px', color: '#2563eb' }}>{stats.rate}%</div>
            </div>
            <div style={{ width: '100%', height: '4px', background: 'var(--sand-100)', borderRadius: '2px', marginTop: '6px', overflow: 'hidden' }}>
              <div style={{ width: `${stats.rate}%`, height: '100%', background: '#3b82f6' }} />
            </div>
          </div>

          <div className="mini-stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--sand-400)', textTransform: 'uppercase' }}>Avg Rating</div>
            <div style={{ fontSize: '24px', fontWeight: '900', marginTop: '4px', color: '#d97706' }}>
              {stats.avgRating} <span style={{ fontSize: '16px' }}>⭐</span>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--sand-450)', marginTop: '2px' }}>Citizen feedback</div>
          </div>
        </div>
      )}

      {/* Preview table */}
      {loading && <p style={{ color: 'var(--sand-400)', textAlign: 'center', padding: 48, fontWeight: 'bold' }}>Generating preview...</p>}
      
      {preview && !loading && (
        <div style={{ 
          background: 'var(--white)', 
          border: '1.5px solid var(--sand-100)', 
          borderRadius: '20px', 
          overflow: 'hidden', 
          boxShadow: 'var(--shadow-sm)' 
        }}>
          <div style={{ 
            padding: '20px 24px', 
            borderBottom: '1.5px solid var(--sand-100)', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <span style={{ fontSize: '15px', fontWeight: '900', color: 'var(--ink)' }}>
              Report Preview
            </span>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--sand-400)', background: 'var(--sand-50)', padding: '4px 12px', borderRadius: '12px' }}>
              Showing {preview.complaints?.length || 0} of {preview.total} Records
            </span>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: 'var(--sand-50)', borderBottom: '1.5px solid var(--sand-100)' }}>
                  {['ID','Category','Status','State','District','Citizen','Date','Address'].map(h => (
                    <th key={h} style={{ padding: '12px 20px', textAlign: 'left', color: 'var(--sand-600)', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.complaints && preview.complaints.length > 0 ? (
                  preview.complaints.map(c => (
                    <tr key={c.id} className="preview-table-row">
                      <td style={{ padding: '14px 20px', color: 'var(--sand-400)', fontWeight: '700' }}>#{c.id}</td>
                      <td style={{ padding: '14px 20px', textTransform: 'capitalize', fontWeight: '700' }}>
                        {c.category?.replace(/_/g,' ')}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ textTransform: 'capitalize', fontWeight: '600' }}>
                          {c.status?.replace(/_/g,' ')}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', fontWeight: '600' }}>{c.state || '—'}</td>
                      <td style={{ padding: '14px 20px', fontWeight: '600' }}>{c.ward_name}</td>
                      <td style={{ padding: '14px 20px', fontWeight: '600' }}>{c.citizen_name}</td>
                      <td style={{ padding: '14px 20px', color: 'var(--sand-600)', fontWeight: '600' }}>
                        {new Date(c.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '14px 20px', color: 'var(--sand-500)', fontSize: '12px', minWidth: '200px', maxWidth: '350px', whiteSpace: 'normal', lineHeight: '1.4' }}>
                        {c.address || '—'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} style={{ padding: '40px', textTransform: 'uppercase', fontSize: '11px', fontWeight: '800', color: 'var(--sand-400)', textAlign: 'center', letterSpacing: '1px' }}>
                      No complaints found for the selected filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {preview.complaints && preview.complaints.length > 0 && (
            <div style={{ padding: '16px 24px', borderTop: '1.5px solid var(--sand-100)', display: 'flex', justifyContent: 'flex-end', background: 'var(--sand-50)' }}>
              <button onClick={handleExport} className="btn-report btn-report-success">
                📥 Download Full CSV ({preview.total} Rows)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
