/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Make sure your src files are included
  ],
  theme: {
    extend: {
      colors: {
        // Dark blue custom colors
        'primary-dark': '#0a1929',
        'primary': '#1a365d',
        'primary-light': '#2a4a73',
      }
    },
  },
  plugins: [],
}
