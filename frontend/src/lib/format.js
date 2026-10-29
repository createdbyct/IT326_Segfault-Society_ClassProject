export const pad2 = (n) => String(n).padStart(2, '0');
export const fmt1 = (n) => (n == null ? '—' : (Math.round(Number(n) * 10) / 10).toFixed(1));
export const pct = (n) => (n == null ? '—' : `${Math.round(n)}%`);
export function shortDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }).toUpperCase();
}
export function monthYear(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' }).toUpperCase();
}
export function initials(name = '') {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || parts[0]?.[1] || '')).toUpperCase();
}
/** Current academic term label, e.g. "Spring 2027" for registration season. */
export function upcomingTerm(d = new Date()) {
  const m = d.getMonth();
  return m >= 8 ? `Spring ${d.getFullYear() + 1}` : m >= 3 ? `Fall ${d.getFullYear()}` : `Spring ${d.getFullYear()}`;
}
