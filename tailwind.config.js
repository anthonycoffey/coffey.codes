/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundColor: ["dark"],
      textColor: ["dark"],
      fontFamily: {
        sans: ["Helvetica", "sans-serif"],
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
