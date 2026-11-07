/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mainColor: '#006561',
        mainColor2: '#1a9a9b',
        bgTopbar: '#91350a',
        textTopbar: '#f6e9df',
        terracotta: {
          DEFAULT: '#C9785C',
          100: '#FFE6DC',
          700: '#B23A2A',
          hover700: '#9A2F20',
        },
        'bg-body': '#FEFBF4',
        'sand-canvas': '#F8F6F5',
        'oat-cream': '#F4EFE6',
        'warm-cream': '#F2EAD8',
        'bg-footer': '#FBF6EA',
        mustard: '#c8983d',
        sage: '#7B9461',
        ink: {
          primary: '#2A2725',
          secondary: '#6B6661',
          tertiary: '#9A938C',
        },
        'border-subtle': '#E5E2DF',
      },
      fontFamily: {
        display: ['"Wix Madefor Display"', '"Wix Madefor Text"', 'system-ui', 'sans-serif'],
        serif: ['"Cormorant Garamond"', 'serif'],
        text: ['"Montserrat"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
