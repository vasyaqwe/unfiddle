import { type VariantProps, cva } from "class-variance-authority"
import { FOCUS_STYLES } from "../constants"
import { cn } from "../utils"
import { Loading } from "./loading"

export const button = cva(
   [
      "inline-flex items-center justify-center whitespace-nowrap text-[0.95rem] leading-none",
      "relative cursor-pointer border border-transparent transition-all duration-100 disabled:opacity-75",
   ],
   {
      variants: {
         variant: {
            primary:
               "bg-accent-6 font-[400] text-shadow-md shadow-[inset_0_-2.5px_1px_0_var(--tw-shadow-color,rgb(0_0_0_/_0.2)),0_1px_3px_0_var(--tw-shadow-color,_rgb(0_0_0_/_0.1)),_0_1px_2px_-1px_var(--tw-shadow-color,_rgb(0_0_0_/_0.1))] hover:bg-accent-5 active:bg-accent-6",
            secondary:
               "border border-primary-5 bg-primary-3 text-shadow-xs shadow-[inset_0_-1.5px_1px_0_var(--tw-shadow-color,rgb(0_0_0_/_0.1)),0_1px_2px_0_var(--tw-shadow-color,_rgb(0_0_0_/_0.04)),_0_1px_2px_-1px_var(--tw-shadow-color,_rgb(0_0_0_/_0.04))] hover:border-primary-4 hover:bg-primary-2 active:bg-primary-3 has-[+dialog[open]]:border-primary-4 has-[+dialog[open]]:bg-primary-2",
            ghost: "bg-transparent hover:bg-primary-2 aria-[current=page]:bg-primary-2",
         },
         size: {
            sm: "h-9 rounded-md px-2 md:h-7",
            md: "h-9 rounded-lg px-2.5 md:h-[1.9rem]",
            lg: "h-10 rounded-xl px-3 md:h-[2.1rem]",
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
