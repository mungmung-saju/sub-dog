const DAY = 24 * 60 * 60 * 1000;

export function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** "YYYY-MM-DD" to local-midnight Date (avoids timezone drift) */
export function fromISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function startOfToday(): Date {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}

export function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}

export function diffDays(a: Date, b: Date): number {
  return Math.round((a.getTime() - b.getTime()) / DAY);
}

function clampDay(y: number, m: number, day: number): Date {
  const last = new Date(y, m + 1, 0).getDate();
  return new Date(y, m, Math.min(day, last));
}

/** Monthly recurring billing: roll forward month by month to the nearest upcoming billing date. */
export function nextBillingDate(iso: string, today = startOfToday()): Date {
  const base = fromISO(iso);
  const day = base.getDate();
  let y = base.getFullYear();
  let m = base.getMonth();
  let cand = clampDay(y, m, day);
  let guard = 0;
  while (cand < today && guard++ < 600) {
    m += 1;
    if (m > 11) {
      m = 0;
      y += 1;
    }
    cand = clampDay(y, m, day);
  }
  return cand;
}

/** Billing date of a monthly recurring subscription inside (year, month); null if before its start. */
export function billingDateInMonth(iso: string, year: number, month: number): Date | null {
  const base = fromISO(iso);
  const first = new Date(year, month, 1);
  if (first < new Date(base.getFullYear(), base.getMonth(), 1)) return null;
  const d = clampDay(year, month, base.getDate());
  return d < base ? null : d;
}

// Sun..Sat in Korean (unicode escapes keep this file encoding-safe)
const WEEKDAYS = ["\uC77C", "\uC6D4", "\uD654", "\uC218", "\uBAA9", "\uAE08", "\uD1A0"];

export function formatKoreanDate(d: Date): string {
  return `${d.getMonth() + 1}\uC6D4 ${d.getDate()}\uC77C (${WEEKDAYS[d.getDay()]})`;
}

export function dDayLabel(n: number): string {
  if (n === 0) return "D-DAY";
  if (n > 0) return `D-${n}`;
  return `D+${Math.abs(n)}`;
}
