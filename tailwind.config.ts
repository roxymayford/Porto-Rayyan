import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,js,html}'],
  theme: {
    extend: {
      colors: {
        mat: {
          DEFAULT: '#346744',
          dark: '#275034',
          deep: '#1B3B25'
        },
        paper: {
          brown: '#5C3A21',
          yellow: '#F5E216',
          white: '#FAFAFA',
          metal: '#E4E6E9',
          switch: '#D5D8DC'
        },
        ink: {
          DEFAULT: '#5C3A21',
          stroke: '#4A2E1B'
        },
        yt: {
          DEFAULT: '#EE1D24'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      borderRadius: {
        xs: '2px'
      },
      backdropBlur: {
        xs: '2px'
      }
    }
  },
  plugins: []
} satisfies Config;
