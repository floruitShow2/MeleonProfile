export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.readAsText(file)
    fileReader.onload = (e) => {
      const result = e.target?.result
      if (!result) {
        reject()
        return
      }
      resolve(result.toString())
    }
  })
}
