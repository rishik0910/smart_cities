import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AIDetector from '../components/AIDetector';
import NearbyWarning from '../components/NearbyWarning';
import AnimatedButton from '../components/AnimatedButton';
import LocationPicker from '../components/LocationPicker';
import StateSelector from '../components/StateSelector';
import DistrictSelector from '../components/DistrictSelector';
import { submitComplaint } from '../api';
import { showToast } from '../components/Toast';

const CATEGORIES = [
  { value: 'garbage_dump', label: '🗑️', title: 'Garbage Dump', desc: 'Garbage piled up in public places' },
  { value: 'missed_pickup', label: '🚛', title: 'Missed Pickup', desc: 'Garbage not collected on schedule' },
  { value: 'overflowing_bin', label: '♻️', title: 'Overflowing Bin', desc: 'Dustbin is full and needs emptying' },
  { value: 'construction_waste', label: '🏗️', title: 'Construction Waste', desc: 'Construction debris dumped on roads' },
  { value: 'plastic_waste', label: '🛍️', title: 'Plastic Waste', desc: 'Plastic or polythene waste disposal' },
  { value: 'e_waste', label: '💻', title: 'E-Waste', desc: 'Electronic waste disposal issue', emergency: true },
  { value: 'medical_waste', label: '☣️', title: 'Medical Waste', desc: 'Improper disposal of medical waste', emergency: true },
  { value: 'hazardous_waste', label: '⚠️', title: 'Hazardous Waste', desc: 'Chemicals or hazardous materials', emergency: true },
  { value: 'other', label: '📋', title: 'Other', desc: 'Other types of issues not listed here' },
];

const SEVERITIES = [
  { value: 'low', label: 'Low', color: '#27500A', bg: '#EAF3DE' },
  { value: 'medium', label: 'Medium', color: '#633806', bg: '#FAEEDA' },
  { value: 'high', label: 'High', color: '#1E40AF', bg: '#DBEAFE' },
  { value: 'critical', label: 'Critical', color: '#991B1B', bg: '#FEE2E2' },
];

const EMERGENCY_CATS = ['medical_waste', 'hazardous_waste', 'e_waste'];

