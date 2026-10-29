"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Dog from "../Dog";
import AdSlot from "../AdSlot";
import AlarmSection from "../AlarmSection";
import { addToPhoneCalendar } from "../../lib/calendar";
import { CUSTOM_SERVICE_ID, SERVICES, discountStoreUrl } from "../../lib/services";
import {
  addDays,
  billingDateInMonth,
  dDayLabel,
  formatKoreanDate,
  fromISO,
  startOfToday,
  toISO,
} from "../../lib/dates";
import type { SubKind, SubView, Subscription } from "../../lib/subscriptions";

interface Props {
  views: SubView[];
  onAdd: (s: Omit<Subscription, "id" | "createdAt">) => void;
  onRemove: (id: string) => void;
  onBack: () => void;
  prefill: { serviceId: string; price?: number } | null;
}

export default function CalendarScreen({ views, onAdd, onRemove, onBack, prefill }: Props) {
  return (
    <div className="px-5 pb-8 pt-4 safe-bottom">
      <button onClick={onBack} className="py-2 text-sm text-bark-500">
        ← 뒤로
      </button>

      <header className="flex items-center gap-3">
        <Dog size={84} mood={views.length ? "happy" : "idle"} />
        <div>
          <h2 className="font-display text-[22px] leading-tight text-bark-800">무료체험 해지 알리미</h2>
          <p className="text-sm text-bark-500">
            등록하면 결제 <b className="text-carrot-600">3일 전</b>에
            <br />
            해지하라고 구독이가 짖어줄게! 🐕
          </p>
        </div>
      </header>

      <RegisterForm onAdd={onAdd} prefill={prefill} />

      <MonthView views={views} />

      <section className="mt-6">
        <h3 className="mb-2 font-display text-lg text-bark-800">
          📋 내 구독 목록 <span className="text-carrot-500">{views.length}</span>
        </h3>
        {views.length === 0 ? (
          <div className="card text-center text-sm text-bark-500">
            아직 등록된 구독이 없어요.
            <br />
            위에서 서비스를 골라 결제일을 등록해 보세요!
          </div>
        ) : (
          <ul className="space-y-3">
            <AnimatePresence initial={false}>
              {views.map((v) => (
                <SubCard key={v.id} v={v} onRemove={() => onRemove(v.id)} />
              ))}
            </AnimatePresence>
          </ul>
        )}
      </section>

      <AlarmSection views={views} />

      <AdSlot format="banner" className="mt-8" />
    </div>
  );
}

/* ───────────── 등록 폼 ───────────── */

