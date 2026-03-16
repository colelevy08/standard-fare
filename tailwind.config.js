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
      },
      fontFamily: {
        display: ["'Playfair Display'", "Georgia", "serif"],
        body: ["'Lato'", "sans-serif"],
        mono: ["'Courier Prime'", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease forwards",
        "slide-up": "slideUp 0.7s ease forwards",
        "flamingo-bob": "flamingoBob 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: "translateY(20px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        flamingoBob: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
    },
  },
  plugins: [],
};

