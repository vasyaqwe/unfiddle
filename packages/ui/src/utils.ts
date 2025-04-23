import { cx as cxBase } from "class-variance-authority"
import { twMerge } from "tailwind-merge"

export const formData = <T>(target: EventTarget) => {
   const formData = new FormData(target as HTMLFormElement)
   return Object.fromEntries(formData.entries()) as T
}

export const cx = cxBase
export const cn = (...inputs: Parameters<typeof cx>) => twMerge(cx(inputs))
