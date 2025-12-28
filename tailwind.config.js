/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
  ],
  theme: {
    extend: {
      colors: {
        respengr: '#FF00FF',
        prappt: '#00FFFF',
        aiboumos: '#8040C0',
      },
      fontFamily: {
        mono: ['Noto Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
