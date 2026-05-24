import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
      },
      screens: {
        '2xl': '1280px',
      },
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      fontSize: {
        display:   ['4rem',    { lineHeight: '1.0',  letterSpacing: '-0.035em', fontWeight: '700' }],
        h1:        ['2.75rem', { lineHeight: '1.05', letterSpacing: '-0.025em', fontWeight: '700' }],
        h2:        ['2rem',    { lineHeight: '1.15', letterSpacing: '-0.02em',  fontWeight: '650' }],
        h3:        ['1.5rem',  { lineHeight: '1.25', letterSpacing: '-0.015em', fontWeight: '600' }],
        h4:        ['1.25rem', { lineHeight: '1.3',  letterSpacing: '-0.01em',  fontWeight: '600' }],
        'body-lg': ['1.0625rem', { lineHeight: '1.6', letterSpacing: '0',       fontWeight: '400' }],
        body:      ['0.9375rem', { lineHeight: '1.6', letterSpacing: '0',       fontWeight: '400' }],
        'body-sm': ['0.8125rem', { lineHeight: '1.55', letterSpacing: '0',      fontWeight: '400' }],
        caption:   ['0.75rem',   { lineHeight: '1.4', letterSpacing: '0',       fontWeight: '500' }],
        eyebrow:   ['0.6875rem', { lineHeight: '1.4', letterSpacing: '0.08em',  fontWeight: '500' }],
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '650',
        bold: '700',
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
        },
        info: {
          DEFAULT: 'hsl(var(--info))',
          foreground: 'hsl(var(--info-foreground))',
        },
        'border-strong': 'hsl(var(--border-strong))',
        'surface-1': 'hsl(var(--surface-1))',
        /* Legacy aliases — all neutralized to muted-foreground so historical `text-neon-*` / `bg-neon-*` compile but appear restrained. Remove call-sites incrementally. */
        neon: {
          cyan: 'hsl(var(--primary))',
          pink: 'hsl(var(--primary))',
          green: 'hsl(var(--success))',
          purple: 'hsl(var(--primary))',
          blue: 'hsl(var(--info))',
          yellow: 'hsl(var(--warning))',
          orange: 'hsl(var(--warning))',
        },
        dark: {
          bg: 'hsl(var(--background))',
          card: 'hsl(var(--card))',
          hover: 'hsl(var(--muted))',
        },
      },
      spacing: {
        gutter: '1.5rem',
        section: '5rem',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      animation: {
        'glow': 'glow 2.4s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
        'pulse-neon': 'pulse-neon 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fade-in 0.3s ease-out',
        'shimmer': 'shimmer 1.6s linear infinite',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'out-quart': 'cubic-bezier(0.25, 1, 0.5, 1)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        soft: 'var(--shadow-soft)',
        elevated: 'var(--shadow-elevated)',
        focus: '0 0 0 3px hsl(var(--ring) / 0.28)',
      },
      keyframes: {
        glow: {
          '0%, 100%': { boxShadow: '0 0 0 0 hsl(var(--ring) / 0.0)' },
          '50%':      { boxShadow: '0 0 0 4px hsl(var(--ring) / 0.15)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'pulse-neon': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
export default config












