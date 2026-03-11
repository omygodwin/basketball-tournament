/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          600: '#2a4060',
          700: '#1e3050',
          750: '#1a2844',
          800: '#162033',
          900: '#0c1524',
          950: '#080e18',
        },
      },
    },
  },
  plugins: [],
}
