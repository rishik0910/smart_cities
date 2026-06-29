import { useState } from 'react';
import StatusBadge from './StatusBadge';

const ICONS = {
  garbage_dump: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="garbageGradCard" x1="4" y1="4" x2="20" y2="20">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#5B21B6" />
        </linearGradient>
      </defs>
      <path d="M6 9h12l-1.5 11h-9L6 9z" fill="url(#garbageGradCard)" opacity="0.9" />
      <line x1="9" y1="11" x2="9" y2="18" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
      <line x1="12" y1="11" x2="12" y2="18" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
      <line x1="15" y1="11" x2="15" y2="18" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
      <path d="M4 7h16v2H4V7z" fill="#7C3AED" />
      <path d="M10 4h4v3h-4V4z" fill="#6D28D9" rx="1" />
      <path d="M18 16c1.5 0 2.5 1 2.5 2.5S19.5 21 18 21s-2.5-1-2.5-2.5 1-2.5 2.5-2.5z" fill="#A78BFA" opacity="0.7" />
    </svg>
  ),
  missed_pickup: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="truckGradCard" x1="2" y1="2" x2="22" y2="22">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>
      <path d="M15 8h4.5l2.5 3.5V16h-7V8z" fill="#1D4ED8" />
      <path d="M17 10h3v2.5h-3V10z" fill="#93C5FD" />
      <rect x="2" y="6" width="13" height="10" rx="1.5" fill="url(#truckGradCard)" />
      <path d="M5 11l2.5-2.5L10 11H5z" fill="#FFFFFF" opacity="0.4" />
      <path d="M5 11h5l-2.5 2.5L5 11z" fill="#FFFFFF" opacity="0.2" />
      <circle cx="6.5" cy="17.5" r="3" fill="#1E293B" />
      <circle cx="6.5" cy="17.5" r="1.25" fill="#E2E8F0" />
      <circle cx="16.5" cy="17.5" r="3" fill="#1E293B" />
      <circle cx="16.5" cy="17.5" r="1.25" fill="#E2E8F0" />
      <circle cx="21.5" cy="12.5" r="0.75" fill="#FBBF24" />
    </svg>
  ),
  overflowing_bin: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="overflowGradCard" x1="4" y1="4" x2="20" y2="20">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
      </defs>
      <path d="M8 5c0-1.5 1.5-2 3-2s2 1 3 2c1.5-1 3.5 0 3.5 1.5S16 9 14.5 9H7.5C6 9 8 6.5 8 5z" fill="#A7F3D0" />
      <path d="M5 9h14l-1.5 11.5h-11L5 9z" fill="url(#overflowGradCard)" />
      <path d="M12 12l2 3h-4l2-3z" fill="#FFFFFF" opacity="0.8" />
      <circle cx="12" cy="15.5" r="1" fill="#FFFFFF" opacity="0.8" />
    </svg>
  ),
  pothole: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="potholeGradCard" x1="2" y1="2" x2="22" y2="22">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#991B1B" />
        </linearGradient>
      </defs>
      <path d="M2 18h20c0-2-3-4-10-4S2 16 2 18z" fill="#475569" opacity="0.3" />
      <path d="M9 16l2-2 1.5 1.5L15 14" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 3l5 13H7l5-13z" fill="url(#potholeGradCard)" />
      <path d="M10.2 8h3.6l.8 2H9.4l.8-2z" fill="#FFFFFF" />
      <rect x="5" y="16" width="14" height="2" rx="0.5" fill="#B91C1C" />
    </svg>
  ),
  street_light: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lightGradCard" x1="4" y1="4" x2="20" y2="20">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>
      <path d="M6 12l6-8 6 8H6z" fill="#FEF3C7" opacity="0.6" />
      <path d="M5 21h4v-2H7v-9.5C7 7 9 5 11.5 5h2C16 5 18 7 18 9.5V11h-2V9.5C16 8 15 7 13.5 7h-2C10 7 9 8 9 9.5V19H5v2z" fill="#64748B" />
      <rect x="14" y="10" width="6" height="3" rx="1.5" fill="url(#lightGradCard)" />
      <path d="M15 13l1 4h2l1-4h-4z" fill="#FBBF24" />
    </svg>
  ),
  water_leak: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="waterGradCard" x1="4" y1="4" x2="20" y2="20">
          <stop offset="0%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#0891B2" />
        </linearGradient>
      </defs>
      <rect x="2" y="8" width="20" height="5" rx="1" fill="#94A3B8" />
      <rect x="8" y="7" width="3" height="7" rx="0.5" fill="#64748B" />
      <path d="M12 11c0 0-2 2.5-2 4s1 2.5 2 2.5 2-1 2-2.5-2-4-2-4z" fill="url(#waterGradCard)" />
      <path d="M15 14c0 0-1 1.5-1 2.5s.5 1.5 1 1.5 1-.5 1-1.5-1-2.5-1-2.5z" fill="#22D3EE" opacity="0.8" />
      <path d="M6 20c0-1 4-1.5 6-1.5s6 .5 6 1.5-4 1.5-6 1.5-6-.5-6-1.5z" fill="url(#waterGradCard)" opacity="0.4" />
    </svg>
  ),
  construction_waste: (
    <svg width="26" height="26" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="brickGrad" x1="4" y1="12" x2="16" y2="28">
          <stop offset="0%" stopColor="#EA580C" />
          <stop offset="100%" stopColor="#9A3412" />
        </linearGradient>
        <linearGradient id="shovelGrad" x1="14" y1="4" x2="26" y2="24">
          <stop offset="0%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
      </defs>
      {/* Ground dirt pile */}
      <path d="M3 26c0-3 5-4.5 12-4.5s12 1.5 12 4.5H3z" fill="#78350F" opacity="0.25" />
      {/* Brick 1 */}
      <rect x="4" y="20" width="10" height="5" rx="1" fill="url(#brickGrad)" stroke="#7C2D12" strokeWidth="1" />
      <line x1="4" y1="21.5" x2="14" y2="21.5" stroke="#F97316" strokeWidth="0.8" opacity="0.4" />
      {/* Brick 2 */}
      <rect x="15" y="20" width="11" height="5" rx="1" fill="url(#brickGrad)" stroke="#7C2D12" strokeWidth="1" />
      {/* Brick 3 (Stacked) */}
      <rect x="9" y="14" width="11" height="5" rx="1" fill="url(#brickGrad)" stroke="#7C2D12" strokeWidth="1" transform="rotate(-8 14 16)" />
      {/* Shovel Handle */}
      <path d="M19.5 5.5l-8 12" stroke="#B45309" strokeWidth="2.2" strokeLinecap="round" />
      {/* Shovel D-Grip */}
      <path d="M19.5 5.5l2.2-2.2M18.5 4.5l2.2-2.2M20.7 2.3l1.5 1.5" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
      {/* Shovel Blade */}
      <path d="M9 16.5l3.5 3.5-3.5 3.5L6 20l3-3.5z" fill="url(#shovelGrad)" stroke="#334155" strokeWidth="1" />
    </svg>
  ),
  other: (
    <svg width="26" height="26" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="boardGrad" x1="4" y1="4" x2="28" y2="28">
          <stop offset="0%" stopColor="#78350F" />
          <stop offset="100%" stopColor="#451A03" />
        </linearGradient>
        <linearGradient id="sheetGrad" x1="8" y1="6" x2="24" y2="26">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F3F4F6" />
        </linearGradient>
        <linearGradient id="clipGrad" x1="12" y1="2" x2="20" y2="7">
          <stop offset="0%" stopColor="#D1D5DB" />
          <stop offset="100%" stopColor="#6B7280" />
        </linearGradient>
      </defs>
      {/* Clipboard Board */}
      <rect x="5" y="4" width="22" height="25" rx="3" fill="url(#boardGrad)" />
      <rect x="6" y="5" width="20" height="23" rx="2" fill="#9A3412" opacity="0.3" />
      {/* Paper Sheet */}
      <rect x="8" y="7" width="16" height="20" rx="1.5" fill="url(#sheetGrad)" />
      {/* Text Lines */}
      <line x1="11" y1="12" x2="21" y2="12" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
      <line x1="11" y1="16" x2="21" y2="16" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
      <line x1="11" y1="20" x2="17" y2="20" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
      {/* Metallic Clip */}
      <path d="M11 3h10v4.5H11V3z" fill="url(#clipGrad)" rx="1" />
      <circle cx="16" cy="4.5" r="1" fill="#374151" />
    </svg>
  )
};

