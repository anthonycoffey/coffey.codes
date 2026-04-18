// tailwind.config.js
module.exports = {
  darkMode: ['attribute', 'data-theme'],
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:              'var(--color-bg)',
        'bg-alt':        'var(--color-bg-alt)',
        surface:         'var(--color-surface)',
        'surface-hover': 'var(--color-surface-hover)',
        border:          'var(--color-border)',
        'c-text':        'var(--color-text)',
        'c-muted':       'var(--color-text-muted)',
        'c-heading':     'var(--color-heading)',
        accent1:         'var(--color-accent-1)',
        accent2:         'var(--color-accent-2)',
        accent3:         'var(--color-accent-3)',
        'accent1-dark':  'var(--color-accent-1-dark)',
        link:            'var(--color-link)',
        'code-bg':       'var(--color-code-bg)',
      },
      fontFamily: {
        outfit: ['var(--font-outfit)', 'sans-serif'],
      },
      boxShadow: {
        retro:    '4px 4px 0px rgba(0,0,0,0.12)',
        'retro-lg': '6px 6px 0px rgba(0,0,0,0.2)',
      },
      keyframes: {
        glitch: {
          '0%':   { clipPath: 'inset(40% 0 61% 0)', transform: 'translate(-2px,0)' },
          '20%':  { clipPath: 'inset(92% 0 1% 0)',  transform: 'translate(2px,0)' },
          '40%':  { clipPath: 'inset(43% 0 1% 0)',  transform: 'translate(-2px,0)' },
          '60%':  { clipPath: 'inset(25% 0 58% 0)', transform: 'translate(2px,0)' },
          '80%':  { clipPath: 'inset(54% 0 7% 0)',  transform: 'translate(-2px,0)' },
          '100%': { clipPath: 'inset(58% 0 43% 0)', transform: 'translate(2px,0)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        glitch: 'glitch 0.4s infinite linear alternate-reverse',
        blink:  'blink 1s step-end infinite',
        float:  'float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