function CategoryIcon({ value }) {
  switch (value) {
    case 'garbage_dump':
      return (
        <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: 12 }}>
          {/* Bin Body (Tapered, flat bottom, no wheels) */}
          <path d="M18 20L21 52C21 54 22.5 55 24 55H40C41.5 55 43 54 43 52L46 20H18Z" fill="#388E3C" />
          {/* Vertical ridges - darker green stripes */}
          <rect x="23" y="24" width="2.5" height="26" rx="1" fill="#1B5E20" />
          <rect x="27.5" y="24" width="2.5" height="26" rx="1" fill="#1B5E20" />
          <rect x="32" y="24" width="2.5" height="26" rx="1" fill="#1B5E20" />
          <rect x="36.5" y="24" width="2.5" height="26" rx="1" fill="#1B5E20" />
          <rect x="41" y="24" width="2.5" height="26" rx="1" fill="#1B5E20" />
          {/* Bin Lid Rim */}
          <path d="M15 17C15 16 16 15 17 15H47C48 15 49 16 49 17V20H15V17Z" fill="#1B5E20" />
          {/* Lid Handle */}
          <path d="M26 15C26 12 38 12 38 15" stroke="#1B5E20" strokeWidth="3" strokeLinecap="round" fill="none" />
        </svg>
      );
    case 'missed_pickup':
      return (
        <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: 12 }}>
          {/* Container (Green with dark green vertical ridges) */}
          <rect x="24" y="16" width="30" height="24" rx="2" fill="#388E3C" />
          <rect x="29" y="19" width="2.5" height="18" rx="1" fill="#1B5E20" />
          <rect x="35" y="19" width="2.5" height="18" rx="1" fill="#1B5E20" />
          <rect x="41" y="19" width="2.5" height="18" rx="1" fill="#1B5E20" />
          <rect x="47" y="19" width="2.5" height="18" rx="1" fill="#1B5E20" />
          {/* Cabin (Green facing left) */}
          <path d="M8 24H24V40H8V28L8 24Z" fill="#4CAF50" />
          {/* Cabin Window (Black/Dark Grey) */}
          <path d="M11 26H19V32H11V26Z" fill="#1E293B" />
          {/* Bumper (Silver/Grey) */}
          <rect x="6" y="36" width="3" height="4" fill="#94A3B8" rx="0.5" />
          {/* Bumper Light */}
          <circle cx="7.5" cy="38" r="1" fill="#FBBF24" />
          {/* Mudguards / Wheel arches */}
          <circle cx="16" cy="40" r="7" fill="#1B5E20" />
          <circle cx="34" cy="40" r="7" fill="#1B5E20" />
          <circle cx="46" cy="40" r="7" fill="#1B5E20" />
          {/* 3 Wheels (Black with grey hubs) */}
          <circle cx="16" cy="42" r="6" fill="#1E293B" />
          <circle cx="16" cy="42" r="2" fill="#94A3B8" />
          <circle cx="34" cy="42" r="6" fill="#1E293B" />
          <circle cx="34" cy="42" r="2" fill="#94A3B8" />
          <circle cx="46" cy="42" r="6" fill="#1E293B" />
          <circle cx="46" cy="42" r="2" fill="#94A3B8" />
        </svg>
      );
    case 'overflowing_bin':
      return (
        <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: 12 }}>
          {/* Symmetric, solid green recycling logo with three chasing arrows */}
          <g fill="#388E3C">
            {/* Top Arrow */}
            <path d="M32 6 C24.5 6 18 10 14.5 16 L19.5 19 C22.2 15 26.8 12.5 32 12.5 C33.5 12.5 35 12.8 36.5 13.3 L38.5 8 C36.5 6.7 34.3 6 32 6 Z" />
            <path d="M35 18 L47 18 L41 6.5 L35 18 Z" />
            {/* Right Arrow (Rotated 120) */}
            <g transform="rotate(120 32 32)">
              <path d="M32 6 C24.5 6 18 10 14.5 16 L19.5 19 C22.2 15 26.8 12.5 32 12.5 C33.5 12.5 35 12.8 36.5 13.3 L38.5 8 C36.5 6.7 34.3 6 32 6 Z" />
              <path d="M35 18 L47 18 L41 6.5 L35 18 Z" />
            </g>
            {/* Left Arrow (Rotated 240) */}
            <g transform="rotate(240 32 32)">
              <path d="M32 6 C24.5 6 18 10 14.5 16 L19.5 19 C22.2 15 26.8 12.5 32 12.5 C33.5 12.5 35 12.8 36.5 13.3 L38.5 8 C36.5 6.7 34.3 6 32 6 Z" />
              <path d="M35 18 L47 18 L41 6.5 L35 18 Z" />
            </g>
          </g>
        </svg>
      );
    case 'construction_waste':
      return (
        <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: 12 }}>
          {/* Tower Crane (Yellow lattice crane on the left) */}
          <rect x="18" y="52" width="6" height="3" rx="0.5" fill="#475569" />
          <rect x="20" y="20" width="2" height="32" fill="#F59E0B" />
          {/* Lattice lines */}
          <line x1="20" y1="24" x2="22" y2="28" stroke="#D97706" strokeWidth="1" />
          <line x1="22" y1="24" x2="20" y2="28" stroke="#D97706" strokeWidth="1" />
          <line x1="20" y1="32" x2="22" y2="36" stroke="#D97706" strokeWidth="1" />
          <line x1="22" y1="32" x2="20" y2="36" stroke="#D97706" strokeWidth="1" />
          <line x1="20" y1="40" x2="22" y2="44" stroke="#D97706" strokeWidth="1" />
          <line x1="22" y1="40" x2="20" y2="44" stroke="#D97706" strokeWidth="1" />
          {/* Crane Horizontal Jib */}
          <path d="M6 20H48L44 16H20V20Z" fill="#F59E0B" />
          {/* Counterweight */}
          <rect x="10" y="17" width="5" height="5" fill="#475569" />
          {/* Cable and hook */}
          <line x1="34" y1="20" x2="34" y2="34" stroke="#475569" strokeWidth="1.2" />
          <path d="M32 34C32 36 36 36 36 34" stroke="#475569" strokeWidth="1.2" fill="none" />

          {/* Stack of Red Bricks (Right side, neat pile as in screenshot) */}
          {/* Layer 1 (Bottom) */}
          <rect x="38" y="48" width="8" height="4" rx="0.5" fill="#DC2626" stroke="#B91C1C" strokeWidth="0.8" />
          <rect x="47" y="48" width="8" height="4" rx="0.5" fill="#DC2626" stroke="#B91C1C" strokeWidth="0.8" />
          <rect x="56" y="48" width="8" height="4" rx="0.5" fill="#DC2626" stroke="#B91C1C" strokeWidth="0.8" />
          {/* Layer 2 */}
          <rect x="42.5" y="43" width="8" height="4" rx="0.5" fill="#DC2626" stroke="#B91C1C" strokeWidth="0.8" />
          <rect x="51.5" y="43" width="8" height="4" rx="0.5" fill="#DC2626" stroke="#B91C1C" strokeWidth="0.8" />
          {/* Layer 3 */}
          <rect x="47" y="38" width="8" height="4" rx="0.5" fill="#DC2626" stroke="#B91C1C" strokeWidth="0.8" />
        </svg>
      );
    case 'plastic_waste':
      return (
        <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: 12 }}>
          {/* Blue Water Gallon */}
          <rect x="20" y="24" width="18" height="24" rx="4" fill="#2196F3" />
          <path d="M24 24V18H34V24H24Z" fill="#64B5F6" />
          <rect x="23" y="15" width="12" height="3" rx="0.5" fill="#1976D2" />
          {/* Horizontal ridges */}
          <rect x="22" y="28" width="14" height="2" fill="#1976D2" opacity="0.3" />
          <rect x="22" y="34" width="14" height="2" fill="#1976D2" opacity="0.3" />
          <rect x="22" y="40" width="14" height="2" fill="#1976D2" opacity="0.3" />
          {/* Gallon handle */}
          <path d="M38 27H41V37H38" stroke="#1976D2" strokeWidth="2.5" strokeLinecap="round" fill="none" />

          {/* Green Plastic Soda Bottle (Smaller, on the right) */}
          <rect x="43" y="32" width="8" height="16" rx="1.5" fill="#4CAF50" />
          <path d="M44 32 L45 28 H49 L50 32 Z" fill="#388E3C" />
          <rect x="45" y="26" width="4" height="2" fill="#1B5E20" rx="0.3" />
        </svg>
      );
    case 'e_waste':
      return (
        <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: 12 }}>
          {/* Computer Monitor (Dark frame/bezel, bright blue screen with shine) */}
          <rect x="8" y="12" width="48" height="32" rx="3" fill="#1E293B" stroke="#475569" strokeWidth="2" />
          {/* Bright blue screen */}
          <rect x="11" y="15" width="42" height="26" rx="1" fill="#2196F3" />
          {/* Diagonal Screen Shine */}
          <path d="M11 15L35 15L25 41L11 41Z" fill="#90CAF9" opacity="0.35" />
          {/* Stand Column */}
          <rect x="29" y="44" width="6" height="8" fill="#475569" />
          {/* Stand Base */}
          <rect x="20" y="52" width="24" height="3" rx="1" fill="#1E293B" />
          {/* Power light (Green dot) */}
          <circle cx="50" cy="42" r="1" fill="#4CAF50" />
        </svg>
      );
    case 'medical_waste':
      return (
        <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: 12 }}>
          {/* Yellow Biohazard Circle */}
          <circle cx="32" cy="32" r="26" fill="#FBC02D" />
          {/* Biohazard Symbol (Perfect solid black shapes and cutouts) */}
          <g stroke="#1E293B" strokeWidth="2.5" fill="none">
            {/* Three overlapping rings */}
            <circle cx="32" cy="24.5" r="7.5" />
            <circle cx="25.5" cy="36" r="7.5" />
            <circle cx="38.5" cy="36" r="7.5" />
            {/* Center ring */}
            <circle cx="32" cy="32" r="6" strokeWidth="2" />
          </g>
          {/* Inner details / cutouts */}
          <path d="M32 17V32 M25.5 36L32 32 M38.5 36L32 32" stroke="#FBC02D" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="32" cy="32" r="2" fill="#1E293B" />
        </svg>
      );
    case 'hazardous_waste':
      return (
        <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: 12 }}>
          {/* Warning Triangle (Yellow/Orange with black border & exclamation mark) */}
          <path d="M32 10 L56 50 C57 52 56 54 53 54 H11 C8 54 7 52 8 50 L32 10 Z" fill="#FFA726" stroke="#1E293B" strokeWidth="3.5" strokeLinejoin="round" />
          {/* Black Exclamation Mark */}
          <rect x="30.5" y="24" width="3" height="15" rx="1.5" fill="#1E293B" />
          <circle cx="32" cy="45" r="3" fill="#1E293B" />
        </svg>
      );
    case 'other':
      return (
        <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: 12 }}>
          {/* Clipboard Board (Brown wood, rounded corners) */}
          <rect x="15" y="10" width="34" height="44" rx="3" fill="#8D6E63" stroke="#5D4037" strokeWidth="2.2" />
          {/* White Paper Sheet */}
          <rect x="19" y="16" width="26" height="34" rx="1" fill="#FFFFFF" />
          {/* Metal Clip (Silver/Grey with spring loop) */}
          <path d="M25 10 H39 V15 H25 Z" fill="#B0BEC5" stroke="#455A64" strokeWidth="1.5" strokeLinejoin="round" />
          <circle cx="32" cy="7" r="2" fill="#455A64" />
          {/* Horizontal text writing lines */}
          <line x1="23" y1="23" x2="41" y2="23" stroke="#90A4AE" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="23" y1="29" x2="41" y2="29" stroke="#90A4AE" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="23" y1="35" x2="37" y2="35" stroke="#90A4AE" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="23" y1="41" x2="33" y2="41" stroke="#90A4AE" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