const STAGES = ['Submitted', 'Assigned', 'In Progress', 'Resolved'];

const getStageIndex = (status) => {
  if (status === 'pending') return 0;
  if (status === 'assigned') return 1;
  if (status === 'in_progress') return 2;
  if (status === 'resolved') return 3;
  return -1;
};

export default function ComplaintCard({ complaint, onClick }) {
  const { id, category, address, ward_name, created_at, status, photo_url } = complaint;
  const [imageError, setImageError] = useState(false);
  
  const daysAgo = Math.floor((Date.now() - new Date(created_at)) / 86400000);
  const timeLabel = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`;
  
  const stageIdx = getStageIndex(status);
  const showTimeline = stageIdx !== -1 && status !== 'rejected';

  // Get background color based on category
  const getIconBg = () => {
    switch (category) {
      case 'garbage_dump': return '#F5F3FF';
      case 'missed_pickup': return '#EFF6FF';
      case 'overflowing_bin': return '#F0FDF4';
      case 'pothole': return '#FEF2F2';
      case 'street_light': return '#FFFBEB';
      case 'water_leak': return '#ECFEFF';
      case 'construction_waste': return '#FFF7ED';
      default: return '#FDF2F8';
    }
  };

  return (
    <div 
      className="card clickable" 
      onClick={onClick}
      style={{ 
        margin: '0 16px 14px', 
        padding: '16px 20px', 
        display: 'flex', 
        flexDirection: 'column',
        background: '#FFFFFF',
        border: '1.5px solid var(--sand-100)',
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)',
        transition: 'all 0.25s ease',
        cursor: 'pointer'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.06)';
        e.currentTarget.style.borderColor = 'var(--sand-200)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.02)';
        e.currentTarget.style.borderColor = 'var(--sand-100)';
      }}
    >
      {/* Top Row: Icon, Title, Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%' }}>
        {photo_url && !imageError ? (
          <img 
            src={photo_url} 
            alt={category} 
            onError={() => setImageError(true)}
            style={{ width: 48, height: 48, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} 
          />
        ) : (
          <div style={{
            width: 48, height: 48, borderRadius: 12, 
            background: getIconBg(),
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            {ICONS[category] || ICONS.other}
          </div>
        )}
        
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '14.5px', fontWeight: '800', textTransform: 'capitalize', color: 'var(--ink)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.3px'
          }}>
            <span style={{ color: 'var(--sand-400)', marginRight: '4px', fontSize: '13px' }}>#{id}</span>
            {category?.replace(/_/g, ' ')}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: 'var(--sand-600)', marginTop: '4px' }}>
            {/* Map Pin SVG */}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {address || ward_name}
            </span>
            <span style={{ color: 'var(--sand-300)' }}>•</span>
            {/* Clock SVG */}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span style={{ flexShrink: 0 }}>{timeLabel}</span>
          </div>
        </div>
        
        <StatusBadge status={status} />
      </div>

      {/* Progress Timeline Row */}
      {showTimeline && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '4px', 
          marginTop: '16px', 
          padding: '12px 0 0', 
          borderTop: '1px dashed #F1F5F9',
          width: '100%'
        }}>
          {STAGES.map((stage, idx) => {
            const isCompleted = idx <= stageIdx;
            const isCurrent = idx === stageIdx;
            return (
              <div key={stage} style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: idx < STAGES.length - 1 ? 1 : 'none' }}>
                <div style={{
                  width: isCurrent ? '10px' : '8px', 
                  height: isCurrent ? '10px' : '8px', 
                  borderRadius: '50%',
                  background: isCurrent ? '#10B981' : isCompleted ? '#A7F3D0' : '#E2E8F0',
                  border: isCurrent ? '2.5px solid #D1FAE5' : 'none',
                  boxSizing: 'content-box',
                  flexShrink: 0
                }} />
                <span style={{
                  fontSize: '10px', 
                  fontWeight: isCurrent ? '800' : '700',
                  color: isCurrent ? 'var(--ink)' : isCompleted ? 'var(--sand-600)' : 'var(--sand-400)',
                  whiteSpace: 'nowrap'
                }}>
                  {stage}
                </span>
                {idx < STAGES.length - 1 && (
                  <div style={{
                    height: '2px', 
                    flex: 1,
                    background: idx < stageIdx ? '#A7F3D0' : '#E2E8F0',
                    marginLeft: '6px',
                    borderRadius: '1px'
                  }} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
