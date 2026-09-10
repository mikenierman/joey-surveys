/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/components/ReviewPortal.jsx', './src/components/portal/**/*.{js,jsx}', './src/components/ui/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#1C1917',
          2: '#57534E',
          3: '#A8A29E',
        },
        cream: '#FAF6EF',
        line: '#E7E0D4',
        portal: {
          green: '#16A34A',
          'green-soft': '#DCFCE7',
          blue: '#2563EB',
          orange: '#F97316',
          'orange-soft': '#FFEDD5',
          red: '#DC2626',
          'red-soft': '#FEE2E2',
        },
      },
      fontFamily: {
        display: ['"Archivo Black"', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        portal: '14px',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
};
