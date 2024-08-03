import axios, { AxiosResponse } from 'axios'
import { Message } from '@arco-design/web-vue'

// 此处打包时需要流程
// 如果打包给后端则需要去掉/dragon-api；如果打包给前端则需要加上/dragon-api
// axios.defaults.baseURL = IS_PROD ? '/' : '/dragon-api' //接口请求地址
axios.defaults.baseURL = '/'
axios.defaults.timeout = 100 * 1000
axios.defaults.withCredentials = true
axios.defaults.headers.post['Content-Type'] = 'application/json;charset=utf-8' //post请求头
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest' //默认异步请求

//请求拦截器
axios.interceptors.request.use(
  (request) => {
    try {
      if (parent.window) {
        // 业务系统需要设置tokenKey和tokenValue
        const authorizationKey = parent.window.localStorage.getItem('authorizationKey') as string
        const authorizationValue = parent.window.localStorage.getItem('authorizationValue')
        parent.window.localStorage.getItem('flowtoken')
        request.headers.flowtoken = parent.window.localStorage.getItem('flowtoken')
        request.headers[authorizationKey] = authorizationValue
      } else {
        console.error('只在在流程中心用iframe打开，才能获取token!')
      }
    } catch (e) {
      request.headers.flowtoken = localStorage.getItem('flowtoken')
      const authorizationKey = window.localStorage.getItem('authorizationKey') as string
      request.headers[authorizationKey] = window.localStorage.getItem('authorizationValue')
      console.error('获取父窗口的token失败！' + e)
    }
    return request
  },
  (error) => {
    return Promise.reject(error)
  }
)
//响应拦截器
axios.interceptors.response.use(
  (response: AxiosResponse) => {
    if (response && response.status == 200) {
      const code = response.data.code
      const msg = response.data.msg
      if (code === '100') {
        //条件判断，自行和后端商量定义
        return Promise.resolve(response.data)
      } else if (code == 400) {
        //自定义处理
      } else if (code === '101') {
        Message.error(msg)
        return Promise.reject(msg)
      } else {
        //错误处理
        return Promise.reject(response.data)
      }
    } else {
      return Promise.reject(response?.data)
    }
  },
  (error) => {
    if (!error.response) {
      return Promise.reject(error)
    } else {
      // 返回错误信息
      return Promise.reject(error)
    }
  }
)
export default axios
