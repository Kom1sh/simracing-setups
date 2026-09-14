import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Сайт живёт на GitHub Pages по адресу kom1sh.github.io/simracing-setups/
export default defineConfig({
  base: '/simracing-setups/',
  plugins: [react()],
})
