/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg': 'hsl(220 20% 95%)',
        'accent': 'hsl(180 60% 50%)',
        'primary': 'hsl(240 80% 50%)',
        'surface': 'hsl(0 0% 100%)',
        'text-primary': 'hsl(220 20% 20%)',
        'text-secondary': 'hsl(220 20% 40%)',
      },
      borderRadius: {
        'sm': '6px',
        'md': '10px',
        'lg': '16px',
        'xl': '24px',
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
      },
      boxShadow: {
        'card': '0 4px 12px hsla(220 20% 10% / 0.1)',
      },
      fontSize: {
        'display': ['3.75rem', { lineHeight: '1', fontWeight: '700' }],
        'headline': ['1.875rem', { lineHeight: '2.25rem', fontWeight: '600' }],
        'body': ['1rem', { lineHeight: '1.75rem' }],
        'small': ['0.875rem', { lineHeight: '1.25rem' }],
      },
    },
  },
  plugins: [],
}