import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        black: "var(--color-black)",
        panel: "var(--color-panel)",
        "panel-2": "var(--color-panel-2)",
        border: "var(--color-border)",
        magenta: "var(--color-magenta)",
        lime: "var(--color-lime)",
        text: "var(--color-text)",
        "text-dim": "var(--color-text-dim)",
        alert: "var(--color-alert)",
      },
      fontFamily: {
        syne: ["var(--font-syne)", "sans-serif"],
        sans: ["var(--font-dm-sans)", "sans-serif"],
      },
      borderRadius: {
        card: "14px",
        btn: "9px",
        badge: "20px",
      },
      backgroundImage: {
        'marketing-pattern': "url('/pattern.svg')",
      }
    },
  },
  plugins: [],
};
export default config;
