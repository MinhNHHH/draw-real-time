module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "#e5e7eb" : "#e5e7eb"
      },
      spacing: {
        "39%": "39%",
        "29%": "29%",
        "378px": "378px",
        "42%": "42%",
        "86%": "86%",
        "6%": "6%",
        "144px" : "144px",
        "394px": "394px"
      },
      animation: {
        'bounce-1.25' : "bounce 1.25s infinite",
        'bounce-1.5' : "bounce 1.5s infinite"
      }
    },
  },
  important: true,
  plugins: [],
}