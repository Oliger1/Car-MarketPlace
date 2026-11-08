import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./lib/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#f4efe8",
        surface: "#fffcf8",
        ink: "#1c1917",
        muted: "#6b625b",
        line: "#e4d9cc",
        accent: "var(--accent, #0f6e6a)",
        "accent-dark": "var(--accent-dark, #0b5552)",
        "accent-soft": "var(--accent-soft, #d7efe9)",
        price: "var(--price, #c2410c)",
        signal: "var(--signal, #e07a3d)",
      },
      fontFamily: {
        sans: ["Manrope", "system-ui", "sans-serif"],
        display: ["Fraunces", "Georgia", "serif"],
      },
      boxShadow: {
        soft: "0 10px 30px rgba(28,25,23,0.08)",
        search: "0 18px 50px rgba(28,25,23,0.16)",
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        rise: "rise 0.6s ease both",
      },
    },
  },
  plugins: [],
} satisfies Config;
