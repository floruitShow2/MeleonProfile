import { mergeConfig } from 'vite'
import baseConfig from './vite.config.base'
import configCompressPlugin from './plugin/compress'
import configVisualizerPlugin from './plugin/visualizer'
import configArcoResolverPlugin from './plugin/arcoResolver'
import configImageminPlugin from './plugin/imagemin'

export default mergeConfig(
  {
    mode: 'production',
    plugins: [
      configCompressPlugin('gzip'),
      configVisualizerPlugin(),
      configArcoResolverPlugin(),
      configImageminPlugin()
    ],
    build: {
      rollupOptions: {
        output: {
          chunkFileNames: 'static/js/[name]-[hash].js',
          entryFileNames: 'static/js/[name]-[hash].js',
          assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
          manualChunks: {
            arco: ['@arco-design/web-vue', '@arco-design/web-vue/es/icon'],
            chart: ['echarts', 'vue-echarts'],
            vue: ['vue', 'vue-router', 'pinia', '@vueuse/core', 'vue-i18n']
          },
          terserOptions: { 
            compress: { // 打包时清除 console 和 debug 相关代码
              drop_console: true,
              drop_debugger: true,
            }
          }
        }
      },
      chunkSizeWarningLimit: 500
    }
  },
  baseConfig
)
