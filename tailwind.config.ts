import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fef7ee",
          100: "#fdecd7",
          200: "#fad5ae",
          300: "#f6b77a",
          400: "#f08f44",
          500: "#ec7220",
          600: "#dd5816",
          700: "#b74214",
          800: "#923618",
          900: "#762e16"
        }
      }
    }
  },
  plugins: []
};

export default config;
