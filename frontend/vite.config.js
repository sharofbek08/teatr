import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  // Faqat server portini o‘qiymiz; maxfiy qiymatlar brauzerga berilmaydi.
  const env = loadEnv(mode, process.cwd(), 'PORT')
  const apiPort = process.env.PORT || env.PORT || '3002'
  return {
    plugins: [vue()],
    server: {
      port: 5174,
      strictPort: true,
      proxy: { '/api': `http://127.0.0.1:${apiPort}` },
    },
    build: {
      minify: false,
      cssMinify: false,
    },
  }
})
