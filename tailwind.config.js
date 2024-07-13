/** @type {import('tailwindcss').Config} */
const flowbite = require("flowbite-react/tailwind");
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    flowbite.content(),
  ],
  theme: {
    extend: {
      colors:{"main":"rgba(19, 21, 80, 1)",
      },
    },
  },
  plugins: [
    flowbite.plugin(),
  ],
}