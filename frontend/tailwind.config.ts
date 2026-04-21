import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Bonjour-inspired palette, tuned for "professional knowledge tool"
        cream:   '#FFF4D6',   // warm yellow background (hero only)
        canvas:  '#FBFAF6',   // off-white work surface
        ink:     '#1A1A1F',   // primary text
        muted:   '#6B6B72',   // secondary text
        violet:  '#6B4FBB',   // primary CTA / accent
        violet2: '#8B6FE6',   // hover state
        amber:   '#F8B739',   // highlight / Actian brand pop
        'amber-dark': '#8A5F12',  // readable amber text on amber/15 bg
        coral:   '#FF6B6B',   // error / red
        line:    '#E8E5DA',   // border
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'sans-serif'],
        display: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Menlo', 'monospace'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(26,26,31,.04), 0 4px 12px rgba(26,26,31,.04)',
        lift: '0 2px 4px rgba(26,26,31,.06), 0 12px 32px rgba(26,26,31,.08)',
        glow: '0 0 0 4px rgba(107,79,187,.12)',
      },
      borderRadius: {
        'xl2': '1.25rem',
        'pill': '9999px',
      },
      keyframes: {
        blink: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(0.85)', opacity: '0.7' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        blink: 'blink 1.4s ease-in-out infinite',
        float: 'float 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
export default config;
