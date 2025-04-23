import { Input as InputPrimitive } from "@base-ui-components/react/input"
import { type VariantProps, cva } from "class-variance-authority"
import { cn } from "../utils"

export const input = cva(
   "w-full outline-hidden transition-[box-shadow] duration-75 placeholder:text-foreground/50",
   {
      variants: {
         variant: {
            default:
               "border border-transparent bg-primary-2 focus-visible:shadow-[inset_0_0_0_1px_var(--color-primary-4)]",
         },
         size: {
            md: "h-10 rounded-xl px-3 text-base md:h-9",
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
}: React.ComponentProps<typeof InputPrimitive> & VariantProps<typeof input>) {
   return (
      <InputPrimitive
         className={cn(input({ variant, size, className }))}
         {...props}
      />
   )
}
