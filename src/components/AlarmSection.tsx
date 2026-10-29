"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { addToPhoneCalendar, buildGoogleCalendarUrl } from "../lib/calendar";
import type { SubView } from "../lib/subscriptions";

/**
 * [알림받기] - 전화번호/서버 없이, 사용자 폰의 기본 달력에 '결제 3일 전 오전 9시' 알람을 등록한다.
 * 전부 브라우저에서 처리: .ics 파일 실행 또는 구글 캘린더 URL 새 창.
 */
export default function AlarmSection({ views }: { views: SubView[] }) {
  const [done, setDone] = useState(false);
  const [pickGoogle, setPickGoogle] = useState(false);
  const empty = views.length === 0;

  function handleIcs() {
    addToPhoneCalendar(views);
    setDone(true);
  }

  function handleGoogle() {
    if (views.length === 1) {
      window.open(buildGoogleCalendarUrl(views[0], window.location.origin), "_blank", "noopener,noreferrer");
    } else {
      // 구글 캘린더는 URL 1개당 일정 1건 -> 구독별 링크 목록을 펼친다 (팝업 차단 방지)
      setPickGoogle((p) => !p);
    }
  }

  return (
    <section className="card mt-6 !bg-honey-300/40">
      <h3 className="font-display text-lg text-bark-800">🔔 알림받기</h3>
      <p className="text-sm text-bark-600">결제 3일 전 오전 9시, 폰 잠금화면에서 구독이가 짖어줄게!</p>

      <p className="mt-3 break-keep rounded-xl bg-white/80 px-3 py-2 text-sm font-semibold leading-snug text-bark-700">
        🔒 전화번호 입력 없이 내 폰 달력에 1초 만에 알람을 맞춰드려요!
      </p>

      <div className="mt-3 space-y-3">
        <button type="button" onClick={handleIcs} disabled={empty} className="btn-orange !py-3 text-center !text-[17px] leading-snug disabled:opacity-40">
          📲 아이폰·갤럭시 기본 달력에 알람 등록 (.ics)
        </button>
        <button type="button" onClick={handleGoogle} disabled={empty} className="btn-white !py-3 text-center !text-[17px] disabled:opacity-40">
          📅 구글 캘린더로 바로 등록하기
        </button>
      </div>

      {empty && <p className="mt-2 text-xs text-carrot-600">먼저 위에서 구독을 1개 이상 등록해 주세요.</p>}

      <AnimatePresence>
        {pickGoogle && views.length > 1 && (
          <motion.ul
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 space-y-2 overflow-hidden"
          >
            <li className="text-xs text-bark-500">구글 캘린더는 한 번에 일정 1개씩 등록돼요. 구독별로 눌러 주세요 👇</li>
            {views.map((v) => (
              <li key={v.id} className="flex items-center gap-2 rounded-xl bg-white p-2">
                <span className="text-xl">{v.emoji}</span>
                <span className="min-w-0 flex-1 truncate text-sm text-bark-800">{v.name}</span>
                <a
                  href={buildGoogleCalendarUrl(v, typeof window === "undefined" ? "" : window.location.origin)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-bark-700 px-3 py-2 font-display text-sm text-cream-100 active:scale-95"
                >
                  추가 ↗
                </a>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      {done && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 break-keep rounded-xl bg-white p-3 text-sm leading-snug text-bark-700"
          role="status"
        >
          ✅ 알람 파일을 만들었어요!
          <br />
          아이폰은 열리는 화면에서 <b>모두 추가</b>, 갤럭시는 다운로드된 파일을 눌러 <b>캘린더</b>로 추가해 주세요.
        </motion.p>
      )}
    </section>
  );
}
