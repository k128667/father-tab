import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      '/HPImageArchive.aspx': {
        target: 'https://www.bing.com',
        changeOrigin: true,
      },
      '/qsonhs.aspx': {
        // target: 'https://sg1.api.bing.com',
        target: 'https://api.bing.com',
        changeOrigin: true,
      },
      '/su': {
        target: 'https://suggestion.baidu.com',
        changeOrigin: true,
      },
    }

  }
})
