import { useEffect, useRef } from 'react';

function FallbackMap({ latitude, longitude, height }) {
  const lat = parseFloat(latitude).toFixed(5);
  const lng = parseFloat(longitude).toFixed(5);
  return (
    <div style={{ background:'var(--green-50)', border:'1px solid var(--green-100)',
      borderRadius:'var(--radius-sm)', height, display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', gap:8, cursor:'pointer' }}
      onClick={() => window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank')}>
      <span style={{ fontSize:28 }}>📍</span>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:12, fontWeight:700, color:'var(--green-600)' }}>
          View on Google Maps ↗
        </div>
        <div style={{ fontSize:11, color:'var(--sand-400)', fontFamily:'var(--mono)', marginTop:2 }}>
          {lat}, {lng}
        </div>
      </div>
    </div>
  );
}

export function SinglePinMap({ latitude, longitude, height = 200 }) {
  const ref = useRef();
  useEffect(() => {
    if (!window.L || !latitude || !longitude) return;
    
    const container = ref.current;
    if (container._leaflet_id) {
      container._leaflet_id = null;
      container.innerHTML = '';
    }
    
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    const map = window.L.map(container, {
      zoomControl: true,
      attributionControl: false
    }).setView([lat, lng], 15);

    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    window.L.marker([lat, lng]).addTo(map);
    
    return () => {
      map.remove();
    };
  }, [latitude, longitude]);

  if (!window.L) return <FallbackMap latitude={latitude} longitude={longitude} height={height} />;
  return <div ref={ref} style={{ width:'100%', height, borderRadius:'var(--radius-sm)', overflow:'hidden', zIndex: 1 }} />;
}

export function MultiPinMap({ complaints = [], height = 380, onPinClick }) {
  const ref = useRef();
  useEffect(() => {
    if (!window.L || !complaints.length) return;

    const container = ref.current;
    if (container._leaflet_id) {
      container._leaflet_id = null;
      container.innerHTML = '';
    }

    const map = window.L.map(container, {
      zoomControl: true,
      attributionControl: false
    });

    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    const group = [];
    complaints.forEach(c => {
      const lat = parseFloat(c.latitude);
      const lng = parseFloat(c.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        const marker = window.L.marker([lat, lng]).addTo(map);
        marker.bindPopup(`<b>Complaint #${c.id}</b><br/>${c.category?.replace(/_/g, ' ')}`);
        if (onPinClick) {
          marker.on('click', () => onPinClick(c));
        }
        group.push([lat, lng]);
      }
    });

    if (group.length > 0) {
      map.fitBounds(group, { padding: [20, 20] });
    }

    return () => {
      map.remove();
    };
  }, [complaints]);

  if (!window.L) return (
    <div style={{ background:'var(--sand-50)', border:'1px solid var(--sand-200)',
      borderRadius:'var(--radius-sm)', height, display:'flex', alignItems:'center',
      justifyContent: 'center', flexDirection:'column', gap:6, color:'var(--sand-400)' }}>
      <span style={{ fontSize:28 }}>🗺️</span>
      <div style={{ fontSize:13, fontWeight:700 }}>{complaints.length} complaints — map disabled</div>
    </div>
  );
  return <div ref={ref} style={{ width:'100%', height, borderRadius:'var(--radius-sm)', overflow:'hidden', zIndex: 1 }} />;
}

export function SelectLocationMap({ latitude, longitude, onChange, height = 220 }) {
  const ref = useRef();
  useEffect(() => {
    if (!window.L || !latitude || !longitude) return;

    const container = ref.current;
    if (container._leaflet_id) {
      container._leaflet_id = null;
      container.innerHTML = '';
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    const map = window.L.map(container, {
      zoomControl: true,
      attributionControl: false
    }).setView([lat, lng], 16);

    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    const marker = window.L.marker([lat, lng], { draggable: true }).addTo(map);

    marker.on('dragend', function (event) {
      const position = marker.getLatLng();
      if (onChange) {
        onChange({ latitude: position.lat, longitude: position.lng });
      }
    });

    return () => {
      map.remove();
    };
  }, [latitude, longitude]);

  if (!window.L) return null;
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontSize: 11, color: 'var(--sand-400)', marginBottom: 6 }}>
        📍 Drag the marker to adjust coordinates:
      </div>
      <div ref={ref} style={{ width:'100%', height, borderRadius:'var(--radius-sm)', overflow:'hidden', zIndex: 1 }} />
    </div>
  );
}
