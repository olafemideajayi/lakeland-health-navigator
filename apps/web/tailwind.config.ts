import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0066CC',
          dark: '#004C99',
          light: '#E6F0FF',
        },
        accent: {
          DEFAULT: '#00A86B',
          light: '#E6F9F0',
        },
        warning: {
          DEFAULT: '#FF6B35',
          light: '#FFF0E8',
        },
        danger: {
          DEFAULT: '#DC3545',
          light: '#FDE8EA',
        },
      },
    },
  },
  plugins: [],
};

export default config;
