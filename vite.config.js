import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/basketball-tournament/',
  plugins: [react()],
})
