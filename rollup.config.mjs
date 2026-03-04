import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import preserveShebang from 'rollup-plugin-preserve-shebang';

/** @type {import('rollup').RollupOptions} */
export default [
    // Lib
    {
        input: "src/index.ts",
        output: {
            dir: 'dist/lib',
            format: "cjs",
            sourcemap: true,
            exports: 'named'
        },
        external: ['better-sqlite3'],
        plugins: [
            nodeResolve({ preferBuiltins: true }),
            commonjs({ defaultIsModuleExports: true, ignoreDynamicRequires: true }),
            json(),
            typescript({ tsconfig: 'tsconfig.lib.json' })
        ]
    },
    // Cli
    {
        input: "src/cli.ts",
        output: {
            dir: 'dist/cli',
            format: "cjs",
            sourcemap: true
        },
        external: ['gscrap'],
        plugins: [
            nodeResolve({ preferBuiltins: true }),
            preserveShebang(),
            commonjs({ defaultIsModuleExports: true }),
            json(),
            typescript({ tsconfig: 'tsconfig.cli.json' })
        ]
    }
]