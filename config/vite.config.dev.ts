import { mergeConfig } from 'vite'
import { resolve } from 'path'
// import eslint from 'vite-plugin-eslint'
import baseConfig from './vite.config.base'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import * as path from 'path'
import { vitePluginForArco } from '@arco-plugins/vite-vue'

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
      // eslint({
      //   fix: true,
      //   cache: false,
      //   // include: ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.vue'],
      //   include: ['src/**/*.vue'],
      //   exclude: ['node_modules']
      // }),
      AutoImport({
        dts: resolve('src/auto-imports.d.ts'),
        imports: ['vue', 'vue-router', 'pinia']
      }),
      // vitePluginForArco({
      //   style: 'css'
      // }),
      Components({
        dts: resolve('src/components.d.ts')
      }),
      createSvgIconsPlugin({
        iconDirs: [resolve(process.cwd(), 'src/assets/bpmnIcons')],
        symbolId: '[name]',
        inject: 'body-last',
        customDomId: '__svg__icons__dom__'
      })
    ]
  },
  baseConfig
)
