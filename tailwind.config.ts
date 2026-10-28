import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // 탐정견 팔레트: 브라운 / 베이지 / 옐로우-오렌지 포인트
        bark: {
          50: "#f7f0e8",
          100: "#ecdcc8",
          200: "#d9bc98",
          300: "#c29a6c",
          400: "#a87a48",
          500: "#8b5e34",
          600: "#6f4a29",
          700: "#563820",
          800: "#3e2917",
          900: "#2a1b0f",
        },
        cream: {
          50: "#fffdf8",
          100: "#fff8ec",
          200: "#fdf0d8",
          300: "#f8e3bd",
        },
        honey: {
          300: "#ffe08a",
          400: "#ffd24d",
          500: "#ffc21a",
          600: "#f0a800",
        },
        carrot: {
          400: "#ff9a4d",
          500: "#ff7a1a",
          600: "#e8620a",
        },
      },
      fontFamily: {
        display: ["var(--font-jua)", "system-ui", "sans-serif"],
        body: ["var(--font-dodum)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        chunk: "0 4px 0 0 rgba(86, 56, 32, 0.9)",
        "chunk-orange": "0 5px 0 0 #c24e00",
        "chunk-yellow": "0 5px 0 0 #b87e00",
        soft: "0 8px 24px -8px rgba(86, 56, 32, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
