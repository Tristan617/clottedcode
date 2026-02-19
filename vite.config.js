import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    // Polyfill Buffer and other Node globals used by lz4js / zstd-codec
    nodePolyfills({ include: ['buffer', 'process'] }),
  ],
  base: '/clottedcode/',
  build: {
    target: 'es2020',
    outDir: 'dist',
  },
  optimizeDeps: {
    include: ['lz4js', 'zstd-codec', 'pako'],
  },
});
