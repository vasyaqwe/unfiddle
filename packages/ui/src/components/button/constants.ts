import { cva } from "class-variance-authority"

export const button = cva(
   [
      "inline-flex shrink-0 items-center justify-center overflow-hidden whitespace-nowrap leading-none",
      "relative cursor-pointer transition-all duration-100 disabled:opacity-80 [&>svg]:shrink-0",
   ],
   {
      variants: {
         variant: {
            primary:
               "bg-primary-6 font-[400] text-shadow-md/7 shadow-[inset_0_-2.5px_1px_0_rgb(0_0_0_/_0.2),0_1px_3px_0_rgb(0_0_0_/_0.1),_0_1px_2px_-1px_rgb(0_0_0_/_0.1)] hover:bg-primary-5 active:bg-primary-6 [&>svg]:drop-shadow-md",
            secondary:
               "border border-surface-5 bg-background shadow-[inset_0_-1px_0.5px_rgb(0_0_0_/_0.15)] hover:bg-surface-1 active:bg-surface-2 data-[popup-open]:bg-surface-2 dark:bg-surface-3/75 dark:hover:bg-surface-3",
            tertiary:
               "border border-surface-2 bg-background bg-surface-3 hover:bg-surface-4 active:bg-surface-3",
            ghost: "bg-transparent [--active-color:var(--color-surface-3)] hover:bg-(--active-color) aria-[current=page]:bg-(--active-color) data-[popup-open]:bg-(--active-color)",
            destructive:
               "bg-red-9 font-[400] text-shadow-md/7 shadow-[inset_0_-2.5px_1px_0_rgb(0_0_0_/_0.2),0_1px_3px_0_rgb(0_0_0_/_0.1),_0_1px_2px_-1px_rgb(0_0_0_/_0.1)] hover:bg-red-9/90 active:bg-red-9 [&>svg]:drop-shadow-md",
         },
         size: {
            xs: "h-9 rounded-sm px-1 md:h-6",
            sm: "h-9 rounded-sm px-1.5 md:h-7",
            md: "h-9 rounded-md px-3 md:h-[1.925rem] md:px-[0.53rem]",
            lg: "h-10 rounded-lg px-3 md:h-[2.1rem]",
            xl: "h-10 rounded-lg px-3 md:h-10",
         },
         kind: {
            default: "gap-1.5",
            icon: "aspect-square w-auto justify-center px-0 md:px-0",
         },
      },
      compoundVariants: [
         {
            kind: "default",
            size: "sm",
            className: "md:[&>svg]:-ml-[0.15rem] [&>svg]:-ml-[0.05rem]",
         },
         {
            kind: "default",
            size: "md",
            className:
               "md:[&>svg]:-ml-[0.3rem] [&>svg]:-ml-[0.2rem] has-[svg]:gap-1",
         },
      ],
      defaultVariants: {
         variant: "primary",
         size: "md",
         kind: "default",
      },
   },
)
