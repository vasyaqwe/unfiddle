import { type VariantProps, cva } from "class-variance-authority"
import { cn } from "../utils"

const loading = cva("relative block opacity-95", {
   variants: {
      size: {
         sm: "size-[19px] md:size-[18px]",
         md: "size-[20px] md:size-[19px]",
         lg: "size-[21px] md:size-[20px]",
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
}: React.HTMLAttributes<HTMLOrSVGElement> & VariantProps<typeof loading>) {
   return (
      <svg
         data-loading
         className={cn(loading({ size, className }), className)}
         stroke="currentColor"
         viewBox="0 0 24 24"
         xmlns="http://www.w3.org/2000/svg"
         strokeWidth="3"
         {...props}
      >
         <g>
            <circle
               cx="12"
               cy="12"
               r="9.5"
               fill="none"
               strokeLinecap="round"
            >
               <animate
                  attributeName="stroke-dasharray"
                  dur="1.5s"
                  calcMode="spline"
                  values="0 150;42 150;42 150;42 150"
                  keyTimes="0;0.475;0.95;1"
                  keySplines="0.42,0,0.58,1;0.42,0,0.58,1;0.42,0,0.58,1"
                  repeatCount="indefinite"
               />
               <animate
                  attributeName="stroke-dashoffset"
                  dur="1.5s"
                  calcMode="spline"
                  values="0;-16;-59;-59"
                  keyTimes="0;0.475;0.95;1"
                  keySplines="0.42,0,0.58,1;0.42,0,0.58,1;0.42,0,0.58,1"
                  repeatCount="indefinite"
               />
            </circle>
            <animateTransform
               attributeName="transform"
               type="rotate"
               dur="2s"
               values="0 12 12;360 12 12"
               repeatCount="indefinite"
            />
         </g>
      </svg>
   )
}
