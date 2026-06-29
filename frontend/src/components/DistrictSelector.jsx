import { useMemo } from 'react';
import indiaStatesDistricts from '../data/indiaStatesDistricts.json';

export default function DistrictSelector({ state, value, onChange }) {
  const districts = useMemo(() => {
    if (!state || !indiaStatesDistricts[state]) return [];
    return [...indiaStatesDistricts[state]].sort((a, b) => a.localeCompare(b));
  }, [state]);

  return (
    <select
      className="form-input"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={!state}
      style={{
        cursor: state ? 'pointer' : 'not-allowed',
        opacity: state ? 1 : 0.6
      }}
    >
      <option value="" disabled>
        {state ? 'Select District' : 'Select State / UT first'}
      </option>
      {districts.map((d) => (
        <option key={d} value={d}>
          {d}
        </option>
      ))}
    </select>
  );
}
