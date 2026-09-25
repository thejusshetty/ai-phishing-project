/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0.75rem',
      },
      colors: {
        background: "#08090e",
        foreground: "#f1f5f9",
        surface: "#0f111a",
        surfaceRaised: "#151824",
        surfaceBorder: "rgba(255, 255, 255, 0.08)",
        primary: {
          DEFAULT: "#2563eb",
          hover: "#1d4ed8",
          light: "#3b82f6",
          dark: "#1e40af",
        },
        cyan: {
          DEFAULT: "#06b6d4",
          light: "#22d3ee",
        },
        danger: {
          DEFAULT: "#f43f5e",
          light: "#fb7185",
          dark: "#be123c",
        },
        warning: {
          DEFAULT: "#f59e0b",
          light: "#fbbf24",
        },
        success: {
          DEFAULT: "#10b981",
          light: "#34d399",
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-subtle': 'pulseSubtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        }
      }
    },
  },
  plugins: [],
};
