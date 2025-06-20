/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        fontFamily: {
          inter: ['Inter', 'sans-serif'],
          fraunces: ['Fraunces', 'serif']
        },
        colors: {
          primary: {
            DEFAULT: '#17100E',
            light: '#2C1F1C',
            dark: '#0F0A09'
          },
          accent: {
            DEFAULT: '#E8E8E8',
            hover: '#DADADA'
          }
        }
      },
    },
    plugins: [
      function ({ addUtilities, theme }) {
        const values = theme('backdropBlur')
        const utilities = Object.entries(values).map(([key, value]) => ({
          [`.backdrop-blur-${key}`]: {
            '-webkit-backdrop-filter': `blur(${value})`,
            'backdrop-filter': `blur(${value})`,
          },
        }))
        addUtilities(utilities, ['responsive'])
      },
    ],
  }
  