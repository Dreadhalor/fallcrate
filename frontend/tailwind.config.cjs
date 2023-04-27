/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        faded_bg: '#f7f5f2',
        faded_border: '#e0e0e0',
      },
    },
  },
  plugins: [],
};
