/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './lib/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        maroon: '#3B0A14',
        maroondeep: '#2A0710',
        gold: '#B8862B',
        goldlight: '#D9AE58',
        paper: '#F8F0DE',
        ink: '#2A1B12',
        kumkum: '#A63A2D',
        leaf: '#234D35',
      },
      fontFamily: {
        serif: ['Marcellus', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
