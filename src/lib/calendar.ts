import { addDays, diffDays, fromISO, nextBillingDate, startOfToday } from "./dates";
import { discountStoreUrl } from "./services";
import type { SubView } from "./subscriptions";

/** 100% 클라이언트 사이드: 서버/외부 API 없이 .ics 파일과 구글 캘린더 URL을 만든다. */

export const ALERT_DAYS_BEFORE = 3;
export const ALERT_HOUR = 9; // 오전 9시
const EVENT_MINUTES = 30;
const EXPLICIT_MONTHS = 12;

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
  return nominal; // 이미 결제일까지 지난 경우
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

  // 매월 결제일
  const billingDay = fromISO(v.date).getDate();
  // 결제일이 4~28일이면 알림일(1~25일)이 모든 달에 존재 -> RRULE 로 정확히 반복 가능
  const cleanMonthly = billingDay >= ALERT_DAYS_BEFORE + 1 && billingDay <= 28;

  if (cleanMonthly) {
    const nominal = at9(addDays(v.due, -ALERT_DAYS_BEFORE));
    if (nominal > now) return [make("series", v.due, nominal, "FREQ=MONTHLY")];
    // 이번 달 알림 시각은 이미 지남: 이번 회차 1회 알람 + 다음 회차부터 매월 반복
    const nextDue = nextBillingDate(v.date, addDays(v.due, 1));
    return [
      make("once", v.due, resolveStart(v.due, now)),
      make("series", nextDue, at9(addDays(nextDue, -ALERT_DAYS_BEFORE)), "FREQ=MONTHLY"),
    ];
  }

  // 1~3일 / 29~31일 결제: 달마다 '3일 전' 날짜가 달라지므로 앞으로 12회차를 개별 일정으로 생성
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

/** RFC 5545: 한 줄은 75옥텟 이하, 넘으면 CRLF + 공백으로 접는다 (UTF-8 바이트 기준, 문자 단위로 자름) */
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
        // 일정 시작 시각(= 결제 3일 전 오전 9시)에 잠금화면 알림
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

function isIOS(): boolean {
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

/** .ics 를 브라우저에서 즉시 실행/다운로드. iOS 는 열면 '캘린더에 추가' 시트가 뜬다. */
export function downloadIcs(ics: string, filename: string): void {
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  if (isIOS()) {
    if (!window.open(url, "_blank")) window.location.assign(url);
  } else {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

/** 구독 목록 -> .ics 생성 + 즉시 실행 (서버 호출 없음) */
export function addToPhoneCalendar(views: SubView[], filename = "subscription-dog-alarm.ics"): void {
  downloadIcs(buildIcs(views, window.location.origin), filename);
}

/* ───────────── Google Calendar ───────────── */

/** 구독 1건을 구글 캘린더 '일정 만들기' URL 로 변환 (월 반복이면 RRULE 포함) */
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
