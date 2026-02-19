import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { execSync } from 'child_process';

const commitHash = (() => {
  try { return execSync('git rev-parse --short HEAD').toString().trim(); }
  catch { return 'unknown'; }
})();
const branch = (() => {
  try { return execSync('git rev-parse --abbrev-ref HEAD').toString().trim(); }
  catch { return 'unknown'; }
})();

export default defineConfig({
  plugins: [
    // Polyfill Buffer and other Node globals used by lz4js / zstd-codec
    nodePolyfills({ include: ['buffer', 'process'] }),
  ],
  define: {
    __GIT_COMMIT__: JSON.stringify(commitHash),
    __GIT_BRANCH__: JSON.stringify(branch),
  },
  base: '/clottedcode/',
  build: {
    target: 'es2020',
    outDir: 'dist',
  },
  optimizeDeps: {
    include: ['lz4js', 'zstd-codec', 'pako'],
  },
});
