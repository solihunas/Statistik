import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves this repo at /Statistik/, so assets must be
  // referenced under that subpath in production builds.
  base: process.env.GITHUB_PAGES ? '/Statistik/' : '/',
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
  },
})
