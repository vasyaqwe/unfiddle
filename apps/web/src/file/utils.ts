export const imageDimensions = async (
   file: File,
): Promise<{ width: number; height: number }> => {
   return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (event) => {
         const img = new Image()
         img.onload = () => {
            resolve({ width: img.width, height: img.height })
         }
         img.onerror = (_error) => {
            reject(new Error("Failed to load image"))
         }
         img.src = event.target?.result as string
      }

      reader.onerror = (_error) => {
         reject(new Error("Failed to read file"))
      }

      reader.readAsDataURL(file)
   })
}

export const fileToBase64 = (file: File): Promise<string> => {
   return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
         const base64 = (reader.result as string).split(",")[1]
         resolve(base64 ?? "")
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
   })
}
