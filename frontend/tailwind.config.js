/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#05050f",
        foreground: "#f8fafc",
        primary: "#3b82f6",
        primaryGlow: "rgba(59, 130, 246, 0.5)",
        danger: "#f43f5e",
        warning: "#f59e0b",
        success: "#10b981",
        darkAccent: "#0f172a",
        glass: "rgba(15, 23, 42, 0.6)",
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-glow': 'pulseGlow 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', filter: 'brightness(1)' },
          '50%': { opacity: '0.8', filter: 'brightness(1.2) drop-shadow(0 0 10px rgba(59,130,246,0.8))' },
        }
      }
    },
  },
  plugins: [],
};
