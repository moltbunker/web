import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'docs/*.md',
          dest: 'docs'
        },
        {
          src: 'docs/examples/*.md',
          dest: 'docs/examples'
        },
        {
          src: 'whitepaper/*.md',
          dest: 'whitepaper'
        }
      ]
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  publicDir: 'public',
  server: {
    proxy: {
      '/v1/exec/ws': {
        target: 'https://api.moltbunker.com',
        changeOrigin: true,
        secure: true,
        ws: true,
      },
      '/v1/ws': {
        target: 'https://api.moltbunker.com',
        changeOrigin: true,
        secure: true,
        ws: true,
      },
      '/v1': {
        target: 'https://api.moltbunker.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
