import { resolve } from 'path'
import { mergeConfig } from 'vite'
import baseConfig from './vite.config.base'
import configCompressPlugin from './plugin/compress'
import configVisualizerPlugin from './plugin/visualizer'
import configArcoResolverPlugin from './plugin/arcoResolver'
import configImageminPlugin from './plugin/imagemin'
import configHtmlPlugin from './plugin/html'

export default mergeConfig(
  {
    base: './',
    mode: 'production',
    plugins: [
      configCompressPlugin('gzip'),
      configVisualizerPlugin(),
      configArcoResolverPlugin(),
      configImageminPlugin(),
      configHtmlPlugin()
    ],
    build: {
      target: 'es2015',
      outDir: 'dist', // 指定输出目录
      assetsDir: 'assets', // 指定生成静态资源的存放路径
      rollupOptions: {
        input: {
          main: resolve(__dirname, '../index.html')
        },
        output: {
          chunkFileNames: 'js/[name]-[hash].js', // 引入文件名的名称
          entryFileNames: 'js/[name]-[hash].js', // 包的入口文件名称
          assetFileNames: '[ext]/[name]-[hash].[ext]' // 资源文件像 字体，图片等
          // manualChunks: {
          //   arco: ['@arco-design/web-vue'],
          //   chart: ['echarts', 'vue-echarts'],
          //   vue: ['vue', 'vue-router', 'pinia', '@vueuse/core', 'vue-i18n']
          // }
        }
      },
      chunkSizeWarningLimit: 2000
    }
  },
  baseConfig
)
