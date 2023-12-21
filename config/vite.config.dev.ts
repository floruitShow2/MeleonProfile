import { mergeConfig } from 'vite'
import eslint from 'vite-plugin-eslint'
import baseConfig from './vite.config.base'

export default mergeConfig(
  {
    mode: 'development',
    target: 'es2020',
    server: {
      open: true,
      cors: true,
      port: 8080,
      fs: {
        strict: true
      }
    },
    plugins: [
      eslint({
        cache: false,
        include: ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.vue'],
        exclude: ['node_modules']
      })
    ]
  },
  baseConfig
)
