import { getServiceEnvConfig } from '@/utils/envConfig'
import { createRequest } from './request'

const { url, proxyPattern } = getServiceEnvConfig(import.meta.env as ServiceEnvSpace.ImportMetaEnv)

const isHttpProxy = import.meta.env.VITE_HTTP_PROXY === 'Y'

export const request = createRequest({
  baseURL: isHttpProxy ? proxyPattern : url
})

export const mockRequest = createRequest({ baseURL: '/mock' })

export const testRequest = createRequest({ baseURL: 'http://localhost:8888' })
