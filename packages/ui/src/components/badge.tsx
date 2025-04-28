import { type VariantProps, cva } from "class-variance-authority"
import { cn } from "../utils"

export const badge = cva(
   "inline-flex items-center justify-center gap-2 whitespace-nowrap border",
   {
      variants: {
         variant: {
            default: `shadow-xs bg-background border-neutral text-foreground/95`,
         },
         size: {
            default: "h-8 rounded-md px-3 text-sm",
            sm: "h-[29px] rounded-lg px-2.5 text-xs",
         },
      },
      defaultVariants: {
         variant: "default",
         size: "default",
      },
   },
)

export function Badge({
   className,
   variant,
   size,
   ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badge>) {
   return (
      <span
         className={cn(badge({ variant, size, className }))}
         {...props}
      />
   )
}
