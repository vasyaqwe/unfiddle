import { type VariantProps, cva } from "class-variance-authority"
import { FOCUS_STYLES } from "../constants"
import { cn } from "../utils"
import { Loading } from "./loading"

export const button = cva(
   [
      "inline-flex items-center justify-center overflow-hidden whitespace-nowrap leading-none",
      "relative cursor-pointer transition-all duration-100 disabled:opacity-80 [&>svg]:shrink-0 [&>svg]:drop-shadow-md",
   ],
   {
      variants: {
         variant: {
            primary:
               "bg-accent-6 font-[400] text-shadow-md/7 shadow-[inset_0_-2.5px_1px_0_rgb(0_0_0_/_0.2),0_1px_3px_0_rgb(0_0_0_/_0.1),_0_1px_2px_-1px_rgb(0_0_0_/_0.1)] hover:bg-accent-5 active:bg-accent-6",
            secondary:
               "border border-primary-4 bg-background shadow-[inset_0_-1px_0.5px_rgb(0_0_0_/_0.15)] hover:bg-primary-1 active:bg-primary-2",
            ghost: "border border-transparent bg-transparent [--active-color:var(--color-primary-3)] hover:bg-(--active-color) aria-[current=page]:bg-(--active-color) data-[popup-open]:bg-(--active-color)",
         },
         size: {
            sm: "h-9 rounded-sm px-2 md:h-7",
            md: "h-9 rounded-md px-3 md:h-[1.9rem] md:px-2.5",
            lg: "h-10 rounded-lg px-3 md:h-[2.1rem]",
         },
         kind: {
            default:
               "md:[&>svg]:-ml-[0.3rem] [&>svg]:-ml-[0.2rem] gap-1.5 has-[svg]:gap-1",
            icon: "aspect-square w-auto justify-center px-0 md:px-0",
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
               ? "focus-visible:ring-primary-7"
               : "",
         )}
         style={{
            color: !variant || variant === "primary" ? "white" : undefined,
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
