/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // These map onto the CSS custom properties defined in src/index.css
      // (the single source of truth for the theme). Change a value there
      // and every Tailwind utility below follows automatically.
      colors: {
        primary: {
          DEFAULT: 'var(--primary)',
          dark: 'var(--primary-dark)',
          light: 'var(--primary-light)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          light: 'var(--secondary-light)',
        },
        success: { DEFAULT: 'var(--success)', light: 'var(--success-light)' },
        warning: { DEFAULT: 'var(--warning)', light: 'var(--warning-light)' },
        danger: { DEFAULT: 'var(--danger)', light: 'var(--danger-light)' },
        info: { DEFAULT: 'var(--info)', light: 'var(--info-light)' },
        surface: 'var(--bg-card)',
        canvas: 'var(--bg)',
        ink: {
          DEFAULT: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
        line: 'var(--border)',
      },
      fontFamily: {
        sans: ['Manrope', 'Segoe UI', 'sans-serif'],
        display: ['Sora', 'Manrope', 'sans-serif'],
      },
      borderRadius: {
        xl: '14px',
        '2xl': '18px',
        '3xl': '24px',
      },
      boxShadow: {
        soft: '0 1px 2px 0 rgb(15 23 42 / 0.06), 0 1px 3px -1px rgb(15 23 42 / 0.08)',
        card: '0 6px 16px -6px rgb(30 41 59 / 0.10), 0 2px 6px -3px rgb(30 41 59 / 0.08)',
        lift: '0 20px 40px -18px rgb(30 27 90 / 0.28)',
        glow: '0 10px 24px -8px var(--primary-glow, rgb(79 70 229 / 0.45))',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        scaleIn: { from: { opacity: 0, transform: 'scale(.96) translateY(4px)' }, to: { opacity: 1, transform: 'scale(1) translateY(0)' } },
        shimmer: { '0%': { backgroundPosition: '-400px 0' }, '100%': { backgroundPosition: '400px 0' } },
      },
      animation: {
        'fade-in': 'fadeIn .18s ease-out',
        'scale-in': 'scaleIn .18s cubic-bezier(.16,1,.3,1)',
        shimmer: 'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [],
}
