import { cn } from "@ledgerblocks/ui/utils"
import * as React from "react"

export function AvatarStack({
   className,
   children,
   ...props
}: React.ComponentProps<"span">) {
   const length = React.Children.count(children)

   return (
      <span
         style={{ "--length": length } as never}
         className={cn(
            "grid h-(--size) grid-cols-[repeat(var(--length),var(--column))] content-end [--border:2px] [--column:17px] [--size:22px]",
            className,
         )}
         {...props}
      >
         {children}
      </span>
   )
}

export function AvatarStackItem({
   className,
   children,
   ...props
}: React.ComponentProps<"span">) {
   return (
      <span
         data-masked
         className={cn(
            "relative grid aspect-[1/2] w-(--size) items-end",
            className,
         )}
         {...props}
      >
         <span className="inline-grid h-(--size) w-full place-items-center rounded-full">
            {children}
         </span>
      </span>
   )
}
