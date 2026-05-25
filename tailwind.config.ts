import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
          soft: 'rgb(var(--primary-soft) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'rgb(var(--secondary) / <alpha-value>)',
          soft: 'rgb(var(--secondary-soft) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'rgb(var(--accent-soft) / <alpha-value>)',
        },
        ink: {
          900: 'rgb(var(--neutral-900) / <alpha-value>)',
          700: 'rgb(var(--neutral-700) / <alpha-value>)',
          600: 'rgb(var(--neutral-600) / <alpha-value>)',
          400: 'rgb(var(--neutral-400) / <alpha-value>)',
          200: 'rgb(var(--neutral-200) / <alpha-value>)',
          100: 'rgb(var(--neutral-100) / <alpha-value>)',
          50: 'rgb(var(--neutral-50) / <alpha-value>)',
        },
        surface: 'rgb(var(--surface) / <alpha-value>)',
        success: 'rgb(var(--success) / <alpha-value>)',
        danger: 'rgb(var(--danger) / <alpha-value>)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.75rem', { lineHeight: '1.1rem' }],
        xs: ['0.8125rem', { lineHeight: '1.2rem' }],
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
      boxShadow: {
        lift: '0 1px 2px rgba(124,45,91,0.06), 0 12px 32px -12px rgba(124,45,91,0.18)',
        card: '0 1px 0 rgba(26,20,20,0.04), 0 8px 24px -16px rgba(217,119,87,0.25)',
        ring: '0 0 0 4px rgba(217,119,87,0.18)',
      },
      backgroundImage: {
        'brand-gradient':
          'linear-gradient(135deg, rgb(var(--primary)) 0%, rgb(var(--primary-soft)) 100%)',
        'warm-mesh':
          'radial-gradient(70% 70% at 15% 20%, rgba(255,107,71,0.18), transparent 60%), radial-gradient(60% 60% at 85% 80%, rgba(31,73,64,0.12), transparent 60%)',
      },
      transitionTimingFunction: {
        'out-quint': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
