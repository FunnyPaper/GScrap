import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import preserveShebang from "rollup-plugin-preserve-shebang";
import json from "@rollup/plugin-json";

/** @type {import('rollup').RollupOptions} */
export default [
    // Lib
    {
        input: "src/index.ts",
        output: [
            {
                file: "dist/index.js",
                format: "esm",
                sourcemap: true
            }
        ],
        plugins: [
            nodeResolve({ preferBuiltins: true }),
            commonjs(),
            typescript(),
            terser()
        ]
    },
    // Cli
    {
        input: "src/cli.ts",
        output: {
            file: "dist/cli.js",
            format: "esm",
            sourcemap: true
        },
        plugins: [
            preserveShebang(),
            nodeResolve({ preferBuiltins: true }),
            json(),
            commonjs(),
            typescript(),
            terser()
        ],
    }
]