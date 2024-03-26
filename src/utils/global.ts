import { getCurrentInstance } from 'vue'

export const useInstance = () => {
  return getCurrentInstance()?.appContext.config.globalProperties
}

export const useAvatar = () => {
  return new URL(
    `../assets/avatar/avatar_${Math.floor(Math.random() * 5) + 1}.png`,
    import.meta.url
  ).href
}
