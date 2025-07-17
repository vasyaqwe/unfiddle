import { type VariantProps, cva } from "class-variance-authority"
import { cn } from "../utils"

const badge = cva(
   "inline-flex items-center justify-center gap-2 whitespace-nowrap border font-medium text-sm shadow-xs/3",
   {
      variants: {
         variant: {
            primary: "border-surface-12/11 bg-background text-foreground/80",
         },
         size: {
            sm: "h-[26px] rounded-sm px-1.5",
            md: "h-7 rounded-sm px-2",
            lg: "h-8 rounded-lg px-3",
         },
      },
      defaultVariants: {
         variant: "primary",
         size: "md",
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
