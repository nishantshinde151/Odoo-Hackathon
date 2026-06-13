/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Harmonious premium palette
        primary: {
          50: '#fdf8f6',
          100: '#f2e8e5',
          500: '#8d6e63', // Warm cafe brown
          600: '#795548',
          700: '#5d4037',
        },
        accent: {
          500: '#00acc1', // Teal
        }
      }
    },
  },
  plugins: [],
}
