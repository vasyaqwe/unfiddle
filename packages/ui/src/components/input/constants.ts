import { cva } from "class-variance-authority"

export const input = cva(
   "w-full outline-hidden transition-colors duration-100 placeholder:text-foreground/50",
   {
      variants: {
         variant: {
            default: "border-surface-4 border-b focus:border-surface-6",
         },
         size: {
            md: "h-12 pt-2 text-base md:h-10 md:pt-1",
         },
      },
      defaultVariants: {
         variant: "default",
         size: "md",
      },
   },
)
