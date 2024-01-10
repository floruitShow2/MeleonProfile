// import type { ServiceEnvType } from '@/typings/env'
/** 请求服务的环境配置 */
type ServiceEnv = Record<ServiceEnvSpace.ServiceEnvType, ServiceEnvSpace.ServiceEnvConfig>

/** 不同请求服务的环境配置 */
const serviceEnv: ServiceEnv = {
  dev: {
    // 'http://localhost:3000'
    // 'http://192.168.124.40:3000'
    url: 'http://192.168.124.40:3000'
  },
  test: {
    url: 'http://localhost:3000'
  },
  prod: {
    url: 'http://localhost:3000'
  }
}

/**
 * 获取当前环境模式下的请求服务的配置
 * @param env 环境
 */
export function getServiceEnvConfig(
  env: ImportMetaEnv
): ServiceEnvSpace.ServiceEnvConfigWithProxyPattern {
  const { VITE_SERVICE_ENV = 'dev' } = env

  const config = serviceEnv[VITE_SERVICE_ENV]

  return {
    ...config,
    proxyPattern: '/proxy-pattern'
  }
}