function MonumentSilhouette() {
  return (
    <svg width="120" height="45" viewBox="0 0 150 50" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.8, flexShrink: 0 }}>
      {/* Taj Mahal dome */}
      <path d="M15 50V35c0-2 1.5-3.5 3.5-3.5s3.5 1.5 3.5 3.5v15" fill="#E2E8F0" />
      <path d="M11 50V25c0-1 .8-1.8 1.8-1.8s1.8.8 1.8 1.8v25" fill="#CBD5E1" />
      <path d="M24 50V25c0-1 .8-1.8 1.8-1.8s1.8.8 1.8 1.8v25" fill="#CBD5E1" />
      <path d="M5 50V40h27v10H5z" fill="#E2E8F0" opacity="0.5" />
      <path d="M18.5 25c-3 0-5 2-5 5h10c0-3-2-5-5-5z" fill="#94A3B8" />

      {/* Temple spire (Shikhara) */}
      <path d="M55 50L62 15l7 35H55z" fill="#CBD5E1" />
      <path d="M58 50L62 25l4 25H58z" fill="#94A3B8" />
      <circle cx="62" cy="13" r="1.5" fill="#94A3B8" />

      {/* India Gate */}
      <path d="M100 50V20h22v30h-4V32c0-3.5-3-6.5-7-6.5s-7 3-7 6.5v18h-4z" fill="#E2E8F0" />
      <path d="M96 20h30v-3H96v3z" fill="#CBD5E1" />
      <path d="M103 17h16v-4h-16v4z" fill="#94A3B8" />

      {/* Domes and towers */}
      <path d="M138 50V30c0-1.5 1-2.5 2.5-2.5s2.5 1 2.5 2.5v20" fill="#CBD5E1" />
      <path d="M135 50V38c0-1 1-2 2-2s2 1 2 2v12" fill="#94A3B8" />
    </svg>
  );
}

function IndiaGateIllustration() {
  return (
    <div style={{ position: 'relative', background: '#F8FAFC', borderRadius: '12px', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0' }}>
      <img
        src="/assets/citizen-responsibility.png"
        alt="India, Our Responsibility"
        style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '12px', objectFit: 'contain' }}
      />
    </div>
  );
}

function geojsonToSvgPath(geojson, width = 18, height = 18, padding = 2.5) {
  if (!geojson) return '';
  
  let rings = [];
  if (geojson.type === 'Polygon') {
    rings = [geojson.coordinates[0]];
  } else if (geojson.type === 'MultiPolygon') {
    // Sort polygons by area (bounding box area) and take the largest ones to avoid cluttering with tiny islands
    const sortedPolys = [...geojson.coordinates].sort((a, b) => {
      const getArea = (poly) => {
        let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;
        for (const [lng, lat] of poly[0]) {
          if (lng < minLng) minLng = lng;
          if (lng > maxLng) maxLng = lng;
          if (lat < minLat) minLat = lat;
          if (lat > maxLat) maxLat = lat;
        }
        return (maxLng - minLng) * (maxLat - minLat);
      };
      return getArea(b) - getArea(a);
    });
    
    // Only take the largest 3 polygons (islands) to keep the icon clean and perfect
    rings = sortedPolys.slice(0, 3).map(poly => poly[0]);
  } else {
    return '';
  }

  // Find overall bounding box of all selected rings
  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;

  for (const ring of rings) {
    for (const [lng, lat] of ring) {
      if (lng < minX) minX = lng;
      if (lng > maxX) maxX = lng;
      if (lat < minY) minY = lat;
      if (lat > maxY) maxY = lat;
    }
  }

  const rangeX = maxX - minX;
  const rangeY = maxY - minY;

  if (rangeX === 0 || rangeY === 0) return '';

  const fitWidth = width - padding * 2;
  const fitHeight = height - padding * 2;
  const scale = Math.min(fitWidth / rangeX, fitHeight / rangeY);

  const offsetX = padding + (fitWidth - rangeX * scale) / 2;
  const offsetY = padding + (fitHeight - rangeY * scale) / 2;

  const projectAndSimplify = (ring) => {
    const projected = ring.map(([lng, lat]) => ({
      x: offsetX + (lng - minX) * scale,
      y: offsetY + (maxY - lat) * scale
    }));

    // Simplify points that are too close in pixel space to make the boundary lines perfectly smooth
    const simplified = [projected[0]];
    let last = projected[0];
    for (let i = 1; i < projected.length; i++) {
      const curr = projected[i];
      const dist = Math.hypot(curr.x - last.x, curr.y - last.y);
      if (dist > 0.8 || i === projected.length - 1) {
        simplified.push(curr);
        last = curr;
      }
    }
    return 'M' + simplified.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join('L') + 'Z';
  };

  return rings.map(projectAndSimplify).join(' ');
}

