import { cn } from "@unfiddle/ui/utils"
import * as React from "react"

export function AvatarStack({
   className,
   children,
   size = 24,
   ...props
}: React.ComponentProps<"span"> & { size?: number }) {
   const length = React.Children.count(children)

   return (
      <span
         style={{ "--length": length, "--size": `${size}px` } as never}
         className={cn(
            "grid h-(--size) grid-cols-[repeat(var(--length),var(--column))] content-end [--border:2px] [--column:17px]",
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
