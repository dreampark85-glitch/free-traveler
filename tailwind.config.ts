import type { Config } from "tailwindcss";

/**
 * D-001 디자인 토큰 (design-reference/D-001/DESIGN.md §2~§6).
 * 표에 없는 색상·크기는 추가하지 않는다. 필요하면 D-002 발행 절차를 거친다.
 * globals.css가 `@config`로 이 파일을 불러온다.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#FFFFFF",
        "surface-soft": "#F7F6F3",
        "surface-strong": "#F0EEE9",
        hairline: "#E4E1DA",
        "hairline-soft": "#EFEDE8",
        ink: "#242327",
        body: "#4B4A52",
        muted: "#6E6D76",
        "muted-soft": "#9B9AA2",
        // D-002: 글자·버튼 배경에 쓰는 코랄은 WCAG AA(4.5:1)를 만족하도록 어둡게 보정했다.
        coral: "#C03A16",
        "coral-hover": "#A93313",
        // D-001 원색. 글자·버튼에는 쓰지 않고 로고 점 같은 장식에만 쓴다.
        "coral-accent": "#E85A34",
        "coral-tint": "#FCE7DE",
        "on-coral": "#FFFFFF",
        info: "#2A5FD9",
        warning: "#B45309",
        "warning-bg": "#FDF3E6",
        danger: "#C21E33",
        "danger-bg": "#FBEAEA",
        success: "#1F8A57",
        "success-bg": "#EAF6EF",
        scrim: "rgba(36, 35, 39, 0.4)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "Apple SD Gothic Neo",
          "Malgun Gothic",
          "맑은 고딕",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
      },
      fontSize: {
        "display-xl": ["36px", { fontWeight: "700" }],
        "display-lg": ["28px", { fontWeight: "700" }],
        "display-md": ["22px", { fontWeight: "600" }],
        "title-md": ["18px", { fontWeight: "600" }],
        "title-sm": ["16px", { fontWeight: "600" }],
        "body-lg": ["17px", { fontWeight: "400" }],
        "body-md": ["15px", { fontWeight: "400" }],
        "body-sm": ["14px", { fontWeight: "400" }],
        caption: ["13px", { fontWeight: "500" }],
        button: ["16px", { fontWeight: "600" }],
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "12px",
        base: "16px",
        lg: "24px",
        xl: "32px",
        xxl: "48px",
        "section-desktop-min": "64px",
        "section-desktop-max": "96px",
        "section-mobile-min": "40px",
        "section-mobile-max": "64px",
      },
      borderRadius: {
        sm: "8px",
        md: "14px",
        lg: "20px",
        full: "9999px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(36, 35, 39, 0.06), 0 8px 20px rgba(36, 35, 39, 0.08)",
      },
    },
  },
};

export default config;
