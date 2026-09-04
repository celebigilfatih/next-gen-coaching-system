const DAY_MS = 86_400_000;

export function startOfLocalWeek(date: Date) {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const offset = result.getDay() === 0 ? 6 : result.getDay() - 1;
  result.setDate(result.getDate() - offset);
  return result;
}

export function addDays(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

export function toLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseWeekStart(value: string | null, today = new Date()) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return startOfLocalWeek(today);
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(year, month - 1, day);
  if (Number.isNaN(parsed.getTime())) return startOfLocalWeek(today);
  return startOfLocalWeek(parsed);
}

export function weekDays(start: Date) {
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

export function sameLocalDay(value: string | Date, date: Date) {
  const candidate = typeof value === 'string' ? new Date(value) : value;
  return toLocalDateKey(candidate) === toLocalDateKey(date);
}

export function weekLabel(start: Date) {
  const end = addDays(start, 6);
  const startLabel = new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
  }).format(start);
  const endLabel = new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(end);
  return `${startLabel} – ${endLabel}`;
}

export { DAY_MS };
