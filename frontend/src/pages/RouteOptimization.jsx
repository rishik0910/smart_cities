import { useState, useEffect, useRef } from 'react';
import { wardComplaints } from '../api';

// Helper to dynamically load Leaflet CSS and JS
function loadLeaflet() {
  return new Promise((resolve) => {
    if (window.L) return resolve(window.L);
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => resolve(window.L);
    document.head.appendChild(script);
  });
}

export default function RouteOptimization() {
  const [complaints, setComplaints] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [route,      setRoute]      = useState([]);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    // Fetch all complaints and filter active ones (assigned or in progress)
    wardComplaints()
      .then(r => {
        const active = (r.data.complaints || []).filter(c => 
          !['resolved', 'rejected'].includes(c.status)
        );
        setComplaints(active);
      })
      .finally(() => setLoading(false));

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Automatically run route optimization on load once complaints are fetched
  useEffect(() => {
    if (!loading && complaints.length > 0 && mapRef.current && !mapInstance.current) {
      optimizeRoute();
    }
  }, [loading, complaints]);

  const optimizeRoute = async () => {
    if (!complaints.length) return;
    setOptimizing(true);
    
    // Nearest neighbor TSP algorithm
    const points = complaints.filter(c => c.latitude && c.longitude);
    if (points.length === 0) {
      setOptimizing(false);
      return;
    }

    const visited = new Set();
    const ordered = [];
    let current = points[0];

    while (ordered.length < points.length) {
      visited.add(current.id);
      ordered.push(current);
      
      const next = points
        .filter(p => !visited.has(p.id))
        .sort((a, b) => {
          const da = Math.hypot(parseFloat(a.latitude) - parseFloat(current.latitude), parseFloat(a.longitude) - parseFloat(current.longitude));
          const db = Math.hypot(parseFloat(b.latitude) - parseFloat(current.latitude), parseFloat(b.longitude) - parseFloat(current.longitude));
          return da - db;
        })[0];
      
      if (!next) break;
      current = next;
    }
    
    setRoute(ordered);

    // Render Leaflet Map
    try {
      const L = await loadLeaflet();
      
      // Cleanup previous map instance if it exists
      if (mapInstance.current) {
        mapInstance.current.remove();
      }

      // Initialize map centered on the first stop
      const map = L.map(mapRef.current, { zoomControl: true }).setView(
        [parseFloat(ordered[0].latitude), parseFloat(ordered[0].longitude)],
        13
      );
      mapInstance.current = map;

      // Add Voyager tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap & CartoDB'
      }).addTo(map);

      // Add numbered markers
      ordered.forEach((c, i) => {
        const numberIcon = L.divIcon({
          className: 'custom-route-icon',
          html: `<div style="
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: ${i === 0 ? '#10b981' : '#2563eb'};
            color: white;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.25);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: 900;
          ">${i + 1}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        L.marker([parseFloat(c.latitude), parseFloat(c.longitude)], { icon: numberIcon })
          .bindPopup(`
            <div style="font-family: var(--font); font-size: 12px; padding: 2px;">
              <strong>Stop ${i + 1}</strong> (ID: #${c.id})<br/>
              <span style="text-transform:capitalize; font-weight:700;">${c.category.replace(/_/g,' ')}</span><br/>
              <span style="color:var(--sand-500); font-size:10px;">${c.address || ''}</span>
            </div>
          `)
          .addTo(map);
      });

      // Draw route line
      const latlngs = ordered.map(c => [parseFloat(c.latitude), parseFloat(c.longitude)]);
      L.polyline(latlngs, {
        color: '#10b981',
        weight: 3,
        dashArray: '6, 8',
        opacity: 0.85
      }).addTo(map);

      // Zoom map to fit all markers
      if (latlngs.length > 1) {
        const bounds = L.latLngBounds(latlngs);
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    } catch (err) {
      console.error('Failed to load Leaflet map for route:', err);
    } finally {
      setOptimizing(false);
    }
  };

  if (loading) return <p style={{ color: 'var(--sand-400)', textAlign: 'center', padding: 48, fontWeight: 'bold' }}>Loading active tasks...</p>;

  return (
    <div style={{ animation: 'slideUp 0.3s ease' }}>
      <style>{`
        .route-card {
          background: var(--white);
          border: 1.5px solid var(--sand-100);
          border-radius: 20px;
          padding: 24px;
          box-shadow: var(--shadow-sm);
          margin-bottom: 24px;
        }
        .btn-optimize {
          background: var(--green-500);
          color: #fff;
          border: none;
          padding: 12px 24px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .btn-optimize:hover {
          background: var(--green-600);
          transform: translateY(-1px);
        }
        .btn-optimize:disabled {
          background: var(--sand-200);
          color: var(--sand-400);
          cursor: not-allowed;
          transform: none;
        }
        .stop-row {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 14px 20px;
          background: var(--white);
          border: 1.5px solid var(--sand-100);
          border-radius: 16px;
          margin-bottom: 10px;
          box-shadow: var(--shadow-sm);
          transition: border-color 0.2s;
        }
        .stop-row:hover {
          border-color: var(--sand-200);
        }
      `}</style>

      {/* Overview Banner */}
      <div style={{
        background: 'var(--white)',
        border: '1.5px solid var(--sand-100)',
        borderRadius: '20px',
        padding: '20px 24px',
        marginBottom: '24px',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h4 style={{ fontSize: '15px', fontWeight: '900', color: 'var(--ink)', margin: 0 }}>
            🗺️ Route Dispatch Optimizer
          </h4>
          <p style={{ color: 'var(--sand-500)', fontSize: '12.5px', marginTop: '4px', marginBottom: 0 }}>
            Optimizes your travel sequence across your <strong>{complaints.length} active complaints</strong>.
          </p>
        </div>
        <button 
          onClick={optimizeRoute} 
          disabled={optimizing || complaints.length === 0}
          className="btn-optimize"
        >
          {optimizing ? 'Calculating Route...' : '🗺️ Optimize My Route'}
        </button>
      </div>

      {complaints.length === 0 ? (
        <div style={{
          background: 'var(--white)',
          border: '1.5px solid var(--sand-100)',
          borderRadius: '20px',
          padding: '64px 32px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <span style={{ fontSize: '48px' }}>🎉</span>
          <h3 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--ink)', marginTop: '16px' }}>
            No Active Complaints
          </h3>
          <p style={{ color: 'var(--sand-400)', fontSize: '13.5px', marginTop: '8px', maxWidth: '360px', margin: '8px auto 0' }}>
            You have no pending or in-progress complaints. There is no route to optimize!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
          
          {/* 1. Route Itinerary (Stops List) */}
          {route.length > 0 && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--sand-400)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>
                Suggested Stop Order ({route.length} Stops)
              </div>
              
              {route.map((c, i) => (
                <div key={c.id} className="stop-row">
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: i === 0 ? 'var(--green-500)' : 'var(--ink)',
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: '900', flexShrink: 0
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13.5px', fontWeight: '850', color: 'var(--ink)', textTransform: 'capitalize', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.category?.replace(/_/g, ' ')}
                      </span>
                      <span style={{
                        fontSize: '9px', fontWeight: '800', textTransform: 'uppercase',
                        padding: '2px 6px', borderRadius: '4px', background: 'var(--sand-50)', color: 'var(--sand-500)'
                      }}>
                        ID: #{c.id}
                      </span>
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--sand-450)', marginTop: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      📍 {c.address || 'No address details'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 2. Map Container */}
          <div className="route-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px 20px 12px' }}>
              <h5 style={{ fontSize: '14px', fontWeight: '900', color: 'var(--ink)', margin: 0 }}>
                Optimized Transit Map
              </h5>
              <p style={{ color: 'var(--sand-400)', fontSize: '12px', marginTop: '2px', marginBottom: 0 }}>
                Dotted line indicates the shortest path connecting all stops.
              </p>
            </div>
            <div ref={mapRef} style={{ width: '100%', height: '400px', background: 'var(--sand-50)', borderTop: '1.5px solid var(--sand-100)' }} />
          </div>

          {/* 3. Quick Tips */}
          <div style={{
            background: 'var(--white)',
            border: '1.5px solid var(--sand-100)',
            borderRadius: '20px',
            padding: '20px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start'
          }}>
            <span style={{ fontSize: '24px' }}>💡</span>
            <div>
              <h6 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--ink)', margin: 0 }}>How it works</h6>
              <p style={{ color: 'var(--sand-500)', fontSize: '11.5px', margin: '4px 0 0', lineHeight: '1.4' }}>
                The optimizer uses the **Nearest Neighbor** routing algorithm starting from your first assigned complaint. It arranges the sequence so you travel the shortest possible distance.
              </p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
