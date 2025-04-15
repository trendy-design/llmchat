import { fontFamily } from 'tailwindcss/defaultTheme';

const config: any = {
    darkMode: ['class'],
    theme: {
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
                soft: 'hsl(var(--soft))',
                hard: 'hsl(var(--hard))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))',
                },
                brand: {
                    DEFAULT: 'hsl(var(--brand))',
                    foreground: 'hsl(var(--brand-foreground))',
                },
                tertiary: {
                    DEFAULT: 'hsl(var(--tertiary))',
                    foreground: 'hsl(var(--tertiary-foreground))',
                },
                quaternary: {
                    DEFAULT: 'hsl(var(--quaternary))',
                    foreground: 'hsl(var(--quaternary-foreground))',
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
            },
            borderWidth: {
                DEFAULT: '0.8px',
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
            fontFamily: {
                mono: ['var(--font-geist-mono)', ...fontFamily.mono],
                clash: ['var(--font-clash)', ...fontFamily.sans],
                sans: ['var(--font-inter)', ...fontFamily.sans],
                bricolage: ['var(--font-bricolage)', ...fontFamily.sans],
            },
            fontSize: {
                xs: ['0.725rem', { lineHeight: '1.2rem', letterSpacing: '0.01em' }],
                sm: ['0.775rem', { lineHeight: '1.3rem', letterSpacing: '0.008em' }],
                base: ['0.875rem', { lineHeight: '1.5rem' }],
                lg: ['0.975rem', { lineHeight: '1.75rem' }],
                xl: ['1.175rem', { lineHeight: '1.95rem' }],
                '2xl': ['1.275rem', { lineHeight: '2.25rem' }],
                '3xl': ['1.375rem', { lineHeight: '2.5rem' }],
                '4xl': ['1.475rem', { lineHeight: '2.75rem' }],
                '5xl': ['3.052rem'],
            },
            fontWeight: {
                normal: '350',
                medium: '400',
                semibold: '450',
                bold: '500',
                black: '600',
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
                'fade-in-once': {
                    '0%': { opacity: 0, transform: 'translateY(5px)' },
                    '100%': { opacity: 1, transform: 'translateY(0)' },
                },
                'reveal-pop': {
                    '0%': { opacity: 0, transform: 'scale(0.96) translateY(10px)' },
                    '70%': { opacity: 1, transform: 'scale(1.01) translateY(-2px)' },
                    '100%': { opacity: 1, transform: 'scale(1) translateY(0)' },
                },
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'fade-in-once': 'fade-in-once 10s ease-out forwards',
                'reveal-pop': 'reveal-pop 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            },
            typography: () => ({
                prosetheme: {
                    css: {
                        '--tw-prose-body': 'hsl(var(--foreground))',
                        '--tw-prose-headings': 'hsl(var(--foreground))',
                        '--tw-prose-lead': 'hsl(var(--muted-foreground))',
                        '--tw-prose-links': 'hsl(var(--brand))',
                        '--tw-prose-bold': 'hsl(var(--foreground))',
                        '--tw-prose-counters': 'hsl(var(--muted-foreground)/0.1)',
                        '--tw-prose-bullets': 'hsl(var(--muted-foreground)/0.1)',
                        '--tw-prose-hr': 'hsl(var(--border))',
                        '--tw-prose-quotes': 'hsl(var(--foreground))',
                        '--tw-prose-quote-borders': 'hsl(var(--border))',
                        '--tw-prose-captions': 'hsl(var(--muted-foreground))',
                        '--tw-prose-code': 'hsl(var(--foreground))',
                        '--tw-prose-pre-code': 'hsl(var(--muted-foreground))',
                        '--tw-prose-pre-bg': 'hsl(var(--muted))',
                        '--tw-prose-th-borders': 'hsl(var(--border))',
                        '--tw-prose-td-borders': 'hsl(var(--border))',

                        // Dark mode values
                        '--tw-prose-invert-body': 'hsl(var(--foreground))',
                        '--tw-prose-invert-headings': 'hsl(var(--foreground))',
                        '--tw-prose-invert-lead': 'hsl(var(--muted-foreground))',
                        '--tw-prose-invert-links': 'hsl(var(--brand))',
                        '--tw-prose-invert-bold': 'hsl(var(--foreground))',
                        '--tw-prose-invert-counters': 'hsl(var(--muted-foreground))',
                        '--tw-prose-invert-bullets': 'hsl(var(--muted-foreground))',
                        '--tw-prose-invert-hr': 'hsl(var(--border))',
                        '--tw-prose-invert-quotes': 'hsl(var(--foreground))',
                        '--tw-prose-invert-quote-borders': 'hsl(var(--border))',
                        '--tw-prose-invert-captions': 'hsl(var(--muted-foreground))',
                        '--tw-prose-invert-code': 'hsl(var(--foreground))',
                        '--tw-prose-invert-pre-code': 'hsl(var(--muted-foreground))',
                        '--tw-prose-invert-pre-bg': 'hsl(var(--muted))',
                        '--tw-prose-invert-th-borders': 'hsl(var(--border))',
                        '--tw-prose-invert-td-borders': 'hsl(var(--border))',
                    },
                },
            }),
            boxShadow: {
                'subtle-xs': 'var(--shadow-subtle-xs)',
                'subtle-sm': 'var(--shadow-subtle-sm)',
            },
        },
    },

    plugins: [
        require('@tailwindcss/typography'),
        require('tailwindcss-animate'),
        require('tailwind-scrollbar-hide'),
    ],
};

export default config;