function RegisterForm({ onAdd, prefill }: Pick<Props, "onAdd" | "prefill">) {
  const [serviceId, setServiceId] = useState(prefill?.serviceId ?? SERVICES[0].id);
  const [customName, setCustomName] = useState("");
  const [kind, setKind] = useState<SubKind>("trial");
  const [date, setDate] = useState(() => toISO(addDays(startOfToday(), 7)));
  const [price, setPrice] = useState(prefill?.price ? String(prefill.price) : "");
  const [error, setError] = useState("");

  const isCustom = serviceId === CUSTOM_SERVICE_ID;
  const preset = SERVICES.find((s) => s.id === serviceId);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const name = isCustom ? customName.trim() : preset?.name;
    if (!name) return setError("서비스 이름을 입력해 주세요.");
    if (!date) return setError("날짜를 선택해 주세요.");
    setError("");
    onAdd({
      serviceId,
      name,
      emoji: preset?.emoji ?? "🐾",
      kind,
      date,
      price: price ? Number(price) : undefined,
      cancelUrl: preset?.cancelUrl ?? `https://www.google.com/search?q=${encodeURIComponent(name + " 구독 해지")}`,
    });
    setCustomName("");
    setPrice("");
  }

  return (
    <form onSubmit={submit} className="card mt-5 space-y-4">
      <div>
        <p className="mb-2 font-display text-base text-bark-800">1. 어떤 구독이에요?</p>
        <div className="grid grid-cols-3 gap-2">
          {[...SERVICES, { id: CUSTOM_SERVICE_ID, name: "직접 입력", emoji: "✏️" }].map((s) => {
            const on = s.id === serviceId;
            return (
              <button
                type="button"
                key={s.id}
                onClick={() => setServiceId(s.id)}
                aria-pressed={on}
                className={`flex min-h-[64px] flex-col items-center justify-center rounded-2xl border-2 px-1 py-2 text-[13px] leading-tight transition ${
                  on
                    ? "border-carrot-500 bg-honey-300/60 font-bold text-bark-900"
                    : "border-bark-100 bg-white text-bark-600"
                }`}
              >
                <span className="text-xl">{s.emoji}</span>
                <span className="mt-0.5">{s.name}</span>
              </button>
            );
          })}
        </div>
        {isCustom && (
          <input
            className="field mt-2"
            placeholder="서비스 이름 (예: 왓챠)"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            maxLength={30}
          />
        )}
      </div>

      <div>
        <p className="mb-2 font-display text-base text-bark-800">2. 어떤 날짜예요?</p>
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-bark-100/70 p-1">
          {(
            [
              ["trial", "🎁 무료체험 종료일"],
              ["billing", "💳 매월 결제일"],
            ] as const
          ).map(([k, label]) => (
            <button
              type="button"
              key={k}
              onClick={() => setKind(k)}
              aria-pressed={kind === k}
              className={`min-h-[44px] rounded-xl text-sm transition ${
                kind === k ? "bg-white font-bold text-bark-800 shadow-sm" : "text-bark-500"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <input
          type="date"
          className="field mt-2"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          aria-label="날짜"
        />
        <input
          type="number"
          inputMode="numeric"
          min={0}
          className="field mt-2"
          placeholder="월 결제 금액 (선택, 원)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button type="submit" className="btn-orange">
        🐾 구독이에게 맡기기
      </button>
    </form>
  );
}

/* ───────────── 월간 캘린더 ───────────── */

function MonthView({ views }: { views: SubView[] }) {
  const today = startOfToday();
  const [cursor, setCursor] = useState({ y: today.getFullYear(), m: today.getMonth() });

  const marks = useMemo(() => {
    const map = new Map<string, { due: string[]; alert: string[] }>();
    const put = (d: Date, kind: "due" | "alert", name: string) => {
      const k = toISO(d);
      const cur = map.get(k) ?? { due: [], alert: [] };
      cur[kind].push(name);
      map.set(k, cur);
    };
    for (const v of views) {
      const due = v.kind === "billing" ? billingDateInMonth(v.date, cursor.y, cursor.m) : fromISO(v.date);
      if (!due) continue;
      put(due, "due", v.name);
      put(addDays(due, -3), "alert", v.name);
    }
    return map;
  }, [views, cursor]);

  const first = new Date(cursor.y, cursor.m, 1);
  const lead = first.getDay();
  const days = new Date(cursor.y, cursor.m + 1, 0).getDate();
  const cells = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];

  const shift = (n: number) => {
    const d = new Date(cursor.y, cursor.m + n, 1);
    setCursor({ y: d.getFullYear(), m: d.getMonth() });
  };

  return (
    <section className="card mt-5">
      <div className="mb-2 flex items-center justify-between">
        <button onClick={() => shift(-1)} aria-label="이전 달" className="h-11 w-11 rounded-full text-xl active:bg-bark-100">
          ‹
        </button>
        <h3 className="font-display text-lg">
          {cursor.y}년 {cursor.m + 1}월
        </h3>
        <button onClick={() => shift(1)} aria-label="다음 달" className="h-11 w-11 rounded-full text-xl active:bg-bark-100">
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 text-center text-xs text-bark-400">
        {["일", "월", "화", "수", "목", "금", "토"].map((w, i) => (
          <span key={w} className={`py-1 ${i === 0 ? "text-red-400" : ""}`}>
            {w}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {cells.map((d, i) => {
          if (!d) return <span key={`b${i}`} />;
          const iso = toISO(new Date(cursor.y, cursor.m, d));
          const mark = marks.get(iso);
          const isToday = iso === toISO(today);
          return (
            <div
              key={iso}
              title={mark ? [...mark.due.map((n) => `${n} 결제/종료`), ...mark.alert.map((n) => `${n} 알림`)].join(", ") : undefined}
              className={`mx-auto flex h-10 w-10 flex-col items-center justify-center rounded-full text-sm ${
                isToday ? "border-2 border-bark-700 font-bold" : ""
              } ${mark?.due.length ? "bg-carrot-500 font-bold text-white" : mark?.alert.length ? "bg-honey-400/70" : ""}`}
            >
              {d}
              {mark?.alert.length && !mark.due.length ? <span className="-mt-0.5 text-[8px] leading-none">🔔</span> : null}
            </div>
          );
        })}
      </div>
      <p className="mt-2 flex flex-wrap justify-center gap-x-3 text-[11px] text-bark-500">
        <span>
          <i className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-carrot-500" />
          결제·체험 종료
        </span>
        <span>
          <i className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-honey-400" />
          3일 전 알림
        </span>
      </p>
    </section>
  );
}

/* ───────────── 구독 카드 ───────────── */

function SubCard({ v, onRemove }: { v: SubView; onRemove: () => void }) {
  const urgent = v.daysLeft <= 3;
  const [alarmed, setAlarmed] = useState(false);

  function addAlarm() {
    addToPhoneCalendar([v]);
    setAlarmed(true);
    setTimeout(() => setAlarmed(false), 3000);
  }
  return (
    <motion.li
      layout
      initial={{ opacity: 0, scale: 0.92, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, x: -60 }}
      className={`card ${urgent ? "!border-carrot-500 !bg-honey-300/30" : ""}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl">{v.emoji}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-lg text-bark-800">{v.name}</p>
          <p className="text-sm text-bark-600">
            {v.kind === "trial" ? "🎁 무료체험 종료" : "💳 다음 결제"} · {formatKoreanDate(v.due)}
          </p>
          <p className="text-xs text-bark-400">
            🔔 알림 {formatKoreanDate(v.alertDate)} 오전 9시
            {v.price ? ` · ${v.price.toLocaleString("ko-KR")}원` : ""}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span
            className={`rounded-full px-2.5 py-0.5 font-display text-sm ${
              urgent ? "bg-carrot-500 text-white" : "bg-bark-100 text-bark-700"
            }`}
          >
            {dDayLabel(v.daysLeft)}
          </span>
          <button
            type="button"
            onClick={addAlarm}
            aria-label={`${v.name} 폰 알람 켜기`}
            className="min-h-[36px] whitespace-nowrap rounded-full border-2 border-bark-700 bg-white px-2.5 text-xs font-bold text-bark-700 active:scale-95"
          >
            {alarmed ? "✅ 완료!" : "🔔 폰 알람 켜기"}
          </button>
          <button onClick={onRemove} aria-label={`${v.name} 삭제`} className="h-8 px-1 text-xs text-bark-400 underline">
            삭제
          </button>
        </div>
      </div>

      {urgent && v.daysLeft >= 0 && (
        <p className="mt-2 rounded-xl bg-white/70 px-3 py-1.5 text-sm text-carrot-600">
          🐕 멍멍! 곧 결제돼요. 계속 안 쓸 거면 지금 해지하세요!
        </p>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2">
        <a
          href={v.cancelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-brown !min-h-[52px] !rounded-xl !text-base"
        >
          바로 해지하기
        </a>
        <a
          href={discountStoreUrl(v.serviceId)}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="btn-orange !min-h-[52px] !rounded-xl !text-base"
        >
          싸게 연장하기
        </a>
      </div>
    </motion.li>
  );
}
