import { type VariantProps, cva } from "class-variance-authority"
import { FOCUS_STYLES } from "../constants"
import { cn } from "../utils"
import { Loading } from "./loading"

export const button = cva(
   [
      "inline-flex items-center justify-center whitespace-nowrap text-[0.95rem] leading-none",
      "relative cursor-pointer border border-transparent transition-all duration-100 disabled:opacity-80",
   ],
   {
      variants: {
         variant: {
            primary:
               "bg-accent-6 font-[400] text-shadow-md shadow-[inset_0_-2.5px_1px_0_var(--tw-shadow-color,rgb(0_0_0_/_0.2)),0_1px_3px_0_var(--tw-shadow-color,_rgb(0_0_0_/_0.1)),_0_1px_2px_-1px_var(--tw-shadow-color,_rgb(0_0_0_/_0.1))] hover:bg-accent-5 active:bg-accent-6",
            secondary:
               "border border-primary-4 bg-primary-2 text-shadow-xs shadow-[inset_0_-1.5px_1px_0_var(--tw-shadow-color,rgb(0_0_0_/_0.1)),0_1px_2px_0_var(--tw-shadow-color,_rgb(0_0_0_/_0.04)),_0_1px_2px_-1px_var(--tw-shadow-color,_rgb(0_0_0_/_0.04))] hover:border-primary-4 hover:bg-primary-2 active:bg-primary-3",
            ghost: "bg-transparent [--active-color:var(--color-primary-2)] hover:bg-(--active-color) aria-[current=page]:bg-(--active-color) data-[popup-open]:bg-(--active-color)",
         },
         size: {
            sm: "h-9 rounded-sm px-2 md:h-7",
            md: "h-9 rounded-md px-2.5 md:h-[1.9rem]",
            lg: "h-10 rounded-lg px-3 md:h-[2.1rem]",
         },
         kind: {
            default: "gap-1.5",
            icon: "aspect-square w-auto justify-center",
         },
      },
      compoundVariants: [
         {
            variant: "primary",
            className: "text-white",
         },
      ],
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
         )}
         {...props}
      >
         {!pending ? children : <Loading size={size} />}
      </button>
   )
}
