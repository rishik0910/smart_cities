const cfg = { pending: { label: 'Submitted' }, assigned: { label: 'Assigned' }, in_progress: { label: 'In progress' }, resolved: { label: 'Resolved' }, rejected: { label: 'Rejected' } };
export default function StatusTimeline({ history = [] }) {
  if (!history.length) return <p style={{ fontSize: 13, color: 'var(--sand-400)', padding: '12px 0' }}>No history yet.</p>;
  return (
    <div>
      {history.map((entry, i) => {
        const c = cfg[entry.new_status] || cfg.pending;
        const isLast = i === history.length - 1;
        const date = new Date(entry.changed_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
        return (
          <div key={i} className="timeline-entry">
            <div className="tl-col">
              <div className={`tl-dot ${isLast ? 'current' : 'done'}`} />
              {!isLast && <div className="tl-line" />}
            </div>
            <div className="tl-body">
              <div className={`tl-status ${isLast ? 'active' : ''}`}>{c.label}</div>
              <div className="tl-time">{date}{entry.changed_by_name ? ` · ${entry.changed_by_name}` : ''}</div>
              {entry.note && <div className="tl-note">{entry.note}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
