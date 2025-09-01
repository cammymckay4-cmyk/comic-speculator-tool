import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // ComicScoutUK CONFIRMED Color Palette
        'parchment': '#FDF6E3',
        'ink-black': '#1C1C1C',
        'stan-lee-blue': '#003049',
        'kirby-red': '#D62828',
        'golden-age-yellow': '#F7B538',
      },
      fontFamily: {
        // CONFIRMED: Super Squad for headings, Persona Aura for body
        'bangers': ['Bangers', 'cursive'],
        'super-squad': ['Super Squad', 'Impact', 'sans-serif'],
        'persona-aura': ['Persona Aura', 'system-ui', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      boxShadow: {
        // CONFIRMED: Comic-style shadows
        'comic': '6px 6px 0px #1C1C1C',
        'comic-sm': '3px 3px 0px #1C1C1C',
        'comic-lg': '8px 8px 0px #1C1C1C',
        'comic-hover': '4px 4px 0px #1C1C1C', // CONFIRMED: Subtle hover
      },
      borderWidth: {
        'comic': '3px',
      },
      animation: {
        'pulse-subtle': 'pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
      },
      keyframes: {
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
