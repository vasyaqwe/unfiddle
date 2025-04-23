export const parseJson = <T>(json: string): Promise<T> =>
   new Promise((resolve, reject) => {
      try {
         const result = JSON.parse(json) as T
         resolve(result)
      } catch (error) {
         reject(error)
      }
   })
