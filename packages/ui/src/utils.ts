import { cx as cxBase } from "class-variance-authority"
import { twMerge } from "tailwind-merge"

export const formData = <T>(target: EventTarget) => {
   const formData = new FormData(target as HTMLFormElement)
   return Object.fromEntries(formData.entries()) as T
}

export const cx = cxBase
export const cn = (...inputs: Parameters<typeof cx>) => twMerge(cx(inputs))

export const number = (str: string) => {
   if (!str) return 0
   return +str
   // // Remove all commas, spaces, and any currency symbols
   // const cleanedStr = str.replace(/[,\s$£€]/g, "")
   // const result = parseFloat(cleanedStr)
   // return Number.isNaN(result) ? 0 : result
}
