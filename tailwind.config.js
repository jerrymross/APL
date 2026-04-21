/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        astar: {
          bg: '#0f172a',
          accent: '#eb5c52',
          secondary: '#2758a5',
          light: '#a0bce3',
        },
      },
      boxShadow: {
        glow: '0 20px 70px rgba(39, 88, 165, 0.24)',
      },
    },
  },
  plugins: [],
};
