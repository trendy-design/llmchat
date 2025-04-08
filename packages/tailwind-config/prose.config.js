/** @type {import('tailwindcss').Config} */
module.exports = {
  extend: {
    typography: ({ theme }) => ({
      custom: {
        css: {
          '--tw-prose-body': 'hsl(var(--foreground))',
          '--tw-prose-headings': 'hsl(var(--foreground))',
          '--tw-prose-lead': 'hsl(var(--muted-foreground))',
          '--tw-prose-links': 'hsl(var(--brand))',
          '--tw-prose-bold': 'hsl(var(--foreground))',
          '--tw-prose-counters': 'hsl(var(--muted-foreground))',
          '--tw-prose-bullets': 'hsl(var(--muted-foreground))',
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
  },
};
