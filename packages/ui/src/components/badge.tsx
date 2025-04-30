import { type VariantProps, cva } from "class-variance-authority"
import { cn } from "../utils"

export const badge = cva(
   "inline-flex items-center justify-center gap-2 whitespace-nowrap border font-medium text-sm shadow-[inset_0_-1px_2px_0_rgb(0_0_0_/_0.1)]",
   {
      variants: {
         variant: {
            primary: "border-neutral bg-background text-foreground/80",
         },
         size: {
            sm: "h-[1.5rem] rounded-[0.3rem] px-1.5 text-xs",
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
