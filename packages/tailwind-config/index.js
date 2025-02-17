const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  theme: {
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.825rem', { lineHeight: '1.25rem' }],
      base: ['0.875rem', { lineHeight: '1.5rem' }],
      lg: ['1.115rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.563rem', { lineHeight: '2rem' }],
      '3xl': ['1.953rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.441rem', { lineHeight: '2.5rem' }],
      '5xl': ['3.052rem', { lineHeight: '1' }],
    },
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        zinc: {
          25: 'hsl(0, 0%, 99%, <alpha-value>)',
          50: 'hsl(0, 0%, 93.7%, <alpha-value>)',
          100: 'hsl(240, 0.9%, 91.7%, <alpha-value>)',
          200: 'hsl(240, 1.1%, 83.1%, <alpha-value>)',
          300: 'hsl(240, 1.2%, 74.3%, <alpha-value>)',
          400: 'hsl(240, 1.2%, 65.5%, <alpha-value>)',
          500: 'hsl(240, 1.2%, 56.7%, <alpha-value>)',
          600: 'hsl(240, 1.2%, 47.8%, <alpha-value>)',
          700: 'hsl(240, 1.2%, 39%, <alpha-value>)',
          800: 'hsl(240, 1.2%, 30.2%, <alpha-value>)',
          900: 'hsl(240, 1.2%, 21.4%, <alpha-value>)',
          950: 'hsl(240, 1.2%, 12.6%, <alpha-value>)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', ...fontFamily.sans],
        mono: ['var(--font-geist-mono)', ...fontFamily.mono],
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '550',
        bold: '650',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        marquee2: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0%)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('tailwindcss-animate'),
    require('tailwind-scrollbar-hide'),
  ],
};
