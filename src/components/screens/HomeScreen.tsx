"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Dog from "../Dog";
import LiveCounter from "../LiveCounter";
import type { Platform } from "../../lib/services";

interface Props {
  onStart: (p: Platform) => void;
  onOpenCalendar: () => void;
  subCount: number;
}

export default function HomeScreen({ onStart, onOpenCalendar, subCount }: Props) {
  const [guess, setGuess] = useState<Platform | null>(null);

  // 접속 기기를 추정해 해당 버튼에 '추천' 뱃지만 표시 (선택은 사용자가 직접)
  useEffect(() => {
    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/i.test(ua)) setGuess("ios");
    else if (/Android/i.test(ua)) setGuess("android");
  }, []);

  return (
    <div className="flex min-h-dvh flex-col px-5 pt-6 safe-bottom">
      <header className="flex items-center justify-center gap-2">
        <span className="rounded-full bg-bark-700 px-3 py-1 font-display text-sm text-honey-400">🔎 구독 탐지견</span>
      </header>

      <section className="mt-4 flex flex-col items-center text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 160, damping: 12 }}
          className="relative"
        >
          <div className="absolute inset-x-6 bottom-2 h-5 rounded-full bg-bark-700/15 blur-md" />
          <Dog size={190} magnifier mood="idle" />
          <motion.span
            className="absolute -right-3 top-2 rounded-2xl rounded-bl-sm bg-honey-500 px-3 py-1 font-display text-sm text-bark-800 shadow-chunk"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 1.4, repeat: Infinity }}
          >
            킁킁!
          </motion.span>
        </motion.div>

        <h1 className="mt-3 font-display text-[26px] leading-snug text-bark-800">
          킁킁.. 나도 모르게 빠져나가는
          <br />
          <span className="text-carrot-500">돈이 있다고?</span>
          <br />
          구독 탐지견이 찾아줄게!
        </h1>
        <p className="mt-2 text-[15px] text-bark-500">내 돈 새는 숨은 구독, 구독이가 3초 만에 냄새 맡아 드려요</p>
      </section>

      <section className="mt-6 space-y-3">
        <button className="btn-brown relative" onClick={() => onStart("ios")}>
          <span className="text-2xl">🍎</span> 아이폰(iOS) 유저용 탐지 시작
          {guess === "ios" && <Badge />}
        </button>
        <button className="btn-orange relative" onClick={() => onStart("android")}>
          <span className="text-2xl">🤖</span> 갤럭시(안드로이드) 유저용 탐지 시작
          {guess === "android" && <Badge />}
        </button>

        <button
          onClick={onOpenCalendar}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-bark-300 bg-cream-100 py-3 font-display text-base text-bark-600 active:scale-[0.98]"
        >
          📅 무료체험 해지 알리미 · 구독 캘린더
          {subCount > 0 && (
            <span className="rounded-full bg-carrot-500 px-2 text-sm text-white">{subCount}</span>
          )}
        </button>
      </section>

      <div className="mt-auto pt-8">
        <LiveCounter />
      </div>
    </div>
  );
}

function Badge() {
  return (
    <span className="absolute -top-2 right-3 rounded-full bg-honey-500 px-2 py-0.5 text-xs text-bark-800 shadow-chunk">
      내 폰 추천
    </span>
  );
}