function renderLargeBoundarySvg(geojson, type = 'state') {
  const width = 100;
  const height = 80;
  const padding = 8;
  const path = geojsonToSvgPath(geojson, width, height, padding);
  
  if (!path) return null;
  
  const isState = type === 'state';
  const strokeColor = isState ? '#2563EB' : '#0D9488';
  const fillColor = isState ? '#EFF6FF' : '#F0FDFA';
  
  return (
    <div style={{ 
      position: 'relative', 
      width: width, 
      height: height, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: fillColor,
      border: `1.5px solid ${isState ? '#DBEAFE' : '#CCFBF1'}`,
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
    }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none">
        <path
          d={path}
          fill={isState ? '#DBEAFE' : '#CCFBF1'}
          stroke={strokeColor}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Tiny red/blue pin at the center of the viewBox (50, 40) */}
        <g transform="translate(50, 40)">
          {/* Pin shadow */}
          <ellipse cx="0" cy="4" rx="2" ry="0.8" fill="rgba(0,0,0,0.2)" />
          {/* Pin body */}
          <path
            d="M0 0 C-2 -2, -3.5 -3.5, -3.5 -5.5 C-3.5 -7.5, -1.5 -9, 0 -9 C1.5 -9, 3.5 -7.5, 3.5 -5.5 C3.5 -3.5, 2 -2, 0 0 Z"
            fill="#EF4444"
          />
          {/* Pin inner dot */}
          <circle cx="0" cy="-5.5" r="1.2" fill="#FFFFFF" />
        </g>
      </svg>
    </div>
  );
}

