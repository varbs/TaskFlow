// Date helpers: always compute relative to "today" so tests never go stale.
function pad(n) { return String(n).padStart(2, '0'); }

function toISO(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** ISO date (YYYY-MM-DD) `offset` days from today. Negative = past. */
function daysFromToday(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return toISO(d);
}

module.exports = { daysFromToday, toISO };
