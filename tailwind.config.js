/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Bobby Media brand colors
        primary:  '#1A0F0A',
        accent:   '#D4AF37',
        gold:     '#D4AF37',
        brown:    '#4A2C1A',
        dark:     '#0D0705',
      },
      fontFamily: {
        heading: ['Poppins-Bold'],
        body:    ['Poppins-Regular'],
        semibold:['Poppins-SemiBold'],
      },
    },
  },
  plugins: [],
};
