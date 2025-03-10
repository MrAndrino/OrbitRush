import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'media',
  theme: {
    extend: {
      screens: {
        'xs': '280px', 
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        'custom-orange': 'rgba(255, 140, 0, 0.7)',
      },
      fontFamily:{
        primary: "var(--font-primary)",
        secondary: "var(--font-secondary)"
      }
    },
  },
  plugins: [],
} satisfies Config;
