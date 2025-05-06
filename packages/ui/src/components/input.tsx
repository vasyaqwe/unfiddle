import { type VariantProps, cva } from "class-variance-authority"
import { cn } from "../utils"

export const input = cva(
   "w-full outline-hidden transition-colors duration-100 placeholder:text-foreground/50",
   {
      variants: {
         variant: {
            default: "border-primary-4 border-b focus:border-primary-6",
         },
         size: {
            md: "h-12 pt-2.5 text-base md:h-10 md:pt-1",
         },
      },
      defaultVariants: {
         variant: "default",
         size: "md",
      },
   },
)

export function Input({
   className,
   variant,
   size,
   ...props
}: React.ComponentProps<"input"> & VariantProps<typeof input>) {
   return (
      <input
         className={cn(input({ variant, size, className }))}
         {...props}
      />
   )
}
