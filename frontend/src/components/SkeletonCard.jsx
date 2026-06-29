export default function SkeletonCard({ count = 3 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card" style={{ margin: '0 16px 10px', padding: '14px 16px' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ height: 13, width: '60%', marginBottom: 7 }} />
              <div className="skeleton" style={{ height: 11, width: '40%' }} />
            </div>
            <div className="skeleton" style={{ height: 22, width: 72, borderRadius: 20 }} />
          </div>
        </div>
      ))}
    </>
  );
}
