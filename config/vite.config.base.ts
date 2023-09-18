import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import svgLoader from 'vite-svg-loader'
import configMock from './plugin/mock'
import configArcoStyleImportPlugin from './plugin/arcoStyleImport'

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    configMock(),
    svgLoader({ svgoConfig: {} }),
    configArcoStyleImportPlugin()
  ],
  resolve: {
    alias: [
      {
        find: '@',
        replacement: resolve(__dirname, '../src')
      },
      {
        find: '~',
        replacement: resolve(__dirname, '..')
      },
      {
        find: 'assets',
        replacement: resolve(__dirname, '../src/assets')
      },
      {
        find: 'vue-i18n',
        replacement: 'vue-i18n/dist/vue-i18n.cjs.js' // Resolve the i18n warning issue
      },
      {
        find: 'vue',
        replacement: 'vue/dist/vue.esm-bundler.js' // compile template
      }
    ],
    extensions: ['.ts', '.js', '.tsx', 'md']
  },
  define: {
    'process.env': {}
  },
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: {
          hack: `true; @import (reference) "${resolve('src/assets/style/breakpoint.less')}";`
        },
        javascriptEnabled: true
      }
    }
  },
  optimizeDeps: {
    include: [
      `monaco-editor/esm/vs/language/json/json.worker`,
      `monaco-editor/esm/vs/language/css/css.worker`,
      `monaco-editor/esm/vs/language/html/html.worker`,
      `monaco-editor/esm/vs/language/typescript/ts.worker`,
      `monaco-editor/esm/vs/editor/editor.worker`
    ]
  }
})
