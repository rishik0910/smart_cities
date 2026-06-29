import { useState, useEffect } from 'react';

const SEVERITIES = [
  {
    value: 'low',
    label: 'Low',
    icon: '🟢',
    color: '#27500A',
    bg: '#EAF3DE',
    border: '#96CC80',
    desc: 'Minor issue, can wait a few days',
  },
  {
    value: 'medium',
    label: 'Medium',
    icon: '🟡',
    color: '#633806',
    bg: '#FEF3C7',
    border: '#F59E0B',
    desc: 'Moderate issue, needs attention soon',
  },
  {
    value: 'high',
    label: 'High',
    icon: '🟠',
    color: '#92400E',
    bg: '#FAEEDA',
    border: '#F97316',
    desc: 'Serious issue, needs urgent attention',
  },
  {
    value: 'critical',
    label: 'Critical',
    icon: '🔴',
    color: '#991B1B',
    bg: '#FEE2E2',
    border: '#DC2626',
    desc: 'Emergency! Immediate action required',
  },
];

const AI_REASONS = {
  low:      'Small amount of waste detected. Low public health risk.',
  medium:   'Moderate waste accumulation. May affect surroundings.',
  high:     'Large waste pile detected near public area. Health hazard.',
  critical: 'Hazardous or medical waste detected. Immediate action needed!',
};

export default function SeveritySelector({ value, onChange, aiSeverity, aiConfidence, isLoading }) {
  const [showAll,    setShowAll]    = useState(false);
  const [accepted,   setAccepted]   = useState(false);
  const [dismissed,  setDismissed]  = useState(false);
  const [animIn,     setAnimIn]     = useState(false);

  const selected = SEVERITIES.find(s => s.value === value) || SEVERITIES[1];
  const aiSev    = SEVERITIES.find(s => s.value === aiSeverity);

  // Animate AI card in when aiSeverity arrives
  useEffect(() => {
    if (aiSeverity && !dismissed) {
      setAnimIn(false);
      setTimeout(() => setAnimIn(true), 50);
    }
  }, [aiSeverity]);

  const handleAccept = () => {
    onChange(aiSeverity);
    setAccepted(true);
    setTimeout(() => setDismissed(true), 1200);
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  const showAICard = aiSeverity && !dismissed && aiSev;

  return (
    <div>

      {/* ── AI RECOMMENDATION CARD ── */}
      {isLoading && (
        <div style={{
          marginBottom: 14,
          background: 'linear-gradient(135deg, #f8f7f3, #edf5ee)',
          border: '1.5px solid var(--green-100, #c5e3b8)',
          borderRadius: 14,
          padding: '14px 16px',
          display: 'flex', alignItems: 'center', gap: 12,
          animation: 'fadeIn 0.3s ease both',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
            border: '3px solid var(--green-100, #c5e3b8)',
            borderTop: '3px solid var(--green-500, #2d7d3a)',
            animation: 'spin 0.8s linear infinite',
          }} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--green-600, #1e5c28)', marginBottom: 2 }}>
              🤖 AI is analyzing severity...
            </div>
            <div style={{ fontSize: 11, color: 'var(--sand-400, #a89f8c)' }}>
              Evaluating waste type, size and public health risk
            </div>
          </div>
        </div>
      )}

      {showAICard && !isLoading && (
        <div style={{
          marginBottom: 14,
          background: accepted
            ? 'linear-gradient(135deg, #EAF3DE, #f0faf0)'
            : `linear-gradient(135deg, ${aiSev.bg}, #fff)`,
          border: `1.5px solid ${accepted ? 'var(--green-400, #96cc80)' : aiSev.border}`,
          borderRadius: 14,
          padding: '14px 16px',
          transition: 'all 0.4s ease',
          animation: animIn ? 'severitySlideIn 0.45s cubic-bezier(0.34,1.56,0.64,1) both' : 'none',
          boxShadow: `0 4px 20px ${aiSev.bg}88`,
        }}>

          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
              background: 'rgba(20,20,16,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16,
            }}>🤖</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--sand-600, #6b6358)',
                letterSpacing: 0.8, textTransform: 'uppercase' }}>
                AI recommends
              </div>
              <div style={{ fontSize: 10, color: 'var(--sand-400, #a89f8c)', marginTop: 1 }}>
                Based on photo analysis · {aiConfidence}% confident
              </div>
            </div>
            {/* Confidence ring */}
            <div style={{ position: 'relative', width: 36, height: 36, flexShrink: 0 }}>
              <svg width="36" height="36" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" stroke="var(--sand-100, #ede9df)" strokeWidth="3"/>
                <circle cx="18" cy="18" r="15" fill="none" stroke={aiSev.border}
                  strokeWidth="3" strokeLinecap="round"
                  strokeDasharray={`${(aiConfidence/100)*94} 94`}
                  transform="rotate(-90 18 18)"
                  style={{ transition: 'stroke-dasharray 1s ease' }}
                />
              </svg>
              <div style={{
                position: 'absolute', inset: 0, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 700, color: aiSev.color,
              }}>{aiConfidence}%</div>
            </div>
          </div>

          {/* Severity pill — big and prominent */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: aiSev.bg, borderRadius: 12,
            padding: '10px 14px', marginBottom: 10,
            border: `1.5px solid ${aiSev.border}`,
            transition: 'transform 0.2s ease',
          }}>
            <span style={{ fontSize: 24 }}>{aiSev.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: aiSev.color, letterSpacing: -0.5 }}>
                {aiSev.label.toUpperCase()}
              </div>
              <div style={{ fontSize: 11, color: aiSev.color, opacity: 0.8, marginTop: 1 }}>
                {AI_REASONS[aiSeverity]}
              </div>
            </div>
            {accepted && (
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--green-500, #2d7d3a)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700,
                animation: 'scaleInBounce 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
              }}>✓</div>
            )}
          </div>

          {/* Action buttons */}
          {!accepted && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleAccept} style={{
                flex: 2, padding: '9px 0', borderRadius: 10, border: 'none',
                background: aiSev.color, color: '#fff', fontSize: 12, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'var(--font, sans-serif)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                transition: 'transform 0.15s, box-shadow 0.15s',
                boxShadow: `0 3px 10px ${aiSev.bg}`,
              }}
                onMouseEnter={e => { e.currentTarget.style.transform='scale(1.02)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform='scale(1)'; }}>
                {aiSev.icon} Accept {aiSev.label}
              </button>
              <button onClick={handleDismiss} style={{
                flex: 1, padding: '9px 0', borderRadius: 10,
                border: '1.5px solid var(--sand-200, #d9d3c4)',
                background: 'none', color: 'var(--sand-600, #6b6358)',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'var(--font, sans-serif)',
                transition: 'background 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--sand-50, #f7f5f0)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                Choose manually
              </button>
            </div>
          )}

          {accepted && (
            <div style={{
              textAlign: 'center', fontSize: 12, fontWeight: 600,
              color: 'var(--green-600, #1e5c28)', padding: '4px 0',
              animation: 'fadeSlideUp 0.3s ease both',
            }}>
              ✓ AI severity applied — you can still change it below
            </div>
          )}
        </div>
      )}

      {/* ── SEVERITY BUTTONS ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8,
        opacity: (isLoading && !value) ? 0.5 : 1,
        transition: 'opacity 0.3s ease',
      }}>
        {SEVERITIES.map((s, i) => {
          const isSelected = value === s.value;
          const isAI       = aiSeverity === s.value && !dismissed;
          return (
            <button
              key={s.value}
              onClick={() => { onChange(s.value); setAccepted(false); }}
              title={s.desc}
              style={{
                padding: '10px 6px', borderRadius: 12, fontSize: 11, fontWeight: 700,
                cursor: 'pointer', textAlign: 'center',
                fontFamily: 'var(--font, sans-serif)',
                border: isSelected
                  ? `2px solid ${s.color}`
                  : isAI
                  ? `1.5px dashed ${s.border}`
                  : '1.5px solid var(--sand-200, #d9d3c4)',
                background: isSelected ? s.bg : 'var(--white, #fdfcf9)',
                color: isSelected ? s.color : 'var(--sand-600, #6b6358)',
                transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
                transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                boxShadow: isSelected ? `0 4px 14px ${s.bg}` : 'none',
                animationDelay: `${i * 0.05}s`,
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={e => { if (!isSelected) e.currentTarget.style.transform = 'scale(1.03)'; }}
              onMouseLeave={e => { if (!isSelected) e.currentTarget.style.transform = 'scale(1)'; }}>

              {/* AI indicator dot */}
              {isAI && !dismissed && (
                <div style={{
                  position: 'absolute', top: 4, right: 4,
                  width: 6, height: 6, borderRadius: '50%',
                  background: s.border,
                  animation: 'pulse 1.5s ease-in-out infinite',
                }} />
              )}

              <div style={{ fontSize: 20, marginBottom: 3 }}>{s.icon}</div>
              <div>{s.label}</div>
              {isSelected && (
                <div style={{
                  fontSize: 9, marginTop: 2, opacity: 0.8, lineHeight: 1.3,
                  animation: 'fadeIn 0.2s ease both',
                }}>
                  {s.desc.split(',')[0]}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected severity description */}
      {value && (
        <div style={{
          marginTop: 8, padding: '7px 12px',
          background: selected.bg, borderRadius: 8,
          fontSize: 11, color: selected.color, fontWeight: 600,
          animation: 'fadeSlideUp 0.25s ease both',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span>{selected.icon}</span>
          {selected.desc}
        </div>
      )}

      {/* Keyframes */}
      <style>{`
        @keyframes severitySlideIn {
          from { opacity:0; transform:translateY(-12px) scale(0.96); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes pulse {
          0%,100% { transform:scale(1); opacity:1; }
          50%      { transform:scale(1.5); opacity:0.5; }
        }
        @keyframes scaleInBounce {
          0%   { transform:scale(0); }
          60%  { transform:scale(1.2); }
          100% { transform:scale(1); }
        }
      `}</style>
    </div>
  );
}
