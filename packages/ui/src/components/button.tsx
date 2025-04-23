import { type VariantProps, cva } from "class-variance-authority"
import { FOCUS_STYLES } from "../constants"
import { cn } from "../utils"
import { Loading } from "./loading"

export const button = cva(
   [
      "inline-flex items-center justify-center whitespace-nowrap text-[0.95rem] leading-none",
      "relative cursor-pointer rounded-full border border-transparent transition-all duration-75 disabled:opacity-75",
   ],
   {
      variants: {
         variant: {
            primary:
               "bg-gradient-to-t from-accent-9 to-accent-7 font-[400] text-shadow-md/7 shadow-xs hover:from-accent-10 hover:to-accent-8",
            secondary: "bg-primary-2 hover:bg-primary-3",
            ghost: "bg-transparent hover:bg-primary-1 aria-[current=page]:bg-primary-1",
         },
         size: {
            sm: "h-8 px-3 md:h-7",
            md: "h-9 px-3.5 md:h-8",
            lg: "h-11 px-4 md:h-10",
         },
         kind: {
            default: "gap-1.5",
            icon: "aspect-square w-auto justify-center",
         },
      },
      defaultVariants: {
         variant: "primary",
         size: "md",
         kind: "default",
      },
   },
)

interface Props
   extends React.ComponentProps<"button">,
      VariantProps<typeof button> {
   isPending?: boolean | undefined
}

export function Button({
   className,
   variant,
   size,
   kind,
   children,
   isPending,
   ...props
}: Props) {
   return (
      <button
         className={cn(
            button({ variant, size, kind, className }),
            FOCUS_STYLES,
         )}
         // text-white & text-shadow conflict
         style={{
            color: !variant || variant === "primary" ? "white" : undefined,
         }}
         {...props}
      >
         {isPending === undefined ? (
            children
         ) : (
            <>
               <span
                  className={cn(
                     "invisible flex h-full items-center justify-center gap-2 transition-all duration-200 ease-vaul data-[active]:visible data-[active]:translate-y-0 data-[inactive]:translate-y-1 data-[inactive]:scale-[97%] data-[active]:opacity-100 data-[inactive]:opacity-0",
                  )}
                  data-active={!isPending ? "" : undefined}
                  data-inactive={isPending ? "" : undefined}
               >
                  {children}
               </span>
               <span
                  data-active={isPending ? "" : undefined}
                  className={cn(
                     "-translate-y-1 invisible absolute inset-0 m-auto block h-fit opacity-0 transition-all duration-200 ease-vaul data-[active]:visible data-[active]:translate-y-0 data-[active]:opacity-100",
                  )}
               >
                  <Loading className="mx-auto" />
               </span>
            </>
         )}
      </button>
   )
}
