import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: 'assets/app.js',
  output: {
    file: 'dist/app.js',
    format: 'iife',
    name: 'DatanateApp'
  },
  plugins: [
    nodeResolve()
  ]
};