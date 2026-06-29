import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import indiaStatesDistricts from '../data/indiaStatesDistricts.json';

function injectLeaflet() {
  if (document.getElementById('leaflet-css')) {
    return window.L ? Promise.resolve() : new Promise(res => {
      document.querySelector('script[src*="leaflet"]')?.addEventListener('load', res);
    });
  }
  return new Promise(resolve => {
    const link = document.createElement('link');
    link.id = 'leaflet-css'; link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = resolve; document.head.appendChild(script);
  });
}

async function searchPlaces(query) {
  if (!query || query.length < 3) return [];
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=6`,
      { headers: { 'Accept-Language': 'en' } }
    );
    return await res.json();
  } catch { return []; }
}

async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
    const data = await res.json();
    return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch { return `${lat.toFixed(5)}, ${lng.toFixed(5)}`; }
}

// Matches a Nominatim reverse-geocode result's state name to our dataset's
// state keys (handles minor naming differences like "NCT of Delhi" vs "Delhi").
function matchStateName(rawState) {
  if (!rawState) return null;
  const keys = Object.keys(indiaStatesDistricts);
  const exact = keys.find(k => k.toLowerCase() === rawState.toLowerCase());
  if (exact) return exact;
  const partial = keys.find(k =>
    rawState.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(rawState.toLowerCase())
  );
  return partial || null;
}

// Matches a Nominatim reverse-geocode result's county/district name to one
// of our dataset's districts for the given state.
function matchDistrictName(stateKey, rawDistrict) {
  if (!stateKey || !rawDistrict) return null;
  const list = indiaStatesDistricts[stateKey] || [];
  const exact = list.find(d => d.toLowerCase() === rawDistrict.toLowerCase());
  if (exact) return exact;
  const partial = list.find(d =>
    rawDistrict.toLowerCase().includes(d.toLowerCase()) || d.toLowerCase().includes(rawDistrict.toLowerCase())
  );
  return partial || null;
}

export default function LocationPicker({
  onLocationSelect,
  onDistrictSelect,
  onStateDetected,
  onBoundaryFetched,
  state = '',
  district = '',
  initialLat = 17.9784,
  initialLng = 79.5941,
}) {
  const mapContainer = useRef();
  const mapInst = useRef();
  const markerRef = useRef();
  const searchTimer = useRef();
  const lastDetectedGeo = useRef({ state: '', district: '' });
  const boundaryLayerRef = useRef(null);

  const [minimized, setMinimized] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [ready, setReady] = useState(false);
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showSug, setShowSug] = useState(false);
  const [locating, setLocating] = useState(false);

  // ── Init map & restore state when entering/exiting fullscreen ────────────────
  useEffect(() => {
    let isMounted = true;
    injectLeaflet().then(() => {
      if (!isMounted) return;
      if (mapInst.current || !mapContainer.current) return;
      const L = window.L;

      const centerLat = selected ? selected.lat : initialLat;
      const centerLng = selected ? selected.lng : initialLng;
      const zoomLevel = selected ? 16 : 12;

      mapInst.current = L.map(mapContainer.current, {
        center: [centerLat, centerLng], zoom: zoomLevel,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors', maxZoom: 19,
      }).addTo(mapInst.current);

      mapInst.current.on('click', async (e) => dropPin(e.latlng.lat, e.latlng.lng));

      // Recreate pin marker if transition occurred and location was already selected
      if (selected) {
        const icon = L.divIcon({
          className: '',
          html: `
            <div style="position:relative;width:36px;height:36px;">
              <div style="
                width:36px;height:36px;
                background:linear-gradient(135deg,#1E5C28,#2D7D3A);
                border-radius:50% 50% 50% 0;transform:rotate(-45deg);
                border:3px solid #fff;box-shadow:0 4px 16px rgba(30,92,40,0.5);">
                <div style="width:10px;height:10px;background:#fff;border-radius:50%;
                  position:absolute;top:50%;left:50%;
                  transform:translate(-50%,-50%) rotate(45deg);"></div>
              </div>
            </div>`,
          iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -40],
        });

        markerRef.current = L.marker([selected.lat, selected.lng], { icon, draggable: true }).addTo(mapInst.current);
        markerRef.current.on('dragend', async (e) => {
          const p = e.target.getLatLng();
          const addr = await reverseGeocode(p.lat, p.lng);
          setSelected({ lat: p.lat, lng: p.lng, address: addr });
          setConfirmed(false);
          markerRef.current.bindPopup(`<b>📍 Pinned</b><br/><span style="font-size:12px">${addr}</span>`).openPopup();
        });

        markerRef.current
          .bindPopup(`<b>📍 Pinned location</b><br/><span style="font-size:12px">${selected.address}</span>`)
          .openPopup();
      }

      setReady(true);
    });

    return () => {
      isMounted = false;
      if (mapInst.current) {
        mapInst.current.remove();
        mapInst.current = null;
        markerRef.current = null;
        boundaryLayerRef.current = null;
      }
    };
  }, [initialLat, initialLng, fullscreen]);

  // Invalidate map size when fullscreen or minimized changes
  useEffect(() => {
    if (mapInst.current) {
      const timer1 = setTimeout(() => mapInst.current?.invalidateSize(), 50);
      const timer2 = setTimeout(() => mapInst.current?.invalidateSize(), 150);
      const timer3 = setTimeout(() => mapInst.current?.invalidateSize(), 300);
      const timer4 = setTimeout(() => mapInst.current?.invalidateSize(), 500);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
      };
    }
  }, [fullscreen, minimized]);

  // ESC to exit fullscreen
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && fullscreen) setFullscreen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [fullscreen]);

  // Fly map to selected state/district when they change in the parent dropdowns, and draw boundaries
  useEffect(() => {
    if (!mapInst.current) return;

    // If the change matches the last auto-detected state/district, do not fly/draw.
    if (state === lastDetectedGeo.current.state && district === lastDetectedGeo.current.district) {
      return;
    }

    // Update the ref so we don't trigger again for the same values
    lastDetectedGeo.current = { state, district };

    // Clear existing boundary layer if any
    if (boundaryLayerRef.current) {
      boundaryLayerRef.current.remove();
      boundaryLayerRef.current = null;
    }

    if (!state && !district) return;

    const showBoundaryAndFly = async () => {
      try {
        let query = '';
        if (district) {
          if (state.toLowerCase() === 'delhi' && !district.toLowerCase().includes('delhi')) {
            query = `${district} Delhi, Delhi, India`;
          } else {
            // Use comma-separated query to ensure OSM Nominatim parses the administrative hierarchy correctly
            query = `${district}, ${state}, India`;
          }
        } else {
          // Use comma-separated query to ensure OSM Nominatim parses the state and country correctly
          query = `${state}, India`;
        }

        // We make exactly ONE query with limit=10 to avoid hitting Nominatim's 1 req/sec rate limit.
        // This is extremely robust and ensures we never get blocked/rate-limited (HTTP 403/429).
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=10&polygon_geojson=1`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();

        if (data && data.length > 0 && mapInst.current) {
          // Find the best administrative boundary polygon match in the results
          let bestResult = data.find(r => 
            r.geojson && 
            (r.geojson.type === 'Polygon' || r.geojson.type === 'MultiPolygon' || r.geojson.type === 'GeometryCollection') &&
            r.class === 'boundary' && 
            r.type === 'administrative' &&
            r.display_name.toLowerCase().includes('district')
          );

          if (!bestResult) {
            bestResult = data.find(r => 
              r.geojson && 
              (r.geojson.type === 'Polygon' || r.geojson.type === 'MultiPolygon' || r.geojson.type === 'GeometryCollection') &&
              r.class === 'boundary' && 
              r.type === 'administrative'
            );
          }

          if (!bestResult) {
            bestResult = data.find(r => 
              r.geojson && 
              (r.geojson.type === 'Polygon' || r.geojson.type === 'MultiPolygon' || r.geojson.type === 'GeometryCollection')
            );
          }

          const result = bestResult || data[0];
          const L = window.L;

          // Draw the boundary polygon on the map
          if (result.geojson && (
            result.geojson.type === 'Polygon' || 
            result.geojson.type === 'MultiPolygon' || 
            result.geojson.type === 'GeometryCollection'
          )) {
            onBoundaryFetched?.({
              type: district ? 'district' : 'state',
              name: district || state,
              geojson: result.geojson
            });

            boundaryLayerRef.current = L.geoJSON(result.geojson, {
              style: {
                color: '#2d7d3a', // theme green
                weight: 2.5,
                opacity: 0.85,
                fillColor: '#2d7d3a',
                fillOpacity: 0.08,
              }
            }).addTo(mapInst.current);

            // Fit map to the boundary bounds
            const bounds = boundaryLayerRef.current.getBounds();
            if (bounds.isValid()) {
              mapInst.current.fitBounds(bounds, { padding: [30, 30], animate: true, duration: 1.2 });

              // Automatically drop a pin at the center of the boundary
              const center = bounds.getCenter();
              const addr = `Center of ${district || state}`;

              const icon = L.divIcon({
                className: '',
                html: `
                  <div style="position:relative;width:36px;height:36px;">
                    <div style="
                      width:36px;height:36px;
                      background:linear-gradient(135deg,#1E5C28,#2D7D3A);
                      border-radius:50% 50% 50% 0;transform:rotate(-45deg);
                      border:3px solid #fff;box-shadow:0 4px 16px rgba(30,92,40,0.5);">
                      <div style="width:10px;height:10px;background:#fff;border-radius:50%;
                        position:absolute;top:50%;left:50%;
                        transform:translate(-50%,-50%) rotate(45deg);"></div>
                    </div>
                  </div>`,
                iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -40],
              });

              if (markerRef.current) {
                markerRef.current.setLatLng(center);
              } else {
                markerRef.current = L.marker(center, { icon, draggable: true }).addTo(mapInst.current);
                markerRef.current.on('dragend', async (e) => {
                  const p = e.target.getLatLng();
                  const addressText = await reverseGeocode(p.lat, p.lng);
                  setSelected({ lat: p.lat, lng: p.lng, address: addressText });
                  setConfirmed(false);
                  onLocationSelect?.({ lat: p.lat, lng: p.lng, address: addressText });
                  markerRef.current.bindPopup(`<b>📍 Pinned</b><br/><span style="font-size:12px">${addressText}</span>`).openPopup();
                });
              }

              setSelected({ lat: center.lat, lng: center.lng, address: addr });
              setConfirmed(true);
              onLocationSelect?.({ lat: center.lat, lng: center.lng, address: addr });
              
              markerRef.current
                .bindPopup(`<b>📍 Center of ${district || state}</b>`)
                .openPopup();

              return;
            }
          }

          // Fallback to flyTo if geojson is not present or bounds are invalid
          const lat = parseFloat(result.lat);
          const lng = parseFloat(result.lon);
          mapInst.current.flyTo([lat, lng], district ? 12 : 8, { animate: true, duration: 1.2 });

          // Fallback: Drop pin at the center
          const center = L.latLng(lat, lng);
          const addr = result.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

          const icon = L.divIcon({
            className: '',
            html: `
              <div style="position:relative;width:36px;height:36px;">
                <div style="
                  width:36px;height:36px;
                  background:linear-gradient(135deg,#1E5C28,#2D7D3A);
                  border-radius:50% 50% 50% 0;transform:rotate(-45deg);
                  border:3px solid #fff;box-shadow:0 4px 16px rgba(30,92,40,0.5);">
                  <div style="width:10px;height:10px;background:#fff;border-radius:50%;
                    position:absolute;top:50%;left:50%;
                    transform:translate(-50%,-50%) rotate(45deg);"></div>
                </div>
              </div>`,
            iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -40],
          });

          if (markerRef.current) {
            markerRef.current.setLatLng(center);
          } else {
            markerRef.current = L.marker(center, { icon, draggable: true }).addTo(mapInst.current);
            markerRef.current.on('dragend', async (e) => {
              const p = e.target.getLatLng();
              const addressText = await reverseGeocode(p.lat, p.lng);
              setSelected({ lat: p.lat, lng: p.lng, address: addressText });
              setConfirmed(false);
              onLocationSelect?.({ lat: p.lat, lng: p.lng, address: addressText });
              markerRef.current.bindPopup(`<b>📍 Pinned</b><br/><span style="font-size:12px">${addressText}</span>`).openPopup();
            });
          }

          setSelected({ lat: center.lat, lng: center.lng, address: addr });
          setConfirmed(true);
          onLocationSelect?.({ lat: center.lat, lng: center.lng, address: addr });
          
          markerRef.current
            .bindPopup(`<b>📍 ${district || state}</b>`)
            .openPopup();
        }
      } catch (err) {
        console.error('Error flying to selected state/district:', err);
      }
    };

    showBoundaryAndFly();
  }, [state, district, ready]);

  // ── Drop pin ────────────────────────────────────────────────────────────────
  const dropPin = async (lat, lng) => {
    const L = window.L;
    if (!mapInst.current) return;

    const icon = L.divIcon({
      className: '',
      html: `
        <div style="position:relative;width:36px;height:36px;">
          <div style="
            width:36px;height:36px;
            background:linear-gradient(135deg,#1E5C28,#2D7D3A);
            border-radius:50% 50% 50% 0;transform:rotate(-45deg);
            border:3px solid #fff;box-shadow:0 4px 16px rgba(30,92,40,0.5);
            animation:pinDrop 0.4s cubic-bezier(0.34,1.56,0.64,1) both;">
            <div style="width:10px;height:10px;background:#fff;border-radius:50%;
              position:absolute;top:50%;left:50%;
              transform:translate(-50%,-50%) rotate(45deg);"></div>
          </div>
        </div>
        <style>
          @keyframes pinDrop {
            from{transform:rotate(-45deg) translateY(-20px) scale(0);opacity:0}
            to{transform:rotate(-45deg) translateY(0) scale(1);opacity:1}
          }
        </style>`,
      iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -40],
    });

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng], { icon, draggable: true }).addTo(mapInst.current);
      markerRef.current.on('dragend', async (e) => {
        const p = e.target.getLatLng();
        const addr = await reverseGeocode(p.lat, p.lng);
        setSelected({ lat: p.lat, lng: p.lng, address: addr });
        setConfirmed(false);
        markerRef.current.bindPopup(`<b>📍 Pinned</b><br/><span style="font-size:12px">${addr}</span>`).openPopup();
      });
    }

    mapInst.current.flyTo([lat, lng], 16, { animate: true, duration: 0.8 });
    const addr = await reverseGeocode(lat, lng);
    setSelected({ lat, lng, address: addr });
    setConfirmed(false);
    markerRef.current
      .bindPopup(`<b>📍 Pinned location</b><br/><span style="font-size:12px">${addr}</span>`)
      .openPopup();
  };

  // ── Search ──────────────────────────────────────────────────────────────────
  const handleSearchChange = (val) => {
    setSearchVal(val); setShowSug(true);
    clearTimeout(searchTimer.current);
    if (!val || val.length < 3) { setSuggestions([]); return; }
    setSearching(true);
    searchTimer.current = setTimeout(async () => {
      const res = await searchPlaces(val);
      setSuggestions(res); setSearching(false);
    }, 400);
  };

  const handleSuggestionClick = (item) => {
    setSearchVal(item.display_name.split(',')[0]);
    setShowSug(false); setSuggestions([]);
    dropPin(parseFloat(item.lat), parseFloat(item.lon));
  };

  const handleConfirm = () => {
    if (!selected) return;
    setConfirmed(true); setMinimized(true); setFullscreen(false);
    onLocationSelect?.({ lat: selected.lat, lng: selected.lng, address: selected.address });
  };

  const handleReset = () => {
    markerRef.current?.remove(); markerRef.current = null;
    setSelected(null); setConfirmed(false); setSearchVal('');
    if (boundaryLayerRef.current) {
      boundaryLayerRef.current.remove();
      boundaryLayerRef.current = null;
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        await dropPin(latitude, longitude);

        // Reverse-geocode in detail to pull state + district (county) separately
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
          );
          const data = await res.json();
          const addr = data.address || {};
          const rawState = addr.state;
          const rawDistrict = addr.state_district || addr.county || addr.city_district;

          const matchedState = matchStateName(rawState);
          if (matchedState) {
            lastDetectedGeo.current.state = matchedState;
            onStateDetected?.(matchedState);
            const matchedDistrict = matchDistrictName(matchedState, rawDistrict);
            if (matchedDistrict) {
              lastDetectedGeo.current.district = matchedDistrict;
              onDistrictSelect?.(matchedDistrict);
            }
          }
        } catch {
          // Reverse geocode for state/district failed — pin is still dropped, user can pick manually.
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        alert("Couldn't get your location. Please check location permissions and try again.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const toggleFullscreen = (e) => {
    e.stopPropagation();
    setFullscreen(f => !f);
    if (minimized) setMinimized(false);
  };

  // ── Styles based on fullscreen / inline modes ───────────────────────────────
  const outerStyle = fullscreen ? {
    position: 'fixed',
    inset: 0,
    zIndex: 99999,
    background: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(2px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    boxSizing: 'border-box',
    animation: 'fadeIn 0.2s ease both',
    transition: 'all 0.3s ease',
  } : {
    position: 'relative',
    width: '100%',
    transition: 'all 0.3s ease',
  };

  const innerStyle = fullscreen ? {
    position: 'relative',
    width: '100%',
    height: '100%',
    maxHeight: '100%',
    background: 'var(--white, #fff)',
    borderRadius: 20,
    overflow: 'hidden',
    boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
    display: 'flex',
    flexDirection: 'column',
    animation: 'scaleIn 0.25s cubic-bezier(0.34,1.56,0.64,1) both',
    transition: 'all 0.35s cubic-bezier(0.22,1,0.36,1)',
  } : {
    width: '100%',
    background: 'var(--white, #fff)',
    borderRadius: 16,
    // Allows dropdown list overflow when card is not minimized, prevents clipping
    overflow: minimized ? 'hidden' : 'visible',
    border: '1.5px solid var(--sand-200, #e6e6df)',
    boxShadow: '0 4px 24px rgba(20,20,16,0.1)',
    transition: 'all 0.35s cubic-bezier(0.22,1,0.36,1)',
    display: 'flex',
    flexDirection: 'column',
  };

  const headerStyle = fullscreen ? {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '16px 20px',
    background: confirmed
      ? 'linear-gradient(135deg,#1E5C28,#2D7D3A)'
      : 'linear-gradient(135deg,#141410,#2a2a24)',
    cursor: 'default',
    userSelect: 'none',
    flexShrink: 0,
    transition: 'background 0.4s ease',
  } : {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '13px 16px',
    background: confirmed
      ? 'linear-gradient(135deg,#1E5C28,#2D7D3A)'
      : 'linear-gradient(135deg,#141410,#2a2a24)',
    cursor: 'pointer',
    userSelect: 'none',
    flexShrink: 0,
    transition: 'background 0.4s ease',
  };

  const bodyStyle = fullscreen ? {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    overflow: 'visible',
  } : {
    maxHeight: minimized ? 0 : 600,
    overflow: minimized ? 'hidden' : 'visible',
    transition: 'max-height 0.45s cubic-bezier(0.22,1,0.36,1)',
    display: 'flex',
    flexDirection: 'column',
  };

  const mapAreaStyle = fullscreen ? {
    position: 'relative',
    flex: 1,
    minHeight: 0,
  } : {
    position: 'relative',
    height: 400,
    flexShrink: 0,
  };

  const renderContent = () => (
    <div style={outerStyle}>
      <div style={innerStyle}>

        {/* ── TOP HEADER ── */}
        <div
          onClick={() => !fullscreen && setMinimized(m => !m)}
          style={headerStyle}>
          <span style={{ fontSize: 18 }}>{confirmed ? '✅' : '📍'}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: 0.2 }}>
              {confirmed ? 'Location confirmed!'
                : selected ? 'Location pinned — confirm or edit'
                  : 'Pick waste location on map'}
            </div>
            {selected && (
              <div style={{
                fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 2,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
              }}>
                📍 {selected.address}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* Confirm button in header */}
            {selected && !confirmed && (
              <button onClick={e => { e.stopPropagation(); handleConfirm(); }} style={{
                background: 'var(--green-500, #2d7d3a)', color: '#fff', border: 'none',
                borderRadius: 10, padding: '6px 14px', fontSize: 12, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'var(--font, sans-serif)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)'; }}>
                Confirm ✓
              </button>
            )}

            {/* ── FULLSCREEN TOGGLE BUTTON ── */}
            <button
              onClick={toggleFullscreen}
              title={fullscreen ? 'Exit fullscreen (Esc)' : 'Open fullscreen map'}
              style={{
                width: 34, height: 34, borderRadius: 8,
                background: fullscreen ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.12)',
                border: '1.5px solid rgba(255,255,255,0.25)',
                color: '#fff', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 15, transition: 'all 0.2s',
                backdropFilter: 'blur(4px)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
              onMouseLeave={e => e.currentTarget.style.background = fullscreen ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.12)'}>
              {fullscreen ? '⊠' : '⛶'}
            </button>

            {/* Minimize toggle (normal mode only) */}
            {!fullscreen && (
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'rgba(255,255,255,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 14, fontWeight: 700,
                transition: 'transform 0.25s',
                transform: minimized ? 'rotate(0deg)' : 'rotate(180deg)',
              }}>∧</div>
            )}
          </div>
        </div>

        {/* ── COLLAPSIBLE / FULLSCREEN BODY ── */}
        <div style={bodyStyle}>

          {/* ── MAP AREA ── */}
          <div style={mapAreaStyle}>

            <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

            {/* Floating search bar on map */}
            <div style={{
              position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
              width: 'calc(100% - 32px)', maxWidth: fullscreen ? 560 : 460,
              zIndex: 1000, display: 'flex', gap: 8, alignItems: 'flex-start',
            }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'rgba(255,255,255,0.97)',
                  borderRadius: 12, padding: '10px 14px',
                  boxShadow: '0 4px 24px rgba(20,20,16,0.2)',
                  border: '1.5px solid rgba(255,255,255,0.8)',
                  backdropFilter: 'blur(8px)',
                }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>
                    {searching ? '⏳' : '🔍'}
                  </span>
                  <input
                    value={searchVal}
                    onChange={e => handleSearchChange(e.target.value)}
                    onFocus={() => setShowSug(true)}
                    onBlur={() => setTimeout(() => setShowSug(false), 200)}
                    placeholder="Search any location..."
                    style={{
                      flex: 1, border: 'none', outline: 'none',
                      fontSize: fullscreen ? 14 : 13,
                      fontFamily: 'var(--font, sans-serif)', background: 'transparent', color: 'var(--ink, #141410)',
                    }}
                  />
                  {searchVal && (
                    <button onClick={() => { setSearchVal(''); setSuggestions([]); }} style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: 16, color: 'var(--sand-400, #b2b2a4)', lineHeight: 1, padding: 0,
                    }}>✕</button>
                  )}
                </div>

                {/* Suggestions */}
                {showSug && suggestions.length > 0 && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                    background: '#fff', borderRadius: 12,
                    boxShadow: '0 8px 32px rgba(20,20,16,0.18)',
                    overflow: 'hidden', zIndex: 1001,
                    border: '1px solid var(--sand-100, #f5f5f0)',
                  }}>
                    {suggestions.map((s, i) => (
                      <div key={i} onMouseDown={() => handleSuggestionClick(s)} style={{
                        display: 'flex', alignItems: 'flex-start', gap: 10,
                        padding: '10px 14px', cursor: 'pointer',
                        borderBottom: i < suggestions.length - 1 ? '0.5px solid var(--sand-50, #fafaf8)' : 'none',
                        transition: 'background 0.1s',
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--sand-50, #fafaf8)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>📍</span>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink, #141410)', lineHeight: 1.3 }}>
                            {s.display_name.split(',')[0]}
                          </div>
                          <div style={{ fontSize: 10, color: 'var(--sand-400, #b2b2a4)', marginTop: 2, lineHeight: 1.4 }}>
                            {s.display_name.split(',').slice(1, 4).join(',')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Use current location button */}
              <button
                onClick={(e) => { e.stopPropagation(); handleUseCurrentLocation(); }}
                disabled={locating}
                title="Use current location"
                style={{
                  flexShrink: 0, width: 42, height: 42, borderRadius: 12,
                  background: 'rgba(255,255,255,0.97)',
                  border: '1.5px solid rgba(255,255,255,0.8)',
                  boxShadow: '0 4px 24px rgba(20,20,16,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 17, cursor: locating ? 'default' : 'pointer',
                  opacity: locating ? 0.6 : 1,
                }}
              >
                {locating ? '⏳' : '🧭'}
              </button>
            </div>

            {/* Fullscreen exit hint */}
            {fullscreen && (
              <div style={{
                position: 'absolute', top: 12, right: 12, zIndex: 1000,
                background: 'rgba(20, 20, 16, 0.82)', color: 'rgba(255,255,255,0.9)',
                borderRadius: 8, padding: '8px 14px', fontSize: 11, fontWeight: 600,
                boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
                backdropFilter: 'blur(4px)', pointerEvents: 'none',
                animation: 'fadeIn 0.3s ease both',
                border: '1px solid rgba(255,255,255,0.15)',
                fontFamily: 'var(--font, sans-serif)',
              }}>
                Press <kbd style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 5px', borderRadius: 4, fontSize: 10, fontFamily: 'monospace', marginRight: 2 }}>Esc</kbd> or click <span style={{ fontSize: 13, fontWeight: 800 }}>⊠</span> to exit
              </div>
            )}

            {/* Tap hint */}
            {ready && !selected && (
              <div style={{
                position: 'absolute', bottom: 48, left: '50%', transform: 'translateX(-50%)',
                background: 'rgba(20,20,16,0.78)', color: '#fff',
                borderRadius: 24, padding: '8px 18px', fontSize: 12, fontWeight: 600,
                pointerEvents: 'none', whiteSpace: 'nowrap', zIndex: 900,
              }}>
                👆 Tap anywhere on the map to drop a pin
              </div>
            )}

            {/* Pin info overlay at bottom of map */}
            {selected && (
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 900,
                background: 'linear-gradient(transparent, rgba(20,20,16,0.88))',
                padding: '32px 16px 12px',
                display: 'flex', alignItems: 'flex-end', gap: 10,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.6)',
                    letterSpacing: 1, textTransform: 'uppercase', marginBottom: 3
                  }}>
                    📍 Pinned location
                  </div>
                  <div style={{
                    fontSize: 12, fontWeight: 600, color: '#fff', lineHeight: 1.4,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                  }}>
                    {selected.address}
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace', marginTop: 2 }}>
                    {selected.lat.toFixed(5)}, {selected.lng.toFixed(5)}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button onClick={e => { e.stopPropagation(); handleReset(); }} style={{
                    background: 'rgba(255,255,255,0.15)', color: '#fff',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'var(--font, sans-serif)',
                  }}>Reset</button>
                  <button onClick={e => { e.stopPropagation(); handleConfirm(); }} style={{
                    background: 'var(--green-500, #2d7d3a)', color: '#fff', border: 'none',
                    borderRadius: 8, padding: '7px 18px', fontSize: 12, fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'var(--font, sans-serif)',
                    boxShadow: '0 2px 10px rgba(30,92,40,0.5)',
                  }}>Confirm ✓</button>
                </div>
              </div>
            )}

            {/* Loading overlay */}
            {!ready && (
              <div style={{
                position: 'absolute', inset: 0, zIndex: 800, background: 'var(--sand-50, #fafaf8)',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: 12,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  border: '3px solid var(--green-100, #e9f5ec)', borderTop: '3px solid var(--green-500, #2d7d3a)',
                  animation: 'spin 0.8s linear infinite'
                }} />
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--sand-400, #b2b2a4)' }}>Loading map...</div>
              </div>
            )}
          </div>


        </div>

        {/* Minimized confirmed preview */}
        {!fullscreen && minimized && confirmed && selected && (
          <div style={{
            padding: '10px 16px', background: 'var(--green-50, #e9f5ec)',
            borderTop: '1px solid var(--green-100, #c2e2c9)', display: 'flex', alignItems: 'center', gap: 10
          }}>
            <span style={{ fontSize: 16 }}>✅</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 12, fontWeight: 600, color: 'var(--green-600, #1e5c28)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
              }}>
                {selected.address}
              </div>
              {district && <div style={{ fontSize: 11, color: 'var(--green-500, #2d7d3a)', marginTop: 1 }}>District: {district}</div>}
            </div>
            <button onClick={() => { setMinimized(false); setConfirmed(false); }} style={{
              background: 'none', border: 'none', fontSize: 12, fontWeight: 700,
              color: 'var(--green-600, #1e5c28)', cursor: 'pointer', fontFamily: 'var(--font, sans-serif)',
            }}>Edit →</button>
          </div>
        )}
      </div>
    </div>
  );

  // If in fullscreen mode, portal rendering to document.body prevents parent clip/transform bugs
  if (fullscreen && typeof document !== 'undefined') {
    return createPortal(renderContent(), document.body);
  }

  return renderContent();
}