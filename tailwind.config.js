/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: 'rgb(var(--color-canvas) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        panel: 'rgb(var(--color-panel) / <alpha-value>)',
        panelBorder: 'rgb(var(--color-panel-border) / <alpha-value>)',
        chalk: 'rgb(var(--color-chalk) / <alpha-value>)',
        graphite: 'rgb(var(--color-graphite) / <alpha-value>)',
        marker: 'rgb(var(--color-marker) / <alpha-value>)',
        markerDim: 'rgb(var(--color-marker-dim) / <alpha-value>)',
        sage: 'rgb(var(--color-sage) / <alpha-value>)',
        sageBright: 'rgb(var(--color-sage-bright) / <alpha-value>)',
        danger: 'rgb(var(--color-danger) / <alpha-value>)',
      },
      boxShadow: {
        panel: 'var(--shadow-panel)',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        grain: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E\")",
      },
      keyframes: {
        dash: {
          to: { strokeDashoffset: '-20' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        dash: 'dash 1.2s linear infinite',
        fadeUp: '0.5s ease-out fadeUp',
      },
    },
  },
  plugins: [],
}
