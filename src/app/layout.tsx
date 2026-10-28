import type { Metadata, Viewport } from "next";
import { Jua, Gowun_Dodum } from "next/font/google";
import "./globals.css";

const jua = Jua({ weight: "400", subsets: ["latin"], variable: "--font-jua", display: "swap" });
const dodum = Gowun_Dodum({ weight: "400", subsets: ["latin"], variable: "--font-dodum", display: "swap" });

export const metadata: Metadata = {
  title: "구독 탐지견 구독이 | 내 돈 새는 숨은 구독 찾기",
  description: "킁킁.. 나도 모르게 빠져나가는 구독료, 탐지견 구독이가 찾아줄게! 무료체험 해지 알림까지.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fff8ec",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${jua.variable} ${dodum.variable}`}>
      <body className="font-body">{children}</body>
    </html>
  );
}
