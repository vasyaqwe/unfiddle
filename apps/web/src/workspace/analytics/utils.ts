// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const isChartDataEmpty = (arr: any[]) => {
   if (arr.length === 0) return true

   for (const obj of arr) {
      for (const key in obj) {
         if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key]
            if (typeof value !== "string") {
               if (value !== 0 && value !== null) {
                  return false
               }
            }
         }
      }
   }

   return true
}
