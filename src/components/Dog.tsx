"use client";

import { motion } from "framer-motion";

export type DogMood = "idle" | "sniff" | "happy";

interface DogProps {
  size?: number;
  mood?: DogMood;
  magnifier?: boolean;
  className?: string;
}

const box = (origin: string) => ({ transformBox: "fill-box" as const, transformOrigin: origin });

/** 탐정견 '구독이' - 순수 SVG 캐릭터 (외부 이미지 없음) */
export default function Dog({ size = 160, mood = "idle", magnifier = false, className }: DogProps) {
  const sniffing = mood === "sniff";
  const happy = mood === "happy";

  return (
    <motion.div
      className={className}
      style={{ width: size, height: size }}
      animate={
        sniffing
          ? { y: [0, 3, 0], rotate: [-3, 3, -3] }
          : happy
            ? { y: [0, -10, 0] }
            : { y: [0, -3, 0] }
      }
      transition={{ duration: sniffing ? 0.7 : happy ? 0.6 : 2.4, repeat: Infinity, ease: "easeInOut" }}
      aria-hidden
    >
      <svg viewBox="0 0 200 200" width="100%" height="100%" role="img">
        {/* 몸 + 트렌치코트 */}
        <ellipse cx="100" cy="190" rx="52" ry="30" fill="#c89b64" />
        <path d="M70 168 L100 190 L130 168 L122 160 L100 176 L78 160 Z" fill="#8b5e34" />
        <rect x="96" y="176" width="8" height="24" fill="#6f4a29" />

        {/* 꼬리 (살랑살랑) */}
        <motion.path
          d="M150 176 C172 168 178 148 168 138"
          stroke="#6f4a29"
          strokeWidth="9"
          strokeLinecap="round"
          fill="none"
          style={box("0% 100%")}
          animate={{ rotate: happy ? [-18, 18, -18] : [-8, 8, -8] }}
          transition={{ duration: happy ? 0.25 : 0.7, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* 귀 */}
        <motion.path
          d="M54 84 C26 78 14 120 28 154 C44 164 60 130 60 98 Z"
          fill="#6f4a29"
          style={box("90% 0%")}
          animate={{ rotate: sniffing ? [0, -8, 0] : happy ? [0, 10, 0] : [0, -3, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          d="M146 84 C174 78 186 120 172 154 C156 164 140 130 140 98 Z"
          fill="#6f4a29"
          style={box("10% 0%")}
          animate={{ rotate: sniffing ? [0, 8, 0] : happy ? [0, -10, 0] : [0, 3, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
        />

        {/* 얼굴 */}
        <ellipse cx="100" cy="112" rx="58" ry="52" fill="#fffdf8" stroke="#563820" strokeWidth="3" />
        {/* 구독이 얼룩 */}
        <circle cx="76" cy="104" r="21" fill="#6f4a29" />
        <circle cx="132" cy="84" r="9" fill="#8b5e34" opacity="0.85" />

        {/* 눈 (깜빡) */}
        <motion.g
          style={box("50% 50%")}
          animate={{ scaleY: sniffing ? [1, 0.3, 1] : [1, 1, 0.1, 1, 1] }}
          transition={{
            duration: sniffing ? 0.9 : 3.2,
            repeat: Infinity,
            times: sniffing ? undefined : [0, 0.9, 0.94, 0.98, 1],
          }}
        >
          <circle cx="78" cy="104" r="7.5" fill="#2a1b0f" />
          <circle cx="122" cy="104" r="7.5" fill="#2a1b0f" />
          <circle cx="80.5" cy="101.5" r="2.5" fill="#fff" />
          <circle cx="124.5" cy="101.5" r="2.5" fill="#fff" />
        </motion.g>

        {/* 주둥이 */}
        <ellipse cx="100" cy="134" rx="30" ry="21" fill="#fff" stroke="#e7d2b4" strokeWidth="2" />
        <motion.ellipse
          cx="100"
          cy="123"
          rx="11"
          ry="8"
          fill="#2a1b0f"
          style={box("50% 50%")}
          animate={sniffing ? { scale: [1, 1.35, 1], y: [0, -1.5, 0] } : { scale: 1 }}
          transition={{ duration: 0.35, repeat: sniffing ? Infinity : 0 }}
        />
        <ellipse cx="96" cy="120.5" rx="3" ry="1.8" fill="#fff" opacity="0.6" />
        <path
          d="M100 131 V138 M100 138 Q92 146 84 140 M100 138 Q108 146 116 140"
          stroke="#2a1b0f"
          strokeWidth="2.6"
          strokeLinecap="round"
          fill="none"
        />
        {happy && (
          <motion.path
            d="M92 143 Q100 164 108 143 Z"
            fill="#ff8fa3"
            stroke="#d9627a"
            strokeWidth="1.5"
            style={box("50% 0%")}
            animate={{ scaleY: [1, 1.15, 1] }}
            transition={{ duration: 0.4, repeat: Infinity }}
          />
        )}

        {/* 탐정 모자 */}
        <path d="M52 82 C50 26 150 26 148 82 Z" fill="#c89b64" stroke="#563820" strokeWidth="3" strokeLinejoin="round" />
        <path d="M100 30 V82 M76 36 L72 82 M124 36 L128 82" stroke="#a87a48" strokeWidth="2.5" fill="none" />
        <path d="M50 74 Q100 90 150 74 L150 84 Q100 100 50 84 Z" fill="#563820" />
        <circle cx="100" cy="30" r="6" fill="#563820" />

        {/* 돋보기 */}
        {magnifier && (
          <motion.g
            style={box("0% 0%")}
            animate={{ rotate: sniffing ? [-10, 14, -10] : [-4, 4, -4] }}
            transition={{ duration: sniffing ? 0.9 : 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <g transform="translate(150 150)">
              <line x1="14" y1="14" x2="36" y2="36" stroke="#563820" strokeWidth="9" strokeLinecap="round" />
              <circle cx="0" cy="0" r="21" fill="rgba(190,230,255,0.55)" stroke="#ffc21a" strokeWidth="6" />
              <path d="M-11 -6 A13 13 0 0 1 -3 -13" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" />
            </g>
          </motion.g>
        )}
      </svg>
    </motion.div>
  );
}
