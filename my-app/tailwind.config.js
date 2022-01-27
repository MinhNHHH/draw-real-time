module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    screens: {
      'sm': {'min': '640px', 'max': '767px'},
      // => @media (min-width: 640px and max-width: 767px) { ... }

      'md': {'min': '768px', 'max': '1023px'},
      // => @media (min-width: 768px and max-width: 1023px) { ... }

      'lg': {'min': '1024px', 'max': '1279px'},
      // => @media (min-width: 1024px and max-width: 1279px) { ... }

      'xl': {'min': '1280px', 'max': '1535px'},
      // => @media (min-width: 1280px and max-width: 1535px) { ... }

      '2xl': {'min': '1536px'},
      // => @media (min-width: 1536px) { ... }
    },
    extend: {
      spacing: {
        '86/100' : '86%',
        '47/100' : '47%',
        '4/10': '40%',
        '3/20': '15%',
        '46' : "180px",
        '0.125' : '0.125rem'
      },
      colors:{
        primary : "#ff4888",
        cyan : "#00ffff"
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
