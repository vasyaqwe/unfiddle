import { cva } from "class-variance-authority"

export const DIALOG_STYLES = {
   transition:
      "transition-all duration-150 data-[ending-style]:scale-[98%] data-[starting-style]:scale-[102%] data-[ending-style]:opacity-0 data-[starting-style]:opacity-0",
   popup: "rounded-xl bg-background p-4 shadow-md outline outline-transparent dark:outline-surface-3",
   center:
      "-mt-8 max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2",
   backdrop:
      "fixed inset-0 bg-black opacity-25 dark:opacity-50 transition-all duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0",
   title: "-mt-1 mb-2 font-semibold text-lg",
   description: "mb-6 text-muted text-sm/6",
   footer: "flex justify-end gap-3 pt-3",
}

export const dialog = cva("", {
   variants: {
      size: {
         sm: "w-96",
         md: "w-116",
         lg: "w-132",
      },
   },
   defaultVariants: {
      size: "md",
   },
})
