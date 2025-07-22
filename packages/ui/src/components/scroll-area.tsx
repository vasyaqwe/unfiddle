import { ScrollArea as ScrollAreaPrimitive } from "@base-ui-components/react/scroll-area"
import { cn } from "../utils"

interface Props
   extends React.ComponentProps<typeof ScrollAreaPrimitive.Viewport> {
   orientation?: "vertical" | "horizontal"
}

export function ScrollArea({
   className,
   children,
   orientation = "vertical",
   ...props
}: Props) {
   return (
      <ScrollAreaPrimitive.Root
         className={orientation === "horizontal" ? "" : "grow"}
      >
         <ScrollAreaPrimitive.Viewport
            className={cn(
               orientation === "horizontal"
                  ? "pb-2"
                  : "[&>div]:!min-w-0 absolute inset-0 overscroll-contain",
               className,
            )}
            {...props}
         >
            <ScrollAreaPrimitive.Content className={"flex grow flex-col"}>
               {children}
            </ScrollAreaPrimitive.Content>
         </ScrollAreaPrimitive.Viewport>
         <ScrollAreaScrollbar
            orientation={orientation}
            className={orientation === "horizontal" ? "" : "justify-center"}
         />
      </ScrollAreaPrimitive.Root>
   )
}

export function ScrollAreaScrollbar({
   className,
   ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Scrollbar>) {
   return (
      <ScrollAreaPrimitive.Scrollbar
         className={cn(
            "flex w-1.25 rounded-md bg-surface-3 opacity-0 transition-opacity delay-300 data-[orientation=horizontal]:h-1.25 data-[orientation=horizontal]:w-auto",
            "data-[hovering]:opacity-100 data-[scrolling]:opacity-100 data-[hovering]:delay-100 data-[scrolling]:delay-100 data-[hovering]:duration-75 data-[scrolling]:duration-75",
            className,
         )}
         {...props}
      >
         <ScrollAreaPrimitive.Thumb
            className={
               "w-full rounded-[inherit] bg-surface-7 transition-colors duration-[50ms] hover:bg-surface-8"
            }
         />
      </ScrollAreaPrimitive.Scrollbar>
   )
}
