/** @type {import('tailwindcss').Config} */
const config = {
    content: [
      "./index.html",
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    darkMode: 'class',
    theme: {
      extend: {
        colors: {
          lightBackground: '#F1F5F9',
          lightText: '#2E3A59',
          lightPrimaryButton: '#0D4D9A',
          lightSecondaryButton: '#E1E8F4',
          lightSidebar: '#FFFFFF',
          darkBackground: '#000000',
          darkText: '#E0E7F1',
          darkPrimaryButton: '#3A7BD5',
          darkSecondaryButton: '#2A2E3C',
          darkSidebar: '#121C2C',
        },
        fontFamily: {
          sans: ['Product Sans', 'sans-serif'],
        },
      },
    },
    plugins: [],
};

module.exports = config;
  