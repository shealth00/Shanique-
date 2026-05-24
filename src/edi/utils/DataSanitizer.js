'use strict';

// X12 reserved delimiter characters that must be stripped from field values
const RESERVED_CHARS = /[*~^:|]/g;

// X12 allows only printable ASCII (0x20–0x7E); strip everything outside that range
const NON_PRINTABLE = /[^\x20-\x7E]/g;

/**
 * Strip X12 delimiters and non-printable characters from a string value,
 * then truncate to the specified maximum element length.
 */
function sanitize(value, maxLength) {
  if (value === null || value === undefined) return '';
  const cleaned = String(value)
    .replace(NON_PRINTABLE, '')
    .replace(RESERVED_CHARS, '')
    .trim();
  return maxLength ? cleaned.slice(0, maxLength) : cleaned;
}

/**
 * Format a date string (YYYY-MM-DD or Date object) to CCYYMMDD.
 * Returns '' when input is falsy or unparseable.
 */
function formatDate(value) {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  if (isNaN(d.getTime())) return '';
  const yy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yy}${mm}${dd}`;
}

/**
 * Format a time value to HHMM for X12 DTP segments.
 */
function formatTime(value) {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  if (isNaN(d.getTime())) return '';
  return String(d.getUTCHours()).padStart(2, '0') +
         String(d.getUTCMinutes()).padStart(2, '0');
}

/**
 * Pad a string on the right with spaces to reach exactly `length` chars.
 * Used for ISA fixed-width fields.
 */
function padRight(value, length) {
  return String(value ?? '').slice(0, length).padEnd(length, ' ');
}

/**
 * Strip all non-digit characters (used for NPI, Tax ID, ZIP, phone).
 */
function digitsOnly(value) {
  return String(value ?? '').replace(/\D/g, '');
}

/**
 * Normalise a currency amount to a string with exactly two decimal places.
 * X12 monetary elements use the pattern ####.## with no trailing zeros
 * beyond cents — but "0.00" is a valid amount.
 */
function formatAmount(value) {
  const n = parseFloat(value);
  if (isNaN(n)) return '0.00';
  return n.toFixed(2);
}

/**
 * Convert a state name or abbreviation to the 2-char postal code.
 * Passes through values that are already 2 chars.
 */
function stateCode(value) {
  if (!value) return '';
  const s = String(value).trim().toUpperCase();
  if (s.length === 2) return s;
  const MAP = {
    ALABAMA: 'AL', ALASKA: 'AK', ARIZONA: 'AZ', ARKANSAS: 'AR',
    CALIFORNIA: 'CA', COLORADO: 'CO', CONNECTICUT: 'CT', DELAWARE: 'DE',
    FLORIDA: 'FL', GEORGIA: 'GA', HAWAII: 'HI', IDAHO: 'ID',
    ILLINOIS: 'IL', INDIANA: 'IN', IOWA: 'IA', KANSAS: 'KS',
    KENTUCKY: 'KY', LOUISIANA: 'LA', MAINE: 'ME', MARYLAND: 'MD',
    MASSACHUSETTS: 'MA', MICHIGAN: 'MI', MINNESOTA: 'MN', MISSISSIPPI: 'MS',
    MISSOURI: 'MO', MONTANA: 'MT', NEBRASKA: 'NE', NEVADA: 'NV',
    'NEW HAMPSHIRE': 'NH', 'NEW JERSEY': 'NJ', 'NEW MEXICO': 'NM',
    'NEW YORK': 'NY', 'NORTH CAROLINA': 'NC', 'NORTH DAKOTA': 'ND',
    OHIO: 'OH', OKLAHOMA: 'OK', OREGON: 'OR', PENNSYLVANIA: 'PA',
    'RHODE ISLAND': 'RI', 'SOUTH CAROLINA': 'SC', 'SOUTH DAKOTA': 'SD',
    TENNESSEE: 'TN', TEXAS: 'TX', UTAH: 'UT', VERMONT: 'VT',
    VIRGINIA: 'VA', WASHINGTON: 'WA', 'WEST VIRGINIA': 'WV',
    WISCONSIN: 'WI', WYOMING: 'WY', 'DISTRICT OF COLUMBIA': 'DC'
  };
  return MAP[s] || s.slice(0, 2);
}

module.exports = { sanitize, formatDate, formatTime, padRight, digitsOnly, formatAmount, stateCode };
