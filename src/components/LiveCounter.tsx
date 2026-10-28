"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";

const START = 124_500_000;

/** 더미 라이브 카운터: 주기적으로 랜덤 금액이 부드럽게 올라간다 */
export default function LiveCounter() {
  const [value, setValue] = useState(START);
  const target = useRef(START);
  const current = useRef(START);

  useEffect(() => {
    const tick = setInterval(() => {
      target.current += 3_000 + Math.floor(Math.random() * 14_000);
      animate(current.current, target.current, {
        duration: 1,
        ease: "easeOut",
        onUpdate: (v) => {
          current.current = v;
          setValue(Math.round(v));
        },
      });
    }, 2200);
    return () => clearInterval(tick);
  }, []);

  return (
    <div className="card text-center">
      <p className="text-sm text-bark-500">🐾 지금까지 탐지견이 찾아준 누적 구독료</p>
      <p className="mt-1 font-display text-3xl tabular-nums text-carrot-600" aria-live="off">
        {value.toLocaleString("ko-KR")}
        <span className="ml-0.5 text-2xl">원</span>
      </p>
      <p className="mt-1 flex items-center justify-center gap-1.5 text-xs text-bark-400">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-carrot-500 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-carrot-500" />
        </span>
        실시간으로 늘어나는 중
      </p>
      <p className="mt-0.5 text-[10px] text-bark-300">※ 연출용 예시 수치입니다</p>
    </div>
  );
}
