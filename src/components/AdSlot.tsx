interface AdSlotProps {
  /** 광고 규격 라벨 (placeholder 표시용) */
  format?: "rectangle" | "banner";
  className?: string;
}

const SIZES = {
  rectangle: { w: 300, h: 250, label: "300 × 250" },
  banner: { w: 320, h: 100, label: "320 × 100" },
};

/**
 * 광고 배너 영역 (플레이스홀더).
 * 실제 광고 연동 시 이 컴포넌트 내부의 <div data-ad-slot> 안을
 * AdSense <ins class="adsbygoogle"> 등으로 교체하면 레이아웃은 그대로 유지됩니다.
 * 규격 고정(min-height)으로 광고 로딩 시 레이아웃 시프트를 방지합니다.
 */
export default function AdSlot({ format = "rectangle", className = "" }: AdSlotProps) {
  const s = SIZES[format];
  return (
    <div className={`mx-auto w-full max-w-[300px] ${className}`}>
      <div className="mb-1 text-center text-[11px] tracking-widest text-bark-400">AD · 광고</div>
      <div
        data-ad-slot={format}
        style={{ minHeight: s.h, aspectRatio: `${s.w} / ${s.h}` }}
        className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-bark-300 bg-cream-200/70 text-bark-400"
      >
        <span className="text-2xl">🦴</span>
        <span className="mt-1 font-display text-base">광고 배너 영역</span>
        <span className="text-xs">{s.label}</span>
      </div>
    </div>
  );
}
