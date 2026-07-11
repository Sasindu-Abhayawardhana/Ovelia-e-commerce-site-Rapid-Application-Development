import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette
        cream: {
          50:  '#FDFAF6',
          100: '#F9F3EB',
          200: '#F2E8D6',
          300: '#E8D8BF',
        },
        charcoal: {
          800: '#2C2C2C',
          900: '#1A1A1A',
        },
        terracotta: {
          50:  '#FDF5F0',
          100: '#FAE4D6',
          200: '#F5C9AD',
          300: '#EBA882',
          400: '#D98B5F',
          500: '#C17F5A',
          600: '#A86A45',
          700: '#8D5434',
          800: '#714026',
          900: '#552E1A',
        },
        gold: {
          300: '#E8C97A',
          400: '#D4A843',
          500: '#B8922A',
        },
        sage: {
          100: '#EEF2EC',
          200: '#D4DFD0',
          500: '#7A9B6F',
        },
      },
      fontFamily: {
        serif:  ['Playfair Display', 'Georgia', 'serif'],
        sans:   ['Inter', 'system-ui', 'sans-serif'],
        display:['Playfair Display', 'serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        soft: '0 2px 20px rgba(0,0,0,0.06)',
        card: '0 4px 32px rgba(0,0,0,0.08)',
        lift: '0 8px 40px rgba(0,0,0,0.12)',
      },
      animation: {
        'fade-in':   'fadeIn 0.3s ease-out',
        'slide-up':  'slideUp 0.4s ease-out',
        'slide-in':  'slideIn 0.3s ease-out',
        'pulse-soft':'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:   { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideIn:   { from: { opacity: '0', transform: 'translateX(-10px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        pulseSoft: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.6' } },
      },
    },
  },
  plugins: [],
}

export default config
