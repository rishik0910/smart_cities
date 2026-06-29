import { useMemo } from 'react';
import indiaStatesDistricts from '../data/indiaStatesDistricts.json';

export default function StateDistrictSelect({ state, district, onChange }) {
  const states = useMemo(() => {
    return Object.keys(indiaStatesDistricts).sort((a, b) => a.localeCompare(b));
  }, []);

  const districts = useMemo(() => {
    if (!state || !indiaStatesDistricts[state]) return [];
    return [...indiaStatesDistricts[state]].sort((a, b) => a.localeCompare(b));
  }, [state]);

  const handleStateChange = (e) => {
    const newState = e.target.value;
    onChange({ state: newState, district: '' });
  };

  const handleDistrictChange = (e) => {
    onChange({ state, district: e.target.value });
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
      <div className="authpage-input-wrap-bordered" style={{ paddingLeft: '10px', paddingRight: '10px' }}>
        <select
          value={state || ''}
          onChange={handleStateChange}
          className="authpage-input"
          style={{ 
            width: '100%', 
            background: 'none', 
            border: 'none', 
            color: '#fff', 
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="" disabled style={{ background: '#1a1a18', color: '#888' }}>Select State / UT</option>
          {states.map((s) => (
            <option key={s} value={s} style={{ background: '#1a1a18', color: '#fff' }}>{s}</option>
          ))}
        </select>
      </div>

      <div className="authpage-input-wrap-bordered" style={{ paddingLeft: '10px', paddingRight: '10px' }}>
        <select
          value={district || ''}
          onChange={handleDistrictChange}
          className="authpage-input"
          disabled={!state}
          style={{ 
            width: '100%', 
            background: 'none', 
            border: 'none', 
            color: state ? '#fff' : 'rgba(255,255,255,0.35)', 
            outline: 'none',
            cursor: state ? 'pointer' : 'not-allowed'
          }}
        >
          <option value="" disabled style={{ background: '#1a1a18', color: '#888' }}>Select District</option>
          {districts.map((d) => (
            <option key={d} value={d} style={{ background: '#1a1a18', color: '#fff' }}>{d}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