export default function SubmitComplaint() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ category: 'garbage_dump', description: '', ward_id: '', address: '', severity: 'medium', state: '' });
  const [photo, setPhoto] = useState(null);
  const [gpsLoc, setGpsLoc] = useState(null);   // device GPS
  const [mapLoc, setMapLoc] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [aiDetected, setAiDetected] = useState(false);
  const [stateGeojson, setStateGeojson] = useState(null);
  const [districtGeojson, setDistrictGeojson] = useState(null);

  const handleBoundaryFetched = ({ type, geojson }) => {
    if (type === 'state') setStateGeojson(geojson);
    else if (type === 'district') setDistrictGeojson(geojson);
  };

  // Try to get GPS silently in background
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      p => setGpsLoc({ latitude: p.coords.latitude, longitude: p.coords.longitude }),
      () => { },
      { timeout: 8000 }
    );
  }, []);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };
  const isEmergency = EMERGENCY_CATS.includes(form.category);
  const charCount = form.description.length;

  const finalLoc = mapLoc || gpsLoc;

  const handleAIDetected = (result) => {
    set('category', result.category);
    set('severity', result.severity);
    setAiDetected(true);
    showToast(`AI detected: ${result.label} (${result.confidence}% confident)`, 'success');
  };

  const validate = () => {
    const e = {};
    if (!form.description) e.description = 'Please describe the issue';
    if (!form.ward_id) e.ward_id = 'Please select a district';
    if (!finalLoc) e.location = 'Please pick the waste location on the map';
    setErrors(e); return !Object.keys(e).length;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const data = new FormData();
      data.append('category', form.category);
      data.append('description', form.description);
      data.append('ward_id', form.ward_id);
      data.append('severity', form.severity);
      data.append('state', form.state || '');
      const loc = mapLoc || gpsLoc;
      data.append('latitude', loc.latitude);
      data.append('longitude', loc.longitude);
      data.append('address', mapLoc?.address || '');
      if (photo) data.append('photo', photo);
      await submitComplaint(data);
      setSubmitted(true);
      showToast('Complaint submitted!', 'success');
      setTimeout(() => navigate('/track'), 1500);
    } catch (err) {
      showToast(err.response?.data?.error || 'Submission failed', 'error');
    } finally { setLoading(false); }
  };

  if (submitted) return (
    <div className="page" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 16, minHeight: '100vh', padding: 24, textAlign: 'center', background: '#F8F9FA'
    }}>
      <div style={{ fontSize: 72, animation: 'successPop 0.5s ease both' }}>✅</div>
      <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.5px' }}>
        Complaint Submitted!
      </div>
      <p style={{ fontSize: 14, color: 'var(--sand-600)', maxWidth: 360, margin: '0 auto', lineHeight: 1.5 }}>
        Thank you for reporting. Your request has been logged and assigned to the local district operations team.
      </p>
      {isEmergency && (
        <div style={{
          background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 'var(--radius-sm)',
          padding: '12px 20px', fontSize: 13, color: '#991B1B', fontWeight: 700, marginTop: 8
        }}>
          ⚠️ Emergency Dispatch Initiated
        </div>
      )}
    </div>
  );

  const steps = ['Category', 'Details', 'Location', 'Preview'];

  return (
    <div style={{ background: '#F8F9FA', minHeight: '100vh', paddingBottom: '60px' }}>
      {/* Dynamic Hero Banner */}
      <div
        style={{
          position: "relative",
          height: "260px",
          overflow: "hidden",
          borderBottom: "1px solid var(--sand-100)",
          borderRadius: "0 0 20px 20px"
        }}
      >
        <img
          src="/assets/report-banner.png"
          alt="Report Banner"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center 95%",
            display: "block"
          }}
        />

        {/* White Gradient Overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(255,255,255,.90) 0%, rgba(255,255,255,.55) 25%, rgba(255,255,255,.15) 45%, rgba(255,255,255,0) 65%)"
          }}
        />

        {/* Text */}
        <div
          style={{
            position: "absolute",
            left: "40px",
            top: "70px",
            zIndex: 2
          }}
        >
          <h1
            style={{
              fontSize: "34px",
              fontWeight: 900,
              color: "var(--ink)",
              marginBottom: "10px"
            }}
          >
            Report an Issue
          </h1>

          <p
            style={{
              fontSize: "15px",
              color: "var(--sand-600)",
              fontWeight: 600
            }}
          >
            Every issue you report makes{" "}
            <span style={{ color: "var(--green-600)", fontWeight: 800 }}>
              India
            </span>{" "}
            a better place to live.
          </p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="report-page-grid">
        {/* Left/Middle Column (Form Stepper & Steps) */}
        <div>
          {/* Stepper Card */}
          <div style={{
            background: 'var(--white)',
            border: '1.5px solid var(--sand-100)',
            borderRadius: '16px',
            padding: '16px 20px',
            marginBottom: '24px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              {steps.map((s, i) => {
                const isActive = step === i + 1;
                const isCompleted = step > i + 1;
                return (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'auto' }}>
                    <div
                      onClick={() => isCompleted && setStep(i + 1)}
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: '800',
                        flexShrink: 0,
                        cursor: isCompleted ? 'pointer' : 'default',
                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                        background: isCompleted ? 'var(--green-600)' : isActive ? 'var(--ink)' : '#F1F5F9',
                        color: (isCompleted || isActive) ? '#fff' : '#94A3B8',
                        border: isActive ? '2px solid var(--green-600)' : 'none',
                        boxShadow: isActive ? '0 0 0 4px rgba(30,92,40,0.12)' : 'none'
                      }}
                    >
                      {isCompleted ? '✓' : i + 1}
                    </div>
                    <div style={{ marginLeft: '8px', marginRight: '8px' }}>
                      <div style={{ fontSize: '12.5px', fontWeight: '700', color: (isActive || isCompleted) ? 'var(--ink)' : '#64748B' }}>
                        {s}
                      </div>
                      <div style={{ fontSize: '10px', fontWeight: '500', color: '#94A3B8', marginTop: '1px', whiteSpace: 'nowrap' }}>
                        {i === 0 ? 'Select issue type' : i === 1 ? 'Provide more info' : i === 2 ? 'Set exact location' : 'Review and submit'}
                      </div>
                    </div>
                    {i < steps.length - 1 && (
                      <div style={{
                        flex: 1,
                        height: '2px',
                        background: isCompleted ? 'var(--green-600)' : '#E2E8F0',
                        marginRight: '12px',
                        transition: 'background 0.3s'
                      }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Container Card */}
          <div style={{
            background: 'var(--white)',
            border: '1.5px solid var(--sand-100)',
            borderRadius: '16px',
            padding: '24px 28px 28px',
            boxShadow: 'var(--shadow-sm)',
            minHeight: '480px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              {/* ── STEP 1 — Category ── */}
              {step === 1 && (
                <div className="stagger-1">
                  <div style={{ marginBottom: '16px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--ink)', letterSpacing: '-0.3px' }}>
                      What type of issue do you want to report?
                    </h2>
                    <p style={{ fontSize: '12.5px', color: 'var(--sand-600)', marginTop: '4px' }}>
                      Choose the category that best matches the issue you want to report.
                    </p>
                  </div>

                  <div className="category-grid">
                    {CATEGORIES.map((c) => {
                      const active = form.category === c.value;
                      return (
                        <div
                          key={c.value}
                          onClick={() => set('category', c.value)}
                          className={`category-card ${active ? 'active' : ''}`}
                        >
                          <CategoryIcon value={c.value} />
                          <div style={{ fontSize: '13.5px', fontWeight: '800', color: 'var(--ink)', marginBottom: '3px' }}>
                            {c.title}
                          </div>
                          <div style={{ fontSize: '10.5px', color: 'var(--sand-600)', lineHeight: '1.3' }}>
                            {c.desc}
                          </div>

                          {c.emergency && (
                            <div style={{ fontSize: '8px', fontWeight: '800', color: '#DC2626', marginTop: '6px', letterSpacing: '0.5px' }}>
                              EMERGENCY
                            </div>
                          )}

                          {active && (
                            <div style={{
                              position: 'absolute',
                              top: '10px',
                              right: '10px',
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              background: 'var(--green-600)',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '10px',
                              fontWeight: 'bold'
                            }}>✓</div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {isEmergency && (
                    <div style={{
                      background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '10px',
                      padding: '10px 14px', fontSize: '12px', color: '#991B1B', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'
                    }}>
                      <span>⚠️</span> Emergency category — operations dispatch team notified instantly upon submission.
                    </div>
                  )}

                  {/* Skyline banner */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#F8FAFC',
                    border: '1.5px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '14px 20px',
                    marginTop: '20px',
                    marginBottom: '20px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <MonumentSilhouette />
                      <div>
                        <div style={{ fontSize: '13.5px', fontWeight: '800', color: 'var(--green-600)', letterSpacing: '-0.2px' }}>
                          Clean Cities. Stronger India.
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B', marginTop: '3px', fontWeight: '500', lineHeight: '1.4' }}>
                          Together, let's build cleaner, greener and healthier cities across India.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 2 — Details ── */}
              {step === 2 && (
                <div className="stagger-1">
                  <div style={{ marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--ink)', letterSpacing: '-0.3px' }}>
                      Provide issue details
                    </h2>
                    <p style={{ fontSize: '12.5px', color: 'var(--sand-600)', marginTop: '4px' }}>
                      Upload a photo and describe the issue to help our team understand.
                    </p>
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <label style={{
                      fontSize: '10px', fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase',
                      color: 'var(--sand-400)', display: 'block', marginBottom: 8
                    }}>
                      🤖 AI-powered photo analysis
                    </label>
                    <AIDetector onDetected={handleAIDetected} onFileReady={setPhoto} />
                    {aiDetected && (
                      <div style={{ fontSize: 11, color: 'var(--green-600)', fontWeight: 600, marginTop: 6 }}>
                        ✓ Category and severity auto-filled by AI
                      </div>
                    )}
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <label style={{ fontSize: '10px', fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: 'var(--sand-400)' }}>
                        Description
                      </label>
                      <span style={{
                        fontSize: 10, fontWeight: 600,
                        color: charCount > 450 ? '#DC2626' : charCount > 300 ? '#92400E' : 'var(--sand-400)'
                      }}>
                        {charCount}/500
                      </span>
                    </div>
                    <textarea className={`form-input ${errors.description ? 'error' : ''}`}
                      rows={4} maxLength={500} placeholder="Describe the issue in detail (e.g., location specifics, type of waste, hazard level)..."
                      value={form.description} onChange={e => set('description', e.target.value)}
                      style={{ resize: 'vertical', minHeight: 100 }} />
                    <div style={{ height: 2, background: 'var(--sand-100)', borderRadius: 1, marginTop: 4, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 1, transition: 'width 0.2s,background 0.2s',
                        width: `${(charCount / 500) * 100}%`,
                        background: charCount > 450 ? '#DC2626' : charCount > 300 ? '#F59E0B' : 'var(--green-500)'
                      }} />
                    </div>
                    {errors.description && <div className="form-error">{errors.description}</div>}
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <label style={{
                      fontSize: '10px', fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase',
                      color: 'var(--sand-400)', display: 'block', marginBottom: 8
                    }}>Severity</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                      {SEVERITIES.map(s => (
                        <button key={s.value} onClick={() => set('severity', s.value)} style={{
                          padding: '10px 4px', borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 700,
                          cursor: 'pointer', textAlign: 'center', fontFamily: 'var(--font)',
                          border: form.severity === s.value ? `2.5px solid ${s.color}` : '1.5px solid var(--sand-200)',
                          background: form.severity === s.value ? s.bg : 'var(--white)',
                          color: form.severity === s.value ? s.color : 'var(--sand-600)', transition: 'all 0.15s',
                        }}>{s.label}</button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 3 — Location Picker ── */}
              {step === 3 && (
                <div className="stagger-1">
                  <div style={{ marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--ink)', letterSpacing: '-0.3px' }}>
                      Set the exact location
                    </h2>
                    <p style={{ fontSize: '12.5px', color: 'var(--sand-600)', marginTop: '4px' }}>
                      Pinpoint the issue on the map. This helps our field teams find and resolve it quickly.
                    </p>
                  </div>

                  <div style={{
                    background: 'var(--green-50)', border: '1px solid var(--green-100)',
                    borderRadius: '10px', padding: '10px 14px', marginBottom: 16,
                    fontSize: 12, color: 'var(--green-600)', lineHeight: 1.6
                  }}>
                    💡 <strong>Tip:</strong> You don't have to be at the location! Search the area, zoom in, and tap to drop a pin at the exact spot.
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                    <div>
                      <label style={{
                        fontSize: '10px', fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase',
                        color: 'var(--sand-400)', display: 'block', marginBottom: 8
                      }}>
                        State / UT
                      </label>
                      <StateSelector value={form.state} onChange={(v) => { set('state', v); set('ward_id', ''); setStateGeojson(null); setDistrictGeojson(null); }} />
                    </div>
                    <div>
                      <label style={{
                        fontSize: '10px', fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase',
                        color: 'var(--sand-400)', display: 'block', marginBottom: 8
                      }}>
                        District
                      </label>
                      <DistrictSelector state={form.state} value={form.ward_id} onChange={(v) => set('ward_id', v)} />
                    </div>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <LocationPicker
                      onLocationSelect={(loc) => setMapLoc({
                        latitude: loc.lat,
                        longitude: loc.lng,
                        address: loc.address
                      })}
                      onDistrictSelect={(district) => set('ward_id', district)}
                      onStateDetected={(detectedState) => set('state', detectedState)}
                      onBoundaryFetched={handleBoundaryFetched}
                      state={form.state}
                      district={form.ward_id}
                      initialLat={gpsLoc?.latitude || 17.9784}
                      initialLng={gpsLoc?.longitude || 79.5941}
                    />
                    {errors.location && (
                      <div className="form-error" style={{ marginTop: 6 }}>{errors.location}</div>
                    )}
                    {errors.ward_id && (
                      <div className="form-error" style={{ marginTop: 6 }}>{errors.ward_id}</div>
                    )}
                  </div>

                  {mapLoc && (
                    <NearbyWarning latitude={mapLoc.latitude} longitude={mapLoc.longitude} />
                  )}

                  {mapLoc && (
                    <div style={{ marginBottom: 16, animation: 'fadeSlideUp 0.3s ease both' }}>
                      <label style={{
                        fontSize: '10px', fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase',
                        color: 'var(--sand-400)', display: 'block', marginBottom: 6
                      }}>
                        Landmark note (optional)
                      </label>
                      <input className="form-input"
                        placeholder="e.g. near the school gate, behind bus stop..."
                        value={form.address} onChange={e => set('address', e.target.value)} />
                    </div>
                  )}
                </div>
              )}

              {/* ── STEP 4 — Preview ── */}
              {step === 4 && (
                <div className="stagger-1">
                  {/* Custom Step 4 Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '48px', height: '48px', flexShrink: 0 }}>
                        {/* Beautiful clipboard SVG */}
                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="8" y="10" width="32" height="34" rx="4" fill="#E8F5E9" stroke="#2E7D32" strokeWidth="2" />
                          <rect x="18" y="6" width="12" height="6" rx="1" fill="#2E7D32" />
                          <circle cx="24" cy="22" r="6" fill="#2E7D32" />
                          <path d="M22 22 L24 24 L27 20" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <line x1="16" y1="32" x2="32" y2="32" stroke="#2E7D32" strokeWidth="2" strokeLinecap="round" />
                          <line x1="16" y1="38" x2="32" y2="38" stroke="#2E7D32" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </div>
                      <div>
                        <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#1E293B', margin: 0, fontFamily: 'var(--font-display)' }}>
                          Review and submit
                        </h2>
                        <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px', margin: 0 }}>
                          Please review all details below before submitting your report.
                        </p>
                      </div>
                    </div>
                    
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      background: '#F0FDF4', border: '1px solid #DCFCE7',
                      borderRadius: '12px', padding: '10px 20px', maxWidth: '320px'
                    }}>
                      <div style={{
                        width: '24px', height: '24px', borderRadius: '50%', background: '#166534',
                        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold'
                      }}>✓</div>
                      <div>
                        <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#166534', lineHeight: '1.2' }}>Almost done!</div>
                        <div style={{ fontSize: '11px', color: '#15803D', marginTop: '2px' }}>Please verify the details before submitting.</div>
                      </div>
                    </div>
                  </div>

                  {/* Main Preview Card */}
                  <div style={{
                    background: 'var(--white)', border: '1.5px solid var(--sand-100)',
                    borderRadius: '16px', overflow: 'hidden', marginBottom: 24, boxShadow: 'var(--shadow-sm)'
                  }}>
                    {/* Card Header (Report Summary) */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '16px 24px', borderBottom: '1px solid #F1F5F9'
                    }}>
                      <div style={{
                        background: '#E8F5E9', color: '#2E7D32', width: '28px', height: '28px', borderRadius: '6px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                        </svg>
                      </div>
                      <span style={{ fontSize: '15px', fontWeight: '800', color: '#1E293B', fontFamily: 'var(--font-display)' }}>Report Summary</span>
                    </div>

                    {/* 2-Column Grid Layout */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      background: 'var(--white)'
                    }}>
                      {/* Cell 1: Issue Type */}
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '20px 24px', borderRight: '1px solid #F1F5F9', borderBottom: '1px solid #F1F5F9'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{
                            width: '40px', height: '40px', borderRadius: '50%',
                            background: '#F5F3FF', color: '#7C3AED',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              <line x1="10" y1="11" x2="10" y2="17"></line>
                              <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                          </div>
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748B' }}>Issue Type</div>
                            <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--ink)', marginTop: '2px' }}>
                              {CATEGORIES.find(c => c.value === form.category)?.title || form.category}
                            </div>
                          </div>
                        </div>
                        {aiDetected && (
                          <span style={{
                            background: '#F5F3FF', color: '#6B21A8', borderRadius: '20px',
                            padding: '4px 12px', fontSize: '11px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px'
                          }}>
                            ✨ AI Detected
                          </span>
                        )}
                      </div>

                      {/* Cell 2: Severity */}
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '20px 24px', borderBottom: '1px solid #F1F5F9'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{
                            width: '40px', height: '40px', borderRadius: '50%',
                            background: '#FFF7ED', color: '#EA580C',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                              <line x1="12" y1="9" x2="12" y2="13"></line>
                              <line x1="12" y1="17" x2="12.01" y2="17"></line>
                            </svg>
                          </div>
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748B' }}>Severity</div>
                            <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--ink)', marginTop: '2px' }}>
                              {SEVERITIES.find(s => s.value === form.severity)?.label || form.severity}
                            </div>
                          </div>
                        </div>
                        <span style={{
                          background: '#FFF7ED', color: '#C2410C', borderRadius: '20px',
                          padding: '4px 12px', fontSize: '11px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px'
                        }}>
                          ⭐ {form.severity === 'high' ? 'High Priority' : form.severity === 'medium' ? 'Moderate Priority' : 'Low Priority'}
                        </span>
                      </div>

                      {/* Cell 3: Location */}
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '20px 24px', borderRight: '1px solid #F1F5F9', borderBottom: '1px solid #F1F5F9',
                        minWidth: 0
                      }}>
                        <div style={{ display: 'flex', alignItems: 'start', gap: '16px', flex: 1, minWidth: 0 }}>
                          <div style={{
                            width: '40px', height: '40px', borderRadius: '50%',
                            background: '#F0FDF4', color: '#16A34A',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                              <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748B' }}>Location</div>
                            <div style={{ fontSize: '13px', color: 'var(--ink)', marginTop: '4px', lineHeight: 1.4, wordBreak: 'break-word' }}>
                              {mapLoc?.address || `${finalLoc?.latitude?.toFixed(4)}, ${finalLoc?.longitude?.toFixed(4)}`}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => setStep(3)}
                          style={{
                            background: 'none', border: '1.5px solid #E2E8F0', borderRadius: '20px',
                            padding: '4px 12px', fontSize: '11.5px', fontWeight: '700', color: '#1E293B',
                            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', flexShrink: 0, marginLeft: '12px'
                          }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon>
                          </svg>
                          View on map
                        </button>
                      </div>

                      {/* Cell 4: State */}
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '20px 24px', borderBottom: '1px solid #F1F5F9'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{
                            width: '40px', height: '40px', borderRadius: '50%',
                            background: '#EFF6FF', color: '#2563EB',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon>
                              <line x1="9" y1="3" x2="9" y2="18"></line>
                              <line x1="15" y1="6" x2="15" y2="21"></line>
                            </svg>
                          </div>
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748B' }}>State</div>
                            <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--ink)', marginTop: '2px' }}>
                              {form.state || '—'}
                            </div>
                          </div>
                        </div>
                        {/* Large State shape preview */}
                        {stateGeojson && renderLargeBoundarySvg(stateGeojson, 'state')}
                      </div>

                      {/* Cell 5: District */}
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '20px 24px', borderRight: '1px solid #F1F5F9'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{
                            width: '40px', height: '40px', borderRadius: '50%',
                            background: '#F0FDFA', color: '#0D9488',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                              <line x1="9" y1="22" x2="9" y2="16"></line>
                              <line x1="15" y1="22" x2="15" y2="16"></line>
                            </svg>
                          </div>
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748B' }}>District</div>
                            <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--ink)', marginTop: '2px' }}>
                              {form.ward_id || '—'}
                            </div>
                          </div>
                        </div>
                        {/* Large District shape preview */}
                        {districtGeojson && renderLargeBoundarySvg(districtGeojson, 'district')}
                      </div>

                      {/* Cell 6: Description */}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '16px',
                        padding: '20px 24px', minWidth: 0
                      }}>
                        <div style={{
                          width: '40px', height: '40px', borderRadius: '50%',
                          background: '#FDF2F8', color: '#DB2777',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                          </svg>
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748B' }}>Description</div>
                          <div style={{ fontSize: '13px', color: 'var(--ink)', marginTop: '4px', lineHeight: 1.4, wordBreak: 'break-word' }}>
                            {form.description}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Info Banner */}
                    <div style={{
                      background: '#F0F9FF', borderTop: '1px solid #E0F2FE',
                      padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      gap: '16px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '50%', background: '#1E40AF',
                          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0
                        }}>
                          🛡️
                        </div>
                        <div>
                          <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#1E3A8A' }}>
                            Please verify the details carefully
                          </div>
                          <div style={{ fontSize: '11.5px', color: '#1E40AF', marginTop: '2px', lineHeight: 1.4 }}>
                            Once submitted, your report will be sent to the concerned authorities for action.
                          </div>
                        </div>
                      </div>
                      
                      {/* Shield with lock icon */}
                      <div style={{ height: '40px', opacity: 0.9, flexShrink: 0 }}>
                        <svg width="60" height="40" viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="20" y="5" width="20" height="30" rx="3" fill="#DBEAFE" stroke="#1E40AF" strokeWidth="1.5"/>
                          <rect x="25" y="2" width="10" height="5" rx="1" fill="#1E40AF"/>
                          <path d="M25 15 L28 18 L34 12" stroke="#1E40AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M25 25 L28 28 L34 22" stroke="#1E40AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M5 25 C 3 20, 10 15, 13 20" fill="#93C5FD" opacity="0.6"/>
                          <path d="M53 20 C 50 15, 57 10, 55 18" fill="#93C5FD" opacity="0.6"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {isEmergency && (
                    <div style={{
                      background: '#FEE2E2', border: '1.5px solid #FECACA', borderRadius: '10px',
                      padding: '10px 14px', fontSize: '12px', color: '#991B1B', fontWeight: 600, marginBottom: 16
                    }}>
                      ⚠️ Emergency Category — our emergency dispatch team is standing by.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Stepper Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px', borderTop: '1px solid var(--sand-100)', paddingTop: '20px' }}>
              <div style={{ display: 'flex', gap: 14 }}>
                {step > 1 && (
                  <AnimatedButton 
                    className="btn-outline btn-md" 
                    style={{ 
                      flex: 1, height: '48px', borderRadius: '12px', fontSize: '14px', fontWeight: '700',
                      border: '1.5px solid var(--sand-200, #e6e6df)', background: '#fff', color: 'var(--ink)'
                    }}
                    onClick={() => setStep(s => s - 1)}
                  >
                    ← Back
                  </AnimatedButton>
                )}

                {step < 4 ? (
                  <AnimatedButton
                    className="btn-green btn-md"
                    style={{ flex: 2, height: '48px', background: 'var(--green-600)', color: '#fff', fontSize: '14px', fontWeight: '800', borderRadius: '12px' }}
                    onClick={() => {
                      if (step === 1) {
                        setStep(2);
                      } else if (step === 2) {
                        if (!form.description?.trim()) {
                          setErrors({ description: 'Please describe the issue' });
                          showToast('Please describe the issue', 'error');
                        } else {
                          setStep(3);
                        }
                      } else if (step === 3) {
                        if (validate()) {
                          setStep(4);
                        } else {
                          showToast('Please select location and district', 'error');
                        }
                      }
                    }}
                  >
                    {step === 1 ? 'Next: Add Details →' : step === 2 ? 'Next: Pick Location →' : 'Next: Preview →'}
                  </AnimatedButton>
                ) : (
                  <AnimatedButton
                    className={`btn-md ${isEmergency ? 'btn-danger' : 'btn-green'}`}
                    style={{ 
                      flex: 2, height: '48px', fontSize: '14px', fontWeight: '800', 
                      background: isEmergency ? '#DC2626' : '#1e5c28', color: '#fff', borderRadius: '12px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}
                    onClick={handleSubmit} disabled={loading}
                  >
                    {loading ? (
                      <><span className="spinner" style={{ marginRight: 8 }} />Submitting...</>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="22" y1="2" x2="11" y2="13"></line>
                          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                        {isEmergency ? 'Submit Emergency' : 'Submit Issue'}
                      </>
                    )}
                  </AnimatedButton>
                )}
              </div>
              
              {step === 4 && (
                <div style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  fontSize: '12px', color: 'var(--sand-600)', marginTop: '4px'
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  Your report is safe and secure with us
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Right Column (Sidebar Widgets) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '90px' }}>
          {/* Card 1: India, Our Responsibility */}
          <div className="card" style={{ padding: '20px', border: '1.5px solid var(--sand-100)', borderRadius: '16px', background: 'var(--white)', overflow: 'hidden' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--ink)', marginBottom: '4px', fontFamily: 'var(--font-display)' }}>
              India, Our Responsibility
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--sand-600)', lineHeight: '1.4', marginBottom: '14px', fontWeight: '500' }}>
              Small actions by you lead to a big change for our country.
            </p>
            <IndiaGateIllustration />
          </div>

          {/* Card 2: Reporting Tips */}
          <div className="card" style={{ padding: '20px', border: '1.5px solid var(--sand-100)', borderRadius: '16px', background: 'var(--white)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--ink)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-display)' }}>
              <span style={{ fontSize: '14px' }}>💡</span> Reporting Tips
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { title: 'Be specific', desc: 'Provide clear and accurate information about the issue.', icon: '📝' },
                { title: 'Add photos', desc: 'Photos help us understand and resolve issues faster.', icon: '📸' },
                { title: 'Exact location', desc: 'Pin the exact location for quicker resolution.', icon: '📍' },
                { title: 'Track progress', desc: 'You can track the status of your report in real-time.', icon: '📈' }
              ].map((tip, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'start' }}>
                  <div style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: 'var(--green-50)',
                    color: 'var(--green-600)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    flexShrink: 0
                  }}>
                    {tip.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--ink)' }}>{tip.title}</div>
                    <div style={{ fontSize: '10.5px', color: 'var(--sand-600)', lineHeight: '1.4', marginTop: '2px' }}>{tip.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Emergency Issue? */}
          <div className="card" style={{
            padding: '20px',
            border: '1.5px solid #FECACA',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #FFF1F2 0%, #FFF5F5 100%)',
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#991B1B', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-display)' }}>
              🚨 Emergency Issue?
            </h3>
            <p style={{ fontSize: '11px', color: '#7F1D1D', lineHeight: '1.4', marginBottom: '14px', fontWeight: '500' }}>
              Select EMERGENCY categories for urgent attention from our team.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  set('category', 'medical_waste');
                  setStep(2);
                  showToast('Emergency category selected. Please upload photo/provide details.', 'info');
                }}
                style={{
                  flex: 1,
                  height: '40px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#DC2626',
                  color: '#fff',
                  fontWeight: '700',
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(220,38,38,0.2)',
                  fontFamily: 'var(--font)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#B91C1C';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#DC2626';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Report Emergency
              </button>
              <button
                onClick={() => showToast('Emergency reporting lines are fully active.', 'info')}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  border: '1.5px solid #FCA5A5',
                  background: 'none',
                  color: '#DC2626',
                  fontSize: '15px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#FFE4E6';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'none';
                }}
              >
                🔔
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}