import { cn } from "@ledgerblocks/ui/utils"

export function Logo({ className, ...props }: React.ComponentProps<"svg">) {
   return (
      <svg
         xmlns="http://www.w3.org/2000/svg"
         viewBox="0 0 24 24"
         className={cn("size-8 drop-shadow-sm/8", className)}
         {...props}
      >
         <g fill="currentColor">
            <path
               d="M6,5.014,9.881,3.073,6.447,1.356a1,1,0,0,0-.9,0L2.118,3.073Z"
               fill="#22c55e"
            />
            <path
               d="M7,6.75v5.382l3.447-1.724A1,1,0,0,0,11,9.514V4.75Z"
               fill="#22c55e"
            />
            <path
               d="M5,6.75l-4-2V9.514a1,1,0,0,0,.552.894L5,12.132Z"
               fill="#22c55e"
            />
            <path
               d="M18,5.014l3.882-1.941L18.447,1.356a1,1,0,0,0-.894,0L14.118,3.073Z"
               fill="#C084FC"
            />
            <path
               d="M19,6.75v5.382l3.447-1.724A1,1,0,0,0,23,9.514V4.75Z"
               fill="#C084FC"
            />
            <path
               d="M17,6.75l-4-2V9.514a1,1,0,0,0,.553.894L17,12.132Z"
               fill="#C084FC"
            />
            <path
               d="M12,15.75l3.882-1.941-3.435-1.717a1,1,0,0,0-.894,0L8.118,13.809Z"
               fill="#F87171"
            />
            <path
               d="M13,17.486v5.382l3.447-1.724A1,1,0,0,0,17,20.25V15.486Z"
               fill="#F87171"
            />
            <path
               d="M11,17.486l-4-2V20.25a1,1,0,0,0,.553.894L11,22.868Z"
               fill="#F87171"
            />
         </g>
      </svg>
   )
}
