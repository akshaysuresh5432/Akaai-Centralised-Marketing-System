export function parseDate(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function toISODate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function todayISO() {
  return toISODate(new Date());
}

export function addDays(iso: string, days: number) {
  const date = parseDate(iso);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

export function startOfWeek(iso: string) {
  const date = parseDate(iso);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return toISODate(date);
}

export function startOfMonth(iso: string) {
  const date = parseDate(iso);
  date.setDate(1);
  return toISODate(date);
}

export function sameDay(a: string, b: string) {
  return a.slice(0, 10) === b.slice(0, 10);
}

export function formatDay(iso: string, opts?: Intl.DateTimeFormatOptions) {
  return parseDate(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    ...opts,
  });
}

export function formatShort(iso: string) {
  return parseDate(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatWeekday(iso: string) {
  return parseDate(iso).toLocaleDateString("en-US", { weekday: "short" });
}

export function isPast(iso: string, relativeTo = todayISO()) {
  return iso.slice(0, 10) < relativeTo;
}

export function isUpcoming(iso: string, withinDays = 3, relativeTo = todayISO()) {
  return iso.slice(0, 10) >= relativeTo && iso.slice(0, 10) <= addDays(relativeTo, withinDays);
}

export function daysBetween(a: string, b: string) {
  const ms = parseDate(b).getTime() - parseDate(a).getTime();
  return Math.round(ms / 86400000);
}

export function monthMatrix(iso: string) {
  const start = parseDate(startOfMonth(iso));
  const firstWeekday = start.getDay();
  const lead = firstWeekday === 0 ? 6 : firstWeekday - 1;
  const cursor = new Date(start);
  cursor.setDate(cursor.getDate() - lead);
  const weeks: string[][] = [];
  for (let w = 0; w < 6; w++) {
    const week: string[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(toISODate(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

export function weekDays(iso: string) {
  const start = parseDate(startOfWeek(iso));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return toISODate(d);
  });
}

export function shiftMonth(iso: string, delta: number) {
  const date = parseDate(iso);
  date.setMonth(date.getMonth() + delta);
  return startOfMonth(toISODate(date));
}
