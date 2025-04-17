// tailwind.config.js
module.exports = {
  darkMode: 'class', // Enable class-based dark mode
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'], // Ensure components are scanned
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography')],
};
