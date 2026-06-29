import { useMemo } from 'react';
import indiaStatesDistricts from '../data/indiaStatesDistricts.json';
 
// Standalone State/UT dropdown. District is intentionally NOT included here —
// it's still auto-detected from the map pin via LocationPicker's
// onDistrictSelect, which sets form.ward_id. This component only captures
// the State/UT as additional metadata.
export default function StateSelector({ value, onChange }) {
  const stateNames = useMemo(
    () => Object.keys(indiaStatesDistricts).sort((a, b) => a.localeCompare(b)),
    []
  );
 
  return (
    <select
      className="form-input"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="" disabled>Select State / UT</option>
      {stateNames.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  );
}
