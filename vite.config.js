import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// On GitHub Pages the app is served from /<repo>/, so use that base for the
// production build. Local dev stays at the root for convenience.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/HR-Cablenet-Dashboard/' : '/',
  plugins: [react(), tailwindcss()],
}))
