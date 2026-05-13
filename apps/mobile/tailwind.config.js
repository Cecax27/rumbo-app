/** @type {import('tailwindcss').Config} */
module.exports = {
  // NativeWind v4: target all JS/JSX/TS/TSX files in the app
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './contexts/**/*.{js,jsx,ts,tsx}',
    './hooks/**/*.{js,jsx,ts,tsx}',
    './lib/**/*.{js,jsx,ts,tsx}',
    './theme/**/*.{js,jsx,ts,tsx}',
  ],
  // Use 'class' so the custom ThemeProvider can toggle dark mode
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'text-primary': '#3e3e3e',
        primary: '#0d2e4f',
        secondary: '#0fa3b1',
        success: '#22c58e',
        emphasis: '#f6b23a',
        warning: '#f97316',
        light: '#f7f3e8',
        background: 'rgb(237, 237, 237)',
        bg: 'rgb(var(--background) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        text: 'rgb(var(--text) / <alpha-value>)',
        subtext: 'rgb(var(--subtext) / <alpha-value>)',
        brand: 'rgb(var(--primary) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        danger: 'rgb(var(--error) / <alpha-value>)',
        income: 'rgb(var(--income) / <alpha-value>)',
        spending: 'rgb(var(--spending) / <alpha-value>)',
        mint: 'rgb(var(--mint) / <alpha-value>)',
        mustard: 'rgb(var(--mustard) / <alpha-value>)',
        coral: 'rgb(var(--coral) / <alpha-value>)',
      },
      fontFamily: {
        // Titles
        'quicksand': ['Quicksand-Regular'],
        'quicksand-light': ['Quicksand-Light'],
        'quicksand-medium': ['Quicksand-Medium'],
        'quicksand-semibold': ['Quicksand-SemiBold'],
        'quicksand-bold': ['Quicksand-Bold'],
        // Body / general
        'inter': ['Inter_400Regular'],
        'inter-medium': ['Inter_500Medium'],
        'inter-semibold': ['Inter_600SemiBold'],
        'inter-bold': ['Inter_700Bold'],
      },
    },
  },
  plugins: [],
  presets: [require('nativewind/preset')],
};
