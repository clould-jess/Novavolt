/** Novavolt design tokens — light mode only for now, structured for a future dark mode. */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#FFFFFF',
        soft: '#F7FAFC',
        surface: '#F1F5F9',
        line: '#E2E8F0',
        ink: '#0F172A',
        body: '#111827',
        muted: '#64748B',
        sky: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          400: '#38BDF8',
          500: '#0EA5E9',
        },
        action: {
          DEFAULT: '#0284C7',
          dark: '#0369A1',
          soft: '#E0F2FE',
        },
        ok: '#16A34A',
        warn: '#F59E0B',
        bad: '#DC2626',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'ui-sans-serif', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.8125rem', { lineHeight: '1.125rem' }],
      },
      borderRadius: {
        card: '1rem',
        pill: '999px',
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgba(15, 23, 42, 0.05)',
        card: '0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 8px 24px -12px rgba(15, 23, 42, 0.12)',
        lift: '0 12px 32px -12px rgba(2, 132, 199, 0.35)',
        nav: '0 1px 0 0 rgba(226, 232, 240, 1), 0 8px 24px -20px rgba(15, 23, 42, 0.25)',
      },
      transitionTimingFunction: {
        signature: 'cubic-bezier(0.23, 1, 0.32, 1)',
      },
      maxWidth: {
        content: '80rem',
      },
      keyframes: {
        haloDrift: {
          '0%, 100%': { transform: 'translate3d(0,0,0) scale(1)', opacity: '0.55' },
          '50%': { transform: 'translate3d(2%, -2%, 0) scale(1.06)', opacity: '0.8' },
        },
        sheen: {
          '0%': { transform: 'translateX(-120%)' },
          '100%': { transform: 'translateX(220%)' },
        },
        spinSlow: {
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        halo: 'haloDrift 14s cubic-bezier(0.45, 0, 0.55, 1) infinite',
        sheen: 'sheen 2.4s linear infinite',
        'spin-slow': 'spinSlow 1.1s linear infinite',
      },
    },
  },
  plugins: [],
};
