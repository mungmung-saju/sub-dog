"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Dog from "../Dog";
import AdSlot from "../AdSlot";

const DURATION = 3;
const HINTS = ["🎬 영상 스트리밍 냄새 킁킁...", "🎧 음악 구독 냄새 킁킁...", "☁️ 클라우드 결제 냄새 킁킁..."];

export default function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [left, setLeft] = useState(DURATION);

  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    const done = setTimeout(() => doneRef.current(), DURATION * 1000);
    const tick = setInterval(() => setLeft((n) => Math.max(1, n - 1)), 1000);
    return () => {
      clearTimeout(done);
      clearInterval(tick);
    };
  }, []);

  const hint = HINTS[Math.min(HINTS.length - 1, DURATION - left)];

  return (
    <div className="flex min-h-dvh flex-col items-center px-5 pt-8 safe-bottom">
      {/* 돌아다니며 냄새 맡는 구독이 */}
      <div className="relative h-[190px] w-full overflow-hidden">
        <motion.div
          className="absolute bottom-0 left-1/2 -ml-[70px]"
          animate={{ x: [-90, 90, -90], scaleX: [1, 1, -1, -1] }}
          transition={{
            x: { duration: 3, ease: "easeInOut", repeat: Infinity },
            scaleX: { duration: 3, ease: "linear", repeat: Infinity, times: [0, 0.49, 0.5, 1] },
          }}
        >
          <Dog size={140} magnifier mood="sniff" />
        </motion.div>

        {/* 발자국 */}
        <div className="absolute bottom-0 left-0 flex w-full justify-around px-6 text-xl opacity-60">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.span
              key={i}
              animate={{ opacity: [0, 1, 0], y: [0, -2, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            >
              🐾
            </motion.span>
          ))}
        </div>
      </div>

      <h2 className="mt-4 text-center font-display text-xl leading-snug text-bark-800">
        구독이가 내 폰 안의 결제 냄새를
        <br />
        추적 중입니다... <span className="text-carrot-500">({left}초)</span>
      </h2>
      <p className="mt-1 h-5 text-sm text-bark-500" aria-live="polite">
        {hint}
      </p>

      {/* 진행 바 */}
      <div className="mt-4 h-4 w-full max-w-[300px] overflow-hidden rounded-full border-2 border-bark-700 bg-cream-100">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-honey-500 to-carrot-500"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: DURATION, ease: "linear" }}
        />
      </div>

      {/* 화면 중앙 광고 영역 */}
      <div className="flex flex-1 items-center py-6">
        <AdSlot format="rectangle" />
      </div>
    </div>
  );
}
