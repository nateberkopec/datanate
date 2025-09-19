import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

export default {
  input: 'assets/app.js',
  output: {
    file: 'dist/app.js',
    format: 'iife',
    name: 'DatanateApp'
  },
  plugins: [
    nodeResolve(),
    terser()
  ]
};