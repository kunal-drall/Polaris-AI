import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--tg-theme-button-color)',
        secondary: 'var(--tg-theme-secondary-bg-color)',
        text: 'var(--tg-theme-text-color)',
        hint: 'var(--tg-theme-hint-color)',
        link: 'var(--tg-theme-link-color)',
        bg: 'var(--tg-theme-bg-color)',
      },
    },
  },
  plugins: [],
}

export default config