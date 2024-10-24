import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import { terser } from 'rollup-plugin-terser'
import external from 'rollup-plugin-peer-deps-external'
import rollupPluginDts from 'rollup-plugin-dts'
import progress from 'rollup-plugin-progress'

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        format: 'cjs',
        name: 'sfc-bundler',
        file: 'dist/index.cjs',
      },
      {
        format: 'esm',
        file: 'dist/index.esm.js',
      },
    ],
    plugins: [
      external(),
      resolve(),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json' }),
      terser(),
      progress({
        clearLine: false,
      }),
    ],
  },
  {
    input: ['src/index.ts'],
    output: [{ file: 'dist/index.d.ts', format: 'esm' }],
    plugins: [
      rollupPluginDts.default({
        compilerOptions: {
          preserveSymlinks: false,
        },
      }),
    ],
  },
]
