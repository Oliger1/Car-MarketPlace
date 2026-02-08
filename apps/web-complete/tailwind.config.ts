import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        floaty: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" }
        },
        glow: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.75" }
        }
      },
      animation: {
        floaty: "floaty 6s ease-in-out infinite",
        glow: "glow 5s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
