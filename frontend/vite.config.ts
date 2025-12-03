import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vite.dev/config/
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      protocolImports: true,
    }),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/@zama-fhe/relayer-sdk/lib/tfhe_bg.wasm',
          dest: '.'
        }
      ]
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
    allowedHosts: ['929b068c7fd4.ngrok-free.app'],
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'credentialless',
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  assetsInclude: ['**/*.wasm'],
  optimizeDeps: {
    exclude: ['@zama-fhe/relayer-sdk'],
    include: ['js-sha3', 'keccak', 'fetch-retry'],
  },
  define: {
    'global': 'globalThis',
  },

})
