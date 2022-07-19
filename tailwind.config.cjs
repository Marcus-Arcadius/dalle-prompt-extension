module.exports = {
    darkMode: ['class', '[data-theme="dark"]'],
    content: [
      "./options.html",
      "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {},
    },
    plugins: [
      require('@tailwindcss/forms'),
      require('@tailwindcss/typography'),
    ],
  }