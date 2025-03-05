// import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import esbuild from 'rollup-plugin-esbuild'
import { readFileSync } from 'fs';
// import pkg from "./package.json"
const pkg = JSON.parse(readFileSync('./package.json'))

export default {
    input: 'src/index.ts',
    output: {
        dir: 'dist',
        format: 'es',
        sourcemap: false,
    },
    plugins: [
        esbuild({
            minify: false,
            sourcemap: false,
            target: 'es2015',
            tsconfig: './tsconfig.json',
            banner: '#!/usr/bin/env node',
        }),
        resolve({
        }),
        commonjs({
        }),
        json(),
        
    ],
    external: Object.keys(pkg.dependencies || {})
};
