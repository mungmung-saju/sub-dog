import { addDays, diffDays, fromISO, nextBillingDate, startOfToday } from "./dates";
import { discountStoreUrl } from "./services";
import type { SubKind, SubView } from "./subscriptions";

/**
 * .ics / 구글 캘린더 알람 생성.
 * 아이폰(사파리·인앱)은 blob:/data: URL 과 window.open 을 차단하므로,
 * 실제 파일은 /api/ics 가 text/calendar + Content-Disposition: inline 으로 스트리밍한다.
 */

export const ALERT_DAYS_BEFORE = 3;
export const ALERT_HOUR = 9; // 오전 9시
const EVENT_MINUTES = 30;
const EXPLICIT_MONTHS = 12;

/** API 쿼리스트링으로 주고받는 최소 구독 데이터 (Date 직렬화 불필요) */
export interface IcsItem {
  id: string;
  serviceId: string;
  name: string;
  emoji: string;
  kind: SubKind;
  date: string; // YYYY-MM-DD
  price?: number;
}

export interface AlarmEvent {
  uid: string;
  /** 사용자 로컬 시각 기준(타임존 없는 floating time) */
  start: Date;
  title: string;
  description: string;
  rrule?: string;
}

/* ───────────── 시간 계산 ───────────── */

const pad = (n: number) => String(n).padStart(2, "0");

function at9(day: Date): Date {
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), ALERT_HOUR, 0, 0);
}

function fmtLocal(d: Date): string {
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function fmtUtc(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function endOf(start: Date): Date {
  return new Date(start.getTime() + EVENT_MINUTES * 60 * 1000);
}

/** 결제일 3일 전 오전 9시. 이미 지났다면 결제일 전 가장 가까운 오전 9시로 당겨서 알람이 울리게 한다. */
function resolveStart(due: Date, now: Date): Date {
  const nominal = at9(addDays(due, -ALERT_DAYS_BEFORE));
  if (nominal > now) return nominal;
  const today = startOfToday();
  for (let i = 0; i <= ALERT_DAYS_BEFORE; i++) {
    const day = addDays(today, i);
    if (day > due) break;
    if (at9(day) > now) return at9(day);
  }
  return nominal;
}

function itemToView(s: IcsItem): SubView {
  const today = startOfToday();
  const due = s.kind === "billing" ? nextBillingDate(s.date, today) : fromISO(s.date);
  return {
    ...s,
    cancelUrl: "",
    createdAt: 0,
    due,
    daysLeft: diffDays(due, today),
    alertDate: addDays(due, -ALERT_DAYS_BEFORE),
  };
}

export function toIcsPayload(views: SubView[]): IcsItem[] {
  return views.map(({ id, serviceId, name, emoji, kind, date, price }) => ({
    id,
    serviceId,
    name,
    emoji,
    kind,
    date,
    price,
  }));
}

export function parseIcsPayload(raw: string): IcsItem[] {
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed) || parsed.length === 0 || parsed.length > 50) {
    throw new Error("invalid payload");
  }
  return parsed.map((row) => {
    if (!row || typeof row !== "object") throw new Error("invalid item");
    const r = row as Record<string, unknown>;
    if (typeof r.id !== "string" || typeof r.serviceId !== "string" || typeof r.name !== "string") {
      throw new Error("invalid item");
    }
    if (typeof r.emoji !== "string" || typeof r.date !== "string") throw new Error("invalid item");
    if (r.kind !== "trial" && r.kind !== "billing") throw new Error("invalid kind");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(r.date)) throw new Error("invalid date");
    const item: IcsItem = {
      id: r.id.slice(0, 64),
      serviceId: r.serviceId.slice(0, 64),
      name: r.name.slice(0, 40),
      emoji: r.emoji.slice(0, 8),
      kind: r.kind,
      date: r.date,
    };
    if (typeof r.price === "number" && Number.isFinite(r.price) && r.price >= 0) {
      item.price = Math.min(Math.round(r.price), 10_000_000);
    }
    return item;
  });
}

/* ───────────── 이벤트 생성 ───────────── */

function buildText(v: SubView, daysBefore: number, siteUrl: string) {
  const when = daysBefore <= 0 ? "오늘" : `${daysBefore}일 뒤`;
  const label = v.kind === "trial" ? "무료체험 종료일" : "결제일";
  const price = v.price ? ` ${v.price.toLocaleString("ko-KR")}원` : "";
  const title = `🐶 [구독 탐지견] ${when} ${v.name}${price} ${label}! (해지/할인 확인)`;
  const store = discountStoreUrl(v.serviceId, "calendar-alarm");
  const description =
    "잊지 말고 해지하세요! 만약 계속 이용하실 거라면 정가 다 내지 마시고 아래 구독 탐지견 전용 특가 스토어에서 최대 70% 할인가로 연장하세요 👇\n\n" +
    `👉 공식 할인 스토어 바로가기: ${store}\n` +
    `👉 빠른 해지 가이드 보기: ${siteUrl}`;
  return { title, description };
}

export function buildEvents(v: SubView, siteUrl: string, now = new Date()): AlarmEvent[] {
  const make = (suffix: string, due: Date, start: Date, rrule?: string): AlarmEvent => {
    const daysBefore = diffDays(due, new Date(start.getFullYear(), start.getMonth(), start.getDate()));
    return { uid: `${v.id}-${suffix}@subscription-dog`, start, rrule, ...buildText(v, daysBefore, siteUrl) };
  };

  if (v.kind === "trial") {
    return [make("0", v.due, resolveStart(v.due, now))];
  }

  const billingDay = fromISO(v.date).getDate();
  const cleanMonthly = billingDay >= ALERT_DAYS_BEFORE + 1 && billingDay <= 28;

  if (cleanMonthly) {
    const nominal = at9(addDays(v.due, -ALERT_DAYS_BEFORE));
    if (nominal > now) return [make("series", v.due, nominal, "FREQ=MONTHLY")];
    const nextDue = nextBillingDate(v.date, addDays(v.due, 1));
    return [
      make("once", v.due, resolveStart(v.due, now)),
      make("series", nextDue, at9(addDays(nextDue, -ALERT_DAYS_BEFORE)), "FREQ=MONTHLY"),
    ];
  }

  const events: AlarmEvent[] = [];
  let due = v.due;
  for (let i = 0; i < EXPLICIT_MONTHS; i++) {
    const start = i === 0 ? resolveStart(due, now) : at9(addDays(due, -ALERT_DAYS_BEFORE));
    events.push(make(String(i), due, start));
    due = nextBillingDate(v.date, addDays(due, 1));
  }
  return events;
}

/* ───────────── .ics ───────────── */

function escapeText(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** RFC 5545: 한 줄은 75옥텟 이하, 넘으면 CRLF + 공백으로 접는다 */
function fold(line: string): string {
  const enc = new TextEncoder();
  if (enc.encode(line).length <= 75) return line;
  const out: string[] = [];
  let cur = "";
  let bytes = 0;
  for (const ch of line) {
    const b = enc.encode(ch).length;
    if (bytes + b > 75) {
      out.push(cur);
      cur = " ";
      bytes = 1;
    }
    cur += ch;
    bytes += b;
  }
  out.push(cur);
  return out.join("\r\n");
}

export function buildIcs(views: SubView[], siteUrl: string, now = new Date()): string {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Subscription Detective Dog//KO",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:구독 탐지견 알람",
  ];

  for (const v of views) {
    for (const ev of buildEvents(v, siteUrl, now)) {
      lines.push(
        "BEGIN:VEVENT",
        `UID:${ev.uid}`,
        `DTSTAMP:${fmtUtc(now)}`,
        `DTSTART:${fmtLocal(ev.start)}`,
        `DTEND:${fmtLocal(endOf(ev.start))}`,
      );
      if (ev.rrule) lines.push(`RRULE:${ev.rrule}`);
      lines.push(
        `SUMMARY:${escapeText(ev.title)}`,
        `DESCRIPTION:${escapeText(ev.description)}`,
        "TRANSP:TRANSPARENT",
        "BEGIN:VALARM",
        "TRIGGER:-PT0M",
        "ACTION:DISPLAY",
        `DESCRIPTION:${escapeText(ev.title)}`,
        "END:VALARM",
        "END:VEVENT",
      );
    }
  }

  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}

export function buildIcsFromItems(items: IcsItem[], siteUrl: string, now = new Date()): string {
  return buildIcs(items.map(itemToView), siteUrl, now);
}

/** 아이폰·갤럭시 공통: 현재 창에서 /api/ics 로 이동 → 서버가 text/calendar 스트리밍 → 네이티브 캘린더 시트 */
export function icsApiUrl(views: SubView[]): string {
  const data = encodeURIComponent(JSON.stringify(toIcsPayload(views)));
  return `/api/ics?data=${data}`;
}

export function addToPhoneCalendar(views: SubView[]): void {
  if (views.length === 0) return;
  // blob: / window: / window.open 금지 — iOS 가 캘린더 핸들러로 넘기지 않음
  window.location.href = icsApiUrl(views);
}

/* ───────────── Google Calendar ───────────── */

export function buildGoogleCalendarUrl(v: SubView, siteUrl: string, now = new Date()): string {
  const events = buildEvents(v, siteUrl, now);
  const ev = events.find((e) => e.rrule) ?? events[0];
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: ev.title,
    details: ev.description,
    dates: `${fmtLocal(ev.start)}/${fmtLocal(endOf(ev.start))}`,
    ctz: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Seoul",
  });
  if (ev.rrule) params.set("recur", `RRULE:${ev.rrule}`);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
