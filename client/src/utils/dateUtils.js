/**
 * Central date formatting utility.
 * Dates in the DB are stored as "YYYY-MM-DD".
 * All display should use "DD/MM/YYYY".
 */

/**
 * Converts "YYYY-MM-DD" → "DD/MM/YYYY"
 * Returns the original string if the format is unrecognised.
 */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return dateStr;
  return `${match[3]}/${match[2]}/${match[1]}`;
}

/**
 * Converts "YYYY-MM-DD" → "DD/MM/YYYY HH:mm"
 */
export function formatDateTime(dateStr, timeStr) {
  return `${formatDate(dateStr)} às ${timeStr || ''}`.trim();
}

/**
 * Returns today as "YYYY-MM-DD" (for use in date inputs and DB comparisons).
 */
export function todayISO() {
  return new Date().toISOString().split('T')[0];
}
