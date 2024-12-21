/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{html,ts}"],
  theme: {
    screens: {
      'xs': '480px', // Extra small devices (phones, 480px)
      'sm': '640px', // Small devices (phones, 640px)
      'md': '768px', // Medium devices (tablets, 768px)
      'lg': '1024px', // Large devices (desktops, 1024px)
      'xl': '1280px', // Extra large devices (larger desktops, 1280px)
      '2xl': '1536px', // 2x Extra large devices (larger desktops, 1536px)
    },
  },
  variants: {},
  plugins: [],
};
