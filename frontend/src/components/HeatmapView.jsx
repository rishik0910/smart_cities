import { useEffect, useRef } from 'react';

function injectLeaflet() {
  if (document.getElementById('leaflet-css')) {
    return window.L ? Promise.resolve() : new Promise(res => {
      document.querySelector('script[src*="leaflet"]')?.addEventListener('load', res);
    });
  }
  return new Promise(resolve => {
    const link = document.createElement('link');
    link.id = 'leaflet-css'; 
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      // Load leaflet.heat plugin after Leaflet is ready
      const heatScript = document.createElement('script');
      heatScript.src = 'https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js';
      heatScript.onload = resolve;
      document.head.appendChild(heatScript);
    };
    document.head.appendChild(script);
  });
}

export default function HeatmapView({ complaints = [], height = 420 }) {
  const ref = useRef();
  const mapInst = useRef();

  useEffect(() => {
    let isMounted = true;

    injectLeaflet().then(() => {
      if (!isMounted || !ref.current) return;

      // Clean up previous map instance if it exists
      if (mapInst.current) {
        mapInst.current.remove();
        mapInst.current = null;
      }

      const validComplaints = complaints.filter(c => {
        const lat = parseFloat(c.latitude);
        const lng = parseFloat(c.longitude);
        return !isNaN(lat) && !isNaN(lng);
      });

      // Center of India
      const center = [20.5937, 78.9629];
      const zoom = 5;

      const map = window.L.map(ref.current, {
        zoomControl: true,
        attributionControl: true
      }).setView(center, zoom);
      
      mapInst.current = map;

      // Add clean, modern tile layer
      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);

      if (validComplaints.length === 0) return;

      // Add heatmap layer
      const heatPoints = validComplaints.map(c => [
        parseFloat(c.latitude),
        parseFloat(c.longitude),
        c.priority === 'critical' ? 1.0 :
        c.priority === 'high' ? 0.8 :
        c.priority === 'medium' ? 0.6 : 0.4
      ]);

      window.L.heatLayer(heatPoints, {
        radius: 22,
        blur: 18,
        maxZoom: 10,
        gradient: {
          0.3: '#10b981', // low -> green
          0.5: '#f59e0b', // medium -> orange
          0.7: '#f97316', // high -> dark orange
          1.0: '#ef4444'  // critical -> red
        }
      }).addTo(map);

      // Plot all complaints as interactive markers
      validComplaints.forEach(c => {
        const color = c.status === 'resolved' ? '#10b981' :
                      c.status === 'pending' ? '#f59e0b' :
                      c.status === 'in_progress' ? '#3b82f6' :
                      c.status === 'assigned' ? '#6366f1' : '#9ca3af';

        if (c.is_emergency) {
          const emergencyIcon = window.L.divIcon({
            className: 'emergency-ping-container',
            html: '<div class="emergency-ping"></div><div class="emergency-dot"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });

          window.L.marker([parseFloat(c.latitude), parseFloat(c.longitude)], { icon: emergencyIcon })
            .bindPopup(`
              <div style="font-family: var(--font); font-size: 12px; padding: 4px; min-width: 160px;">
                <strong style="color:#dc2626;">🚨 Emergency #${c.id}</strong><br/>
                <span style="font-weight:700; text-transform:capitalize;">${c.category.replace(/_/g,' ')}</span><br/>
                <span style="color:var(--sand-500); font-size:10px; display:block; margin-top:2px;">📍 ${c.address || ''}</span>
              </div>
            `)
            .addTo(map);
        } else {
          window.L.circleMarker([parseFloat(c.latitude), parseFloat(c.longitude)], {
            radius: 6,
            fillColor: color,
            color: '#ffffff',
            weight: 1.5,
            opacity: 1,
            fillOpacity: 0.9
          })
          .bindPopup(`
            <div style="font-family: var(--font); font-size: 12px; padding: 4px; min-width: 180px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; gap: 8px;">
                <strong style="color:var(--ink);">Complaint #${c.id}</strong>
                <span style="
                  font-size: 9px; 
                  font-weight: 800; 
                  text-transform: uppercase; 
                  padding: 2px 6px; 
                  border-radius: 6px; 
                  background: ${color}22; 
                  color: ${color};
                  border: 1px solid ${color}44;
                ">
                  ${c.status.replace(/_/g,' ')}
                </span>
              </div>
              <span style="font-weight: 700; text-transform: capitalize; font-size: 12.5px;">
                ${c.category.replace(/_/g,' ')}
              </span>
              <div style="color: var(--sand-500); font-size: 10.5px; margin-top: 4px; line-height: 1.3;">
                📍 ${c.address || 'No address details'}
              </div>
              ${c.description ? `
                <div style="color: var(--sand-600); font-size: 10.5px; margin-top: 6px; border-top: 1px solid var(--sand-100); padding-top: 4px; font-style: italic;">
                  "${c.description}"
                </div>
              ` : ''}
            </div>
          `)
          .addTo(map);
        }
      });
    }).catch(err => {
      console.warn('Leaflet failed to load:', err);
    });

    return () => {
      isMounted = false;
      if (mapInst.current) {
        mapInst.current.remove();
        mapInst.current = null;
      }
    };
  }, [complaints]);

  return (
    <div>
      <style>{`
        .emergency-ping-container {
          position: relative;
        }
        .emergency-ping {
          position: absolute;
          width: 20px;
          height: 20px;
          background: #dc2626;
          border-radius: 50%;
          animation: ping 1.5s infinite ease-out;
          opacity: 0;
        }
        .emergency-dot {
          position: absolute;
          top: 6px;
          left: 6px;
          width: 8px;
          height: 8px;
          background: #dc2626;
          border-radius: 50%;
          border: 1.5px solid white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }
        @keyframes ping {
          0% { transform: scale(0.5); opacity: 0.8; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        /* Style leaflet popups to look premium */
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: var(--shadow-md);
          border: 1px solid var(--sand-100);
        }
        .leaflet-popup-tip {
          box-shadow: var(--shadow-sm);
        }
      `}</style>
      <div ref={ref} style={{ width: '100%', height, borderRadius: '20px', overflow: 'hidden', border: '1px solid var(--sand-100)', zIndex: 1 }} />
      <div style={{ display: 'flex', gap: 16, padding: '12px 4px', fontSize: 11, color: 'var(--sand-600)', flexWrap: 'wrap' }}>
        {[['🟢', 'Low density'], ['🟡', 'Medium'], ['🟠', 'High'], ['🔴', 'Critical']].map(([dot, label]) => (
          <span key={label} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
            {dot} {label}
          </span>
        ))}
        <span style={{ marginLeft: 'auto', color: '#dc2626', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
          🚨 Emergency radar
        </span>
      </div>
    </div>
  );
}
