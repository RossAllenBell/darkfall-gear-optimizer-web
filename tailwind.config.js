/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    { pattern: /bg-armor-/ },
    { pattern: /text-armor-/ },
  ],
  theme: {
    extend: {
      colors: {
        'armor-noarmor': '#f5f5f5',
        'armor-cloth': '#e6e6fa',
        'armor-bone': '#f3e5ab',
        'armor-leather': '#d2b48c',
        'armor-studded': '#daa520',
        'armor-chain': '#c0c0c0',
        'armor-banded': '#a9a9a9',
        'armor-scale': '#708090',
        'armor-plate': '#808080',
        'armor-fullplate': '#696969',
        'armor-padded': '#f0e68c',
        'armor-infernal': '#dc143c',
        'armor-dragon': '#8b0000',
        'armor-phantasmal': '#9370db',
        'armor-wyvern': '#2e8b57',
      }
    }
  },
  plugins: [],
}
