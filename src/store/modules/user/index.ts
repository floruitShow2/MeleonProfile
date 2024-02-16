import { defineStore } from 'pinia'
import { login as userLogin, logout as userLogout, getUserInfo, LoginData } from '@/api/auth'
import { localStg } from '@/utils/storage'
import { removeRouteListener } from '@/utils/route-listener'
import useAppStore from '../app'

const useUserStore = defineStore('user', {
  state: (): ApiAuth.UserInfo => ({
    userId: '',
    username: '',
    avatar: '',
    introduction: '',
    email: '',
    phone: '',
    location: '',
    role: '',
    socialAccounts: [],
    job: '',
    organization: '',
    registrationDate: '',
    certification: ''
  }),

  getters: {
    userInfo(state: ApiAuth.UserInfo): ApiAuth.UserInfo {
      return { ...state }
    },
    getName(state: ApiAuth.UserInfo): string {
      return state.username || ''
    }
  },

  actions: {
    switchRoles() {
      return new Promise((resolve) => {
        this.role = this.role === 'user' ? 'admin' : 'user'
        resolve(this.role)
      })
    },
    // Set user's information
    setInfo(partial: Partial<ApiAuth.UserInfo>) {
      this.$patch(partial)
    },

    // Reset user's information
    resetInfo() {
      this.$reset()
    },

    // Get user's information
    async info() {
      const res = await getUserInfo()
      if (!res.data) return
      this.setInfo(res.data)
    },

    // Login
    async login(loginForm: LoginData) {
      try {
        const res = await userLogin(loginForm)
        if (!res.data) {
          throw res.error
        }
        localStg.set('token', res.data.accessToken)
      } catch (err) {
        localStg.remove('token')
        throw err
      }
    },
    logoutCallBack() {
      const appStore = useAppStore()
      this.resetInfo()
      localStg.remove('token')
      removeRouteListener()
      appStore.clearServerMenu()
    },
    // Logout
    async logout() {
      try {
        await userLogout()
      } finally {
        this.logoutCallBack()
      }
    }
  }
})

export default useUserStore
