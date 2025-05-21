import { type VariantProps, cva } from "class-variance-authority"
import { cn } from "../utils"

const loading = cva("sonner-loading-wrapper", {
   variants: {
      size: {
         xs: "![--size:19px] md:![--size:15px]",
         sm: "![--size:20px] md:![--size:16px]",
         md: "![--size:20px] md:![--size:18px]",
         lg: "![--size:21px] md:![--size:19px]",
         xl: "![--size:24px] md:![--size:26px]",
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
         style={{
            position: "relative",
         }}
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
