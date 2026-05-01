import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: "#f3f7f4",
          100: "#e3ece5",
          200: "#c8d9cc",
          300: "#a0bda8",
          400: "#739a7e",
          500: "#547d62",
          600: "#41644e",
          700: "#345040",
          800: "#2c4035",
          900: "#26362d",
          950: "#131e18",
        },
        ember: {
          400: "#f59e6b",
          500: "#ee7e3e",
          600: "#d96022",
        },
        slate: {
          850: "#172033",
        },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "-apple-system", "BlinkMacSystemFont", "Inter", "Segoe UI", "Helvetica Neue", "sans-serif"],
        display: ["ui-serif", "Georgia", "Cambria", "Times New Roman", "Times", "serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.18s ease-out",
        "slide-up": "slideUp 0.26s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-in-right": "slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "rise": "rise 0.32s cubic-bezier(0.16, 1, 0.3, 1) backwards",
        "grow-y": "growY 0.4s cubic-bezier(0.16, 1, 0.3, 1) backwards",
        "ping-soft": "pingSoft 2.4s cubic-bezier(0, 0, 0.2, 1) infinite",
        "shimmer": "shimmer 2s linear infinite",
        "tick": "tick 0.24s cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(24px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        rise: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        growY: {
          "0%": { opacity: "0.3", transform: "scaleY(0)" },
          "100%": { opacity: "1", transform: "scaleY(1)" },
        },
        pingSoft: {
          "0%": { transform: "scale(0.95)", opacity: "0.7" },
          "75%, 100%": { transform: "scale(2.2)", opacity: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        tick: {
          "0%": { transform: "translateY(-4px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
