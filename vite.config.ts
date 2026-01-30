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
        },
        {
          src: 'cloudflare/_redirects',
          dest: ''
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
})
