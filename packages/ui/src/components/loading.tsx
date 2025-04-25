import { type VariantProps, cva } from "class-variance-authority"
import { cn } from "../utils"

const loading = cva("!relative sonner-loading-wrapper", {
   variants: {
      size: {
         sm: "![--size:20px] md:![--size:16px]",
         md: "![--size:20px] md:![--size:18px]",
         lg: "![--size:21px] md:![--size:19px]",
      },
   },
   defaultVariants: {
      size: "md",
   },
})

export function Loading({
   className,
   size,
   ...props
}: React.ComponentProps<"div"> & VariantProps<typeof loading>) {
   return (
      <div
         data-visible={true}
         className={cn(loading({ size, className }))}
         {...props}
      >
         <div className="sonner-spinner">
            {Array(12)
               .fill(0)
               .map((_, idx) => (
                  <div
                     style={{ background: "unset" }}
                     className="sonner-loading-bar !bg-current"
                     key={idx}
                  />
               ))}
         </div>
      </div>
   )
}
