// src/constants/penalties.js

/**
 * Penalty Codes for race results
 */
export const PENALTY_CODES = {
  DNS: 'DNS',  // Did Not Start
  DNF: 'DNF',  // Did Not Finish
  DSQ: 'DSQ',  // Disqualified
  OCS: 'OCS',  // On Course Side (Frühstart)
  BFD: 'BFD',  // Black Flag Disqualification
  RET: 'RET',  // Retired
  DNC: 'DNC'   // Did Not Come
};

/**
 * Order of penalty codes for sorting (numeric lookup by code)
 */
export const PENALTY_ORDER = {
  [PENALTY_CODES.DNF]: 0,
  [PENALTY_CODES.DNS]: 1,
  [PENALTY_CODES.DNC]: 2,
  [PENALTY_CODES.DSQ]: 3,
  [PENALTY_CODES.OCS]: 4,
  [PENALTY_CODES.BFD]: 5,
  [PENALTY_CODES.RET]: 6
};
