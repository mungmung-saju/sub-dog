export type Platform = "ios" | "android";

export interface ServicePreset {
  id: string;
  name: string;
  emoji: string;
  /** 붙여넣기 분석 시 매칭할 키워드(소문자) */
  aliases: string[];
  /** [바로 해지하기] 이동 링크 - 서비스 정책 변경 시 이곳만 수정 */
  cancelUrl: string;
}

export const CUSTOM_SERVICE_ID = "custom";

export const SERVICES: ServicePreset[] = [
  { id: "netflix", name: "넷플릭스", emoji: "🎬", aliases: ["netflix", "넷플릭스"], cancelUrl: "https://www.netflix.com/cancelplan" },
  { id: "chatgpt", name: "ChatGPT", emoji: "🤖", aliases: ["chatgpt", "openai", "챗gpt", "챗지피티"], cancelUrl: "https://help.openai.com/en/articles/6950777-how-do-i-cancel-my-chatgpt-subscription" },
  { id: "coupang", name: "쿠팡 와우", emoji: "🚀", aliases: ["coupang", "쿠팡", "와우"], cancelUrl: "https://www.coupang.com/np/mypage" },
  { id: "youtube", name: "유튜브 프리미엄", emoji: "▶️", aliases: ["youtube", "유튜브", "google youtube"], cancelUrl: "https://www.youtube.com/paid_memberships" },
  { id: "spotify", name: "스포티파이", emoji: "🎧", aliases: ["spotify", "스포티파이"], cancelUrl: "https://www.spotify.com/account/subscription/" },
  { id: "disney", name: "디즈니+", emoji: "🏰", aliases: ["disney", "디즈니"], cancelUrl: "https://www.disneyplus.com/account/subscription" },
  { id: "tving", name: "티빙", emoji: "📺", aliases: ["tving", "티빙"], cancelUrl: "https://www.tving.com" },
  { id: "wavve", name: "웨이브", emoji: "🌊", aliases: ["wavve", "웨이브"], cancelUrl: "https://www.wavve.com" },
  { id: "melon", name: "멜론", emoji: "🍈", aliases: ["melon", "멜론"], cancelUrl: "https://www.melon.com" },
  { id: "icloud", name: "iCloud+", emoji: "☁️", aliases: ["icloud", "아이클라우드"], cancelUrl: "https://apps.apple.com/account/subscriptions" },
  { id: "naver", name: "네이버 플러스", emoji: "🟢", aliases: ["naver", "네이버"], cancelUrl: "https://nid.naver.com/membership" },
  { id: "notion", name: "노션", emoji: "📝", aliases: ["notion", "노션"], cancelUrl: "https://www.notion.so/my-account" },
];

export const SUBSCRIPTION_LINKS: Record<Platform, string> = {
  ios: "https://apps.apple.com/account/subscriptions",
  android: "https://play.google.com/store/account/subscriptions",
};

/** [싸게 연장하기] → 내가 운영하는 할인 구독 스토어. 서비스/출처 추적용 UTM 포함 */
export function discountStoreUrl(serviceId: string): string {
  const base = process.env.NEXT_PUBLIC_DISCOUNT_STORE_URL || "https://example.com/store";
  try {
    const url = new URL(base);
    url.searchParams.set("utm_source", "subscription-dog");
    url.searchParams.set("utm_medium", "renew-button");
    url.searchParams.set("service", serviceId);
    return url.toString();
  } catch {
    return base;
  }
}

export function findServicesInText(text: string): { service: ServicePreset; amount?: number }[] {
  const lower = text.toLowerCase();
  const lines = lower.split(/\r?\n/);
  const found: { service: ServicePreset; amount?: number }[] = [];

  for (const service of SERVICES) {
    const hit = service.aliases.some((a) => lower.includes(a));
    if (!hit) continue;
    // 해당 서비스 키워드가 있는 줄에서 "12,900원" 형태 금액을 추출
    const line = lines.find((l) => service.aliases.some((a) => l.includes(a))) ?? "";
    const m = line.match(/([\d]{1,3}(?:,\d{3})+|\d{3,6})\s*원/);
    found.push({ service, amount: m ? Number(m[1].replace(/,/g, "")) : undefined });
  }
  return found;
}
