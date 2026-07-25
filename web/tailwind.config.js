/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Industrial color palette
        'industrial': {
          'blue': '#0f172a',      // Dark blue-gray
          'gray': '#64748b',      // Slate gray
          'blue-light': '#1e293b', // Slightly lighter
          'blue-dark': '#020617', // Very dark
          'accent': '#0ea5e9',    // Sky blue accent
          'success': '#10b981',   // Emerald green
          'warning': '#f59e0b',   // Amber
          'danger': '#ef4444',    // Red
        }
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        'lg': '0.75rem',
        'xl': '1rem',
      }
    },
  },
  plugins: [],
}
