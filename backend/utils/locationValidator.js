const fs = require('fs');
const path = require('path');

// Source of truth for all India State/UT names — same JSON the frontend
// dropdown uses, kept in sync manually (copy this file's sibling dataset
// whenever you update one side).
const indiaStatesDistricts = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/indiaStatesDistricts.json'), 'utf-8')
);

/**
 * Returns true if `state` is a recognized State/UT name.
 */
function isValidState(state) {
  return typeof state === 'string' && Object.prototype.hasOwnProperty.call(indiaStatesDistricts, state);
}

module.exports = {
  indiaStatesDistricts,
  isValidState,
};
