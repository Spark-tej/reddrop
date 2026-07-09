/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        crimson: {
          50: "#fef2f2",
          100: "#fde3e3",
          200: "#fbcbcb",
          300: "#f7a3a3",
          400: "#f16f6f",
          500: "#e63e3e",
          600: "#d21f1f",
          700: "#ac1616",
          800: "#8f1616",
          900: "#7a1818",
          950: "#420909",
        },
        slate: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0,0,0,0.07), 0 1px 2px -1px rgba(0,0,0,0.07)",
      },
    },
  },
  plugins: [],
};
