/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        astar: {
          bg: '#f6f8fc',
          ink: '#123f8c',
          navy: '#0f2f67',
          accent: '#eb5c52',
          secondary: '#1559c7',
          light: '#a0bce3',
        },
      },
      boxShadow: {
        glow: '0 20px 70px rgba(21, 89, 199, 0.14)',
      },
    },
  },
  plugins: [],
};
