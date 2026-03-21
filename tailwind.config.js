/** @type {import('tailwindcss').Config} */
// Tailwind config — defines color palette, fonts, and file scanning paths
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  safelist: [
    "object-[center_18%]",
    "object-[center_20%]",
    "scale-[1.4]",
    "origin-top",
    "object-top",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#1B2B4B",
          light: "#2D4170",
          dark: "#111E35",
        },
        cream: {
          DEFAULT: "#F5F0E8",
          warm: "#EDE5D0",
          dark: "#D9CEB1",
        },
        flamingo: {
          DEFAULT: "#E8748A",
          light: "#F09BAC",
          dark: "#C4536A",
        },
        gold: {
          DEFAULT: "#C5A55A",
          light: "#D4BA7A",
          dark: "#A8893E",
        },
      },
      fontFamily: {
        display: ["'Playfair Display'", "Georgia", "serif"],
        body: ["'Lato'", "sans-serif"],
        mono: ["'Courier Prime'", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease forwards",
        "slide-up": "slideUp 0.7s ease forwards",
        "slide-down": "slideDown 0.25s ease-out forwards",
        "scale-in": "scaleIn 0.2s ease-out forwards",
        "flamingo-bob": "flamingoBob 3s ease-in-out infinite",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: "translateY(20px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        slideDown: { from: { opacity: 0, transform: "translateY(-8px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        scaleIn: { from: { opacity: 0, transform: "scale(0.95)" }, to: { opacity: 1, transform: "scale(1)" } },
        flamingoBob: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.6 },
        },
      },
      boxShadow: {
        "admin": "0 1px 3px rgba(27,43,75,0.06), 0 4px 12px rgba(27,43,75,0.04)",
        "admin-lg": "0 4px 16px rgba(27,43,75,0.08), 0 1px 4px rgba(27,43,75,0.04)",
        "admin-hover": "0 8px 24px rgba(27,43,75,0.1), 0 2px 8px rgba(27,43,75,0.06)",
        "glow-flamingo": "0 0 0 3px rgba(232,116,138,0.15)",
      },
    },
  },
  plugins: [],
};

