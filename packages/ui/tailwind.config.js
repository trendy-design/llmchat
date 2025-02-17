const sharedConfig = require('@repo/tailwind-config');

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [sharedConfig],
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    '../../apps/web/components/**/*.{js,ts,jsx,tsx,mdx}',
    '../../apps/web/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
};
