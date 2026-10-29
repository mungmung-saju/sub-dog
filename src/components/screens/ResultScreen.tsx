"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Dog from "../Dog";
import AdSlot from "../AdSlot";
import ServiceLogo from "../ServiceLogo";
import { SUBSCRIPTION_LINKS, findServicesInText, type Platform } from "../../lib/services";

interface Props {
  platform: Platform;
  onSwitchPlatform: (p: Platform) => void;
  onAddFromPaste: (serviceId: string, price?: number) => void;
  onOpenCalendar: () => void;
  onBack: () => void;
}

export default function ResultScreen({ platform, onSwitchPlatform, onAddFromPaste, onOpenCalendar, onBack }: Props) {
  const [text, setText] = useState("");
  const [result, setResult] = useState<ReturnType<typeof findServicesInText> | null>(null);

  const isIOS = platform === "ios";
  const href = SUBSCRIPTION_LINKS[platform];

  return (
    <div className="px-5 pb-6 pt-4 safe-bottom">
      <button onClick={onBack} className="py-2 text-sm text-bark-500">
        ← 처음으로
      </button>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center"
      >
        <Dog size={150} mood="happy" magnifier />
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="mt-1 rounded-full bg-honey-500 px-3 py-1 font-display text-sm text-bark-800"
        >
          ✅ 탐지 완료!
        </motion.span>
        <h2 className="mt-3 font-display text-[22px] leading-snug text-bark-800">
          내 폰에 숨어있는 정기결제 내역을
          <br />
          <span className="text-carrot-500">최종 확인해 봐!</span>
        </h2>
      </motion.section>

      {/* 시스템 구독 관리창 */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mt-5">
        <a href={href} target="_blank" rel="noopener noreferrer" className="btn-orange !min-h-[68px] !text-xl">
          내 폰 구독 관리창 열기 ↗
        </a>
        <p className="mt-2 text-center text-xs text-bark-500">
          {isIOS ? "🍎 앱스토어 구독 화면으로 바로 이동해요" : "🤖 구글 플레이 구독 화면으로 바로 이동해요"} · 스마트폰에서 눌러야 계정으로 바로
          연결돼요
        </p>
        <button
          onClick={() => onSwitchPlatform(isIOS ? "android" : "ios")}
          className="mx-auto mt-1 block text-xs text-bark-400 underline underline-offset-2"
        >
          {isIOS ? "갤럭시(안드로이드) 링크로 바꾸기" : "아이폰(iOS) 링크로 바꾸기"}
        </button>
      </motion.div>

      {/* 자매품: 붙여넣기 */}
      <section className="card mt-6">
        <h3 className="font-display text-lg text-bark-800">🐕 혹시 PC나 웹으로 결제한 게 있다면?</h3>
        <p className="mt-0.5 text-sm text-bark-500">카드 앱 스크랩이나 결제 문자 내역을 붙여넣어 보세요.</p>
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setResult(null);
          }}
          rows={3}
          placeholder={"예) [카드승인] 넷플릭스 17,000원\n쿠팡 와우 7,890원 결제"}
          className="field mt-3 resize-none text-[15px]"
        />
        <button
          disabled={!text.trim()}
          onClick={() => setResult(findServicesInText(text))}
          className="btn-yellow mt-3 !min-h-[52px] disabled:opacity-40"
        >
          🔍 킁킁, 냄새 맡기
        </button>
        <p className="mt-2 text-sm font-semibold leading-snug text-bark-600">
          🔒 분석한 내용은 따로 보관되지 않아 개인정보 걱정하지 않아도 괜찮아요!
        </p>

        {result && (
          <div className="mt-3 space-y-2">
            {result.length === 0 ? (
              <p className="rounded-xl bg-cream-200 p-3 text-sm text-bark-600">
                🐶 아직 아는 서비스 냄새는 안 나요. 아래 캘린더에서 직접 등록할 수 있어요!
              </p>
            ) : (
              result.map(({ service, amount }) => (
                <div key={service.id} className="flex items-center gap-2 rounded-xl bg-cream-200 p-2.5">
                  <ServiceLogo id={service.id} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-base text-bark-800">{service.name}</p>
                    <p className="text-xs text-bark-500">{amount ? `${amount.toLocaleString("ko-KR")}원 결제 감지` : "결제 흔적 발견"}</p>
                  </div>
                  <button
                    onClick={() => onAddFromPaste(service.id, amount)}
                    className="rounded-full bg-carrot-500 px-3 py-2 font-display text-sm text-white active:scale-95"
                  >
                    + 알림 등록
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </section>

      {/* 메인 셀링 포인트로 연결 */}
      <button onClick={onOpenCalendar} className="btn-brown mt-6 flex-col !gap-0 !py-4">
        <span>📅 무료체험 해지 알리미 등록하기</span>
        <span className="font-body text-xs text-cream-300">결제 3일 전에 구독이가 짖어줄게!</span>
      </button>

      <AdSlot format="banner" className="mt-6" />
    </div>
  );
}
