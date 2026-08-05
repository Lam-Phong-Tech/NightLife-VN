function parseVietnamDateBoundary(dateStr, isEnd) {
  const trimmed = dateStr.trim();
  const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (dateOnlyRegex.test(trimmed)) {
    const time = isEnd ? '23:59:59.999' : '00:00:00.000';
    return new Date(`${trimmed}T${time}+07:00`);
  }
  const isoMidnightRegex = /^(\d{4}-\d{2}-\d{2})T00:00:00(\.000)?Z?$/;
  const match = trimmed.match(isoMidnightRegex);
  if (match) {
    const datePart = match[1];
    const time = isEnd ? '23:59:59.999' : '00:00:00.000';
    return new Date(`${datePart}T${time}+07:00`);
  }
  const date = new Date(trimmed);
  return date;
}

const start = parseVietnamDateBoundary('2026-08-05', false);
const end = parseVietnamDateBoundary('2026-08-05', true);

// 01:00 AM VN time on Aug 5, 2026
const event01AM = new Date('2026-08-05T01:00:00+07:00');
// 23:59 PM VN time on Aug 5, 2026
const event2359PM = new Date('2026-08-05T23:59:00+07:00');
// 00:01 AM VN time on Aug 6, 2026
const eventNextDay = new Date('2026-08-06T00:01:00+07:00');

console.log('Start (UTC):', start.toISOString());
console.log('End (UTC):', end.toISOString());
console.log('Event 01:00 AM VN (UTC):', event01AM.toISOString(), 'Included?:', event01AM >= start && event01AM <= end);
console.log('Event 23:59 PM VN (UTC):', event2359PM.toISOString(), 'Included?:', event2359PM >= start && event2359PM <= end);
console.log('Event 00:01 AM VN (Next Day, UTC):', eventNextDay.toISOString(), 'Included?:', eventNextDay >= start && eventNextDay <= end);
