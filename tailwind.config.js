/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'custom-blue': '#0a83ed',
        'custom-purple': '#640ce9',
      },
    },
  },
  plugins: [],
}