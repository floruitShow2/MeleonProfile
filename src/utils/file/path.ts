export const getAssetsFile = (path: string) => {
  return new URL(path, import.meta.url).href
}
