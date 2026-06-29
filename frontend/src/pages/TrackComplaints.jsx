import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ComplaintCard from '../components/ComplaintCard';
import SkeletonCard from '../components/SkeletonCard';
import { myComplaints } from '../api';

const FILTERS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'In progress', value: 'in_progress' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Rejected', value: 'rejected' },
];

export default function TrackComplaints() {
  const [all, setAll]         = useState([]);
  const [filter, setFilter]   = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    myComplaints()
      .then(r => setAll(r.data.complaints))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const pendingCount = all.filter(c => c.status === 'pending').length;
  const inProgressCount = all.filter(c => c.status === 'in_progress' || c.status === 'assigned').length;
  const resolvedCount = all.filter(c => c.status === 'resolved').length;

  const shown = filter 
    ? all.filter(c => c.status === filter || (filter === 'in_progress' && c.status === 'assigned')) 
    : all;

  return (
    <div className="page" style={{ background: '#F8F9FA', minHeight: '100vh', padding: 0 }}>
      {/* Topbar */}
      <div className="topbar" style={{
        background: '#FFFFFF', borderBottom: '1px solid var(--sand-100)', padding: '16px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button className="back-btn" onClick={() => navigate('/home')}
            style={{ 
              transition: 'transform 0.2s ease', background: '#F1F5F9', border: 'none',
              width: '36px', height: '36px', borderRadius: '50%', display: 'flex',
              alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateX(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}>
            ←
          </button>
          <div className="topbar-title" style={{ fontSize: '20px', fontWeight: '900', color: 'var(--ink)', letterSpacing: '-0.4px' }}>
            My complaints
          </div>
        </div>
        <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--sand-600)' }}>
          {all.length} total reports
        </span>
      </div>

      {/* Stats Overview */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px',
        padding: '20px 24px', background: '#FFFFFF', borderBottom: '1px solid var(--sand-100)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
      }}>
        {[
          { label: 'Pending', count: pendingCount, color: '#F59E0B', bg: '#FFFBEB', value: 'pending' },
          { label: 'In Progress', count: inProgressCount, color: '#2563EB', bg: '#EFF6FF', value: 'in_progress' },
          { label: 'Resolved', count: resolvedCount, color: '#10B981', bg: '#F0FDF4', value: 'resolved' }
        ].map(stat => {
          const isActive = filter === stat.value || (filter === 'assigned' && stat.value === 'in_progress');
          return (
            <div
              key={stat.label}
              onClick={() => setFilter(isActive ? '' : stat.value)}
              style={{
                background: stat.bg, 
                border: `2px solid ${isActive ? stat.color : 'transparent'}`,
                borderRadius: '16px', 
                padding: '16px 20px', 
                cursor: 'pointer',
                transition: 'all 0.25s ease', 
                transform: isActive ? 'scale(1.03)' : 'scale(1)',
                boxShadow: isActive ? '0 8px 16px rgba(0,0,0,0.06)' : '0 2px 8px rgba(0,0,0,0.02)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.06)';
                e.currentTarget.style.transform = isActive ? 'scale(1.03) translateY(-2px)' : 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = isActive ? '0 8px 16px rgba(0,0,0,0.06)' : '0 2px 8px rgba(0,0,0,0.02)';
                e.currentTarget.style.transform = isActive ? 'scale(1.03)' : 'scale(1)';
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--sand-600)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                {stat.label}
              </div>
              <div style={{ fontSize: '26px', fontWeight: '900', color: stat.color, marginTop: '6px', display: 'flex', alignItems: 'baseline', gap: '4px', fontFamily: 'var(--font-display)' }}>
                {stat.count}
                <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--sand-400)', textTransform: 'lowercase' }}>items</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter chips */}
      <div style={{ 
        display: 'flex', gap: 8, padding: '14px 24px', overflowX: 'auto',
        borderBottom: '1px solid var(--sand-100)', background: '#FFFFFF',
        alignItems: 'center'
      }}>
        <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--sand-400)', marginRight: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Filter:
        </span>
        {FILTERS.map((f, i) => (
          <button key={f.value} className="filter-chip-btn"
            onClick={() => setFilter(f.value)}
            style={{
              fontFamily: 'var(--font)', fontSize: '11.5px', fontWeight: '700',
              padding: '6px 16px', borderRadius: 20, cursor: 'pointer', whiteSpace: 'nowrap',
              border: filter === f.value ? '2px solid var(--ink)' : '1.5px solid var(--sand-200)',
              background: filter === f.value ? 'var(--ink)' : '#FFFFFF',
              color: filter === f.value ? '#FFFFFF' : 'var(--sand-600)',
              transition: 'all 0.2s ease',
              boxShadow: filter === f.value ? '0 2px 6px rgba(0,0,0,0.15)' : 'none'
            }}
            onMouseEnter={e => {
              if (filter !== f.value) {
                e.currentTarget.style.background = 'var(--sand-50)';
                e.currentTarget.style.borderColor = 'var(--sand-300)';
              }
            }}
            onMouseLeave={e => {
              if (filter !== f.value) {
                e.currentTarget.style.background = '#FFFFFF';
                e.currentTarget.style.borderColor = 'var(--sand-200)';
              }
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Complaints List */}
      <div style={{ padding: '20px 0' }}>
        {loading ? (
          <div style={{ padding: '0 16px' }}>
            <SkeletonCard count={3} />
          </div>
        ) : shown.length === 0 ? (
          <div style={{ 
            textAlign: 'center', padding: '80px 20px', color: 'var(--sand-400)',
            animation: 'fadeSlideUp 0.4s ease both' 
          }}>
            <div style={{ fontSize: 64, marginBottom: 16, animation: 'logoBounce 0.6s ease both' }}>📭</div>
            <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--ink)' }}>
              {filter ? `No ${filter.replace('_', ' ')} complaints` : 'No complaints yet'}
            </div>
            <p style={{ fontSize: '13px', color: 'var(--sand-500)', marginTop: '6px', maxWidth: '300px', margin: '6px auto 0' }}>
              Any complaints you report will appear here with real-time status updates.
            </p>
          </div>
        ) : (
          shown.map((c, i) => (
            <div key={c.id} className="complaint-item-anim" style={{ animationDelay: `${i * 0.06}s` }}>
              <ComplaintCard complaint={c} onClick={() => navigate(`/complaint/${c.id}`)} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
