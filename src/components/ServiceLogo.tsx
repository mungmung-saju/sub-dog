"use client";

import { useId } from "react";
import { CUSTOM_SERVICE_ID } from "../lib/services";

interface ServiceLogoProps {
  id: string;
  size?: number;
  className?: string;
}

/**
 * 브랜드 컬러·심볼을 담은 앱 아이콘 스타일 인라인 SVG.
 * 외부 이미지 URL 없이 렌더되므로 깨지지 않음.
 */
export default function ServiceLogo({ id, size = 36, className = "" }: ServiceLogoProps) {
  const uid = useId().replace(/:/g, "");

  return (
    <span
      className={`inline-flex shrink-0 overflow-hidden rounded-xl shadow-[0_1px_3px_rgba(42,27,15,0.18)] ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg viewBox="0 0 36 36" width={size} height={size} className="block" role="img">
        {mark(id, uid)}
      </svg>
    </span>
  );
}

function mark(id: string, uid: string) {
  switch (id) {
    case "netflix":
      return (
        <g>
          <rect width="36" height="36" rx="9" fill="#141414" />
          <path d="M10 8h4.2l7.6 14.2V8H26v20h-4.2L14.2 13.8V28H10V8z" fill="#E50914" />
          <path d="M14.2 8h2.8l8.8 16.5V8H26v20h-2.8L14.2 11.5V28h-4.2V8h4.2z" fill="#B20710" opacity="0.35" />
        </g>
      );
    case "chatgpt":
      return (
        <g>
          <rect width="36" height="36" rx="9" fill="#10A37F" />
          <g fill="none" stroke="#fff" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 10.2c1.9-.05 3.3 1.2 3.5 2.9.1.9-.1 1.7-.6 2.3" />
            <path d="M22.8 13.8c1.6.9 2.2 2.9 1.4 4.5-.4.8-1.1 1.3-1.9 1.5" />
            <path d="M23.2 21.2c.4 1.8-.9 3.5-2.7 3.9-.9.2-1.8 0-2.5-.5" />
            <path d="M16.5 25.2c-1.8.5-3.7-.5-4.3-2.2-.3-.9-.1-1.8.4-2.5" />
            <path d="M11.2 19.8c-1.5-1.1-1.8-3.2-.7-4.7.5-.7 1.3-1.2 2.2-1.3" />
            <path d="M13.2 12.5c-.3-1.8 1-3.5 2.8-3.8.9-.2 1.8.1 2.4.7" />
            <path d="M18 14.2a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4z" fill="#fff" stroke="none" />
            <path d="M18 15.5v5.2M15.6 16.8l4.8 2.8M15.6 19.6l4.8-2.8" strokeWidth="1.45" />
          </g>
        </g>
      );
    case "coupang":
      return (
        <g>
          <rect width="36" height="36" rx="9" fill="#fff" />
          <rect x="0.75" y="0.75" width="34.5" height="34.5" rx="8.25" fill="none" stroke="#EAEAEA" strokeWidth="1.5" />
          <path
            d="M18.4 7.2c3.9 1.1 6.7 4.5 7.1 8.5.2 1.9-.3 3.6-1.2 5.1l-1.7 2.7-2.3-1.3 1.4-2.3c.6-1 .8-2.2.7-3.4-.4-2.9-2.5-5.3-5.3-6.2-2.8-.9-5.7.2-7.3 2.6l-1.3 1.9-.3-2.6C9.5 9.8 13.6 6.4 18.4 7.2z"
            fill="#E52528"
          />
          <path d="M12.4 20.2l2.5 4.6c.4.8 1.4 1 2.1.5l1.3-.8-3.1-5.3-2.8 1z" fill="#346AFF" />
          <circle cx="20" cy="14" r="1.55" fill="#fff" />
          <path d="M9 26.2h18" stroke="#E52528" strokeWidth="2" strokeLinecap="round" />
          <text
            x="18"
            y="31.4"
            textAnchor="middle"
            fill="#111"
            fontSize="4.3"
            fontWeight="800"
            fontFamily="Arial, Helvetica, sans-serif"
            letterSpacing="-0.15"
          >
            coupang
          </text>
        </g>
      );
    case "youtube":
      return (
        <g>
          <rect width="36" height="36" rx="9" fill="#FF0000" />
          <path d="M15 13.2v9.6L25 18 15 13.2z" fill="#fff" />
        </g>
      );
    case "spotify":
      return (
        <g>
          <rect width="36" height="36" rx="9" fill="#1ED760" />
          <g fill="none" stroke="#191414" strokeWidth="2.25" strokeLinecap="round">
            <path d="M11.2 15c4-1.5 9.6-1.2 13.2 1.1" />
            <path d="M12 19.1c3.3-1.2 7.9-1 11 0.85" />
            <path d="M12.9 23c2.7-.85 6.3-.65 8.7.65" />
          </g>
        </g>
      );
    case "disney":
      return (
        <g>
          <defs>
            <linearGradient id={`dplus-${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#040714" />
              <stop offset="100%" stopColor="#113CCF" />
            </linearGradient>
          </defs>
          <rect width="36" height="36" rx="9" fill={`url(#dplus-${uid})`} />
          <path
            d="M6.2 16.8c4.6-5.6 11.2-8.3 17.8-7.2 2.3.4 4.4 1.2 6.2 2.4"
            fill="none"
            stroke="#fff"
            strokeWidth="1.45"
            strokeLinecap="round"
          />
          <circle cx="28.8" cy="11.2" r="1.35" fill="#fff" />
          <text
            x="18"
            y="24.8"
            textAnchor="middle"
            fill="#fff"
            fontSize="7.4"
            fontFamily="Georgia, 'Times New Roman', serif"
            fontStyle="italic"
            fontWeight="700"
          >
            Disney+
          </text>
        </g>
      );
    case "tving":
      return (
        <g>
          <rect width="36" height="36" rx="9" fill="#FF153C" />
          <text
            x="18"
            y="22.6"
            textAnchor="middle"
            fill="#fff"
            fontSize="8.2"
            fontWeight="900"
            fontFamily="Arial Black, Arial, sans-serif"
            letterSpacing="0.4"
          >
            TVING
          </text>
        </g>
      );
    case "wavve":
      return (
        <g>
          <rect width="36" height="36" rx="9" fill="#1351F9" />
          <path
            d="M7.2 13.2l3.9 12c.3.95 1.55 1.05 2.05.2L18 14l4.9 11.4c.5.85 1.75.75 2.05-.2l3.9-12"
            fill="none"
            stroke="#fff"
            strokeWidth="2.55"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M9 25c4.2 2.6 13.8 2.6 18 0" fill="none" stroke="#9DC0FF" strokeWidth="1.35" strokeLinecap="round" />
        </g>
      );
    case "melon":
      return (
        <g>
          <rect width="36" height="36" rx="9" fill="#00CD3C" />
          <circle cx="18" cy="19.2" r="9.4" fill="#fff" />
          <circle cx="18" cy="19.2" r="6.7" fill="#00CD3C" />
          <circle cx="18" cy="19.2" r="3.1" fill="#fff" />
          <path d="M18 7.8c0 3.1 2.1 4.8 4.3 5.3-1.7.15-4.3-1.1-4.3-5.3z" fill="#fff" />
          <path d="M18 7.8c0 3.1-2.1 4.8-4.3 5.3 1.7.15 4.3-1.1 4.3-5.3z" fill="#B8F5C8" />
        </g>
      );
    case "icloud":
      return (
        <g>
          <defs>
            <linearGradient id={`icloud-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5AC8FA" />
              <stop offset="100%" stopColor="#007AFF" />
            </linearGradient>
          </defs>
          <rect width="36" height="36" rx="9" fill={`url(#icloud-${uid})`} />
          <path
            d="M12.4 23.8h12.2c2.2 0 4-1.75 4-3.95 0-2-.15-3.65-3.5-3.95.1-.4.15-.8.15-1.2 0-3-2.45-5.4-5.45-5.4-2.15 0-4 1.25-4.85 3-.6-.4-1.35-.6-2.15-.6-2.15 0-3.9 1.65-4 3.75-1.85.35-3.2 1.95-3.2 3.85 0 2.2 1.75 4 3.95 4h2.85z"
            fill="#fff"
          />
        </g>
      );
    case "naver":
      return (
        <g>
          <rect width="36" height="36" rx="9" fill="#03C75A" />
          <path d="M11.2 10.2h4.3l5.4 8.5V10.2H25v15.6h-4.3l-5.4-8.5v8.5H11.2V10.2z" fill="#fff" />
          <circle cx="27.6" cy="9.4" r="5.1" fill="#fff" />
          <path d="M27.6 6.9v5M25.1 9.4h5" stroke="#03C75A" strokeWidth="1.85" strokeLinecap="round" />
        </g>
      );
    case "notion":
      return (
        <g>
          <rect width="36" height="36" rx="9" fill="#fff" />
          <rect x="1.1" y="1.1" width="33.8" height="33.8" rx="7.9" fill="none" stroke="#111" strokeWidth="1.7" />
          <path
            d="M11.2 11.2h11.2l2.4 2.1V26H14.3L11.6 23.8V11.2z"
            fill="#fff"
            stroke="#111"
            strokeWidth="1.45"
            strokeLinejoin="round"
          />
          <path d="M11.2 11.2l2.7 2.1h11" fill="none" stroke="#111" strokeWidth="1.25" />
          <path d="M22.4 11.2V26" fill="none" stroke="#111" strokeWidth="1.15" opacity="0.45" />
          <text x="17.1" y="23.2" textAnchor="middle" fill="#111" fontSize="11" fontFamily="Georgia, serif" fontWeight="700">
            N
          </text>
        </g>
      );
    case CUSTOM_SERVICE_ID:
      return (
        <g>
          <rect width="36" height="36" rx="9" fill="#FFF8EC" />
          <rect
            x="2.2"
            y="2.2"
            width="31.6"
            height="31.6"
            rx="7.8"
            fill="none"
            stroke="#FF7A1A"
            strokeWidth="1.8"
            strokeDasharray="3.5 2.5"
          />
          <path
            d="M13.2 22.8l9.2-9.2 2.1 2.1-9.2 9.2-2.7.65.6-2.75z"
            fill="none"
            stroke="#8B5E34"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path d="M21 15.1l2.1 2.1" stroke="#FF7A1A" strokeWidth="1.8" strokeLinecap="round" />
        </g>
      );
    default:
      // unknown / legacy custom entries stored with free-text serviceId
      return (
        <g>
          <rect width="36" height="36" rx="9" fill="#8B5E34" />
          <circle cx="14" cy="15.2" r="3.1" fill="#FFC21A" />
          <circle cx="22" cy="15.2" r="3.1" fill="#FFC21A" />
          <ellipse cx="18" cy="23.2" rx="6" ry="3.4" fill="#FFC21A" />
          <circle cx="12.6" cy="11.6" r="1.55" fill="#FFC21A" />
          <circle cx="15.5" cy="10.1" r="1.45" fill="#FFC21A" />
          <circle cx="20.5" cy="10.1" r="1.45" fill="#FFC21A" />
          <circle cx="23.4" cy="11.6" r="1.55" fill="#FFC21A" />
        </g>
      );
  }
}
