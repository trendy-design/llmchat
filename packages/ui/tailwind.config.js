const sharedConfig = require("@repo/tailwind-config");

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...sharedConfig,
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
};