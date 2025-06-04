import { button } from "@unfiddle/ui/components/button/constants"
import type { VariantProps } from "class-variance-authority"
import { FOCUS_STYLES } from "../../constants"
import { cn } from "../../utils"
import { Loading } from "../loading"

interface Props
   extends React.ComponentProps<"button">,
      VariantProps<typeof button> {
   pending?: boolean | undefined
}

export function Button({
   className,
   variant,
   size,
   kind,
   children,
   pending,
   ...props
}: Props) {
   return (
      <button
         className={cn(
            button({ variant, size, kind, className }),
            FOCUS_STYLES,
            !variant || variant === "primary"
               ? "focus-visible:ring-surface-7"
               : "",
         )}
         style={{
            color:
               !variant || variant === "primary" || variant === "destructive"
                  ? "white"
                  : undefined,
         }}
         {...props}
      >
         {pending === undefined ? (
            children
         ) : (
            <>
               <span
                  className={cn(
                     "data-[inactive]:-translate-y-8 md:data-[inactive]:-translate-y-6 invisible flex items-center justify-center gap-2 data-[active]:visible data-[active]:translate-y-0 data-[inactive]:scale-90 data-[active]:opacity-100 data-[inactive]:opacity-0",
                  )}
                  data-active={!pending ? "" : undefined}
                  data-inactive={pending ? "" : undefined}
               >
                  {children}
               </span>
               <span
                  data-active={pending ? "" : undefined}
                  className={cn(
                     "invisible absolute inset-0 m-auto block h-fit translate-y-8 opacity-0 data-[active]:visible data-[active]:translate-y-0 data-[active]:opacity-100 md:translate-y-6",
                  )}
               >
                  <Loading
                     size={size}
                     className="mx-auto"
                  />
               </span>
            </>
         )}
      </button>
   )
}
