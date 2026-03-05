import { build } from 'esbuild';

build({
    entryPoints: ['src/index.ts'],
    bundle: true,
    outfile: 'dist/index.js',
    format: 'esm',
    sourcemap: true,
    platform: 'node',
    target: 'es2020',
    packages: 'external'
}).catch(() => process.exit(1))