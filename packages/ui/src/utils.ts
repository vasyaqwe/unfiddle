import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export const formData = <T>(target: EventTarget) => {
   const formData = new FormData(target as HTMLFormElement)
   return Object.fromEntries(formData.entries()) as T
}

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))

export const number = (str: string) => {
   if (!str) return 0
   return +str
   // // Remove all commas, spaces, and any currency symbols
   // const cleanedStr = str.replace(/[,\s$£€]/g, "")
   // const result = parseFloat(cleanedStr)
   // return Number.isNaN(result) ? 0 : result
}

export const formatList = (items: string[], locale = "uk") => {
   const formatter = new Intl.ListFormat(locale, {
      style: "long",
      type: "conjunction",
   })
   return formatter.format(items)
}
