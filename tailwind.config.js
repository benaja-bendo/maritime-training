/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        beige: {
          50: '#fbfaf8',
          100: '#f7f4ed',
          200: '#ede7d9',
          300: '#dfd5bf',
        },
      },
    },
  },
  plugins: [],
};
