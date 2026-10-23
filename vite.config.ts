import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// Split the heavy web3 / animation / terminal vendors into independently
// cacheable chunks so a MetaMask SDK bump doesn't bust the others.
function manualChunks(id: string): string | undefined {
  if (!id.includes('node_modules')) return undefined
  if (
    id.includes('wagmi') || id.includes('viem') || id.includes('@coinbase') ||
    id.includes('@wagmi') || id.includes('@metamask') || id.includes('/ox/') ||
    id.includes('permissionless')
  ) return 'vendor-web3'
  if (id.includes('framer-motion') || id.includes('@motionone')) return 'vendor-motion'
  if (id.includes('@xterm')) return 'vendor-xterm'
  if (id.includes('react-dom') || id.includes('/react/')) return 'vendor-react'
  return undefined
}

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
          src: 'blog/*.md',
          dest: 'blog'
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
    rollupOptions: {
      output: {
        manualChunks,
      },
    },
  },
  publicDir: 'public',
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
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
