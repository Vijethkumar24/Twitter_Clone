import daisyui from "daisyui";
import daisyUIThemes, { forest } from "daisyui/src/theming/themes";
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"Roboto Mono"', 'monospace'],
        handwritten: ['"Shadows Into Light"', "cursive"],
        kalam: ['"Kalam"', "cursive"], // Add your handwritten font here
      },
    },
  },
  plugins: [daisyui],

  daisyui: {
    themes: [
      "dark",
      {
        forest: {
          ...daisyUIThemes["forest"],
          primary: "rgba(19, 99, 170, 0.88)",
          secondary: "rgba(50, 50, 50, 1)",
          font: '"Shadows Into Light", cursive',
        },
      },
    ],
  },
};
