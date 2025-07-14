import { ScrollArea as ScrollAreaPrimitive } from "@base-ui-components/react/scroll-area"
import { cn } from "../utils"

export function ScrollArea({
   className,
   children,
   ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Viewport>) {
   return (
      <ScrollAreaPrimitive.Root className={"grow"}>
         <ScrollAreaPrimitive.Viewport
            className={cn(
               "[&>div]:!min-w-0 absolute inset-0 overscroll-contain",
               className,
            )}
            {...props}
         >
            <ScrollAreaPrimitive.Content>
               {children}
            </ScrollAreaPrimitive.Content>
         </ScrollAreaPrimitive.Viewport>
         <ScrollAreaScrollbar />
      </ScrollAreaPrimitive.Root>
   )
}

// export function ScrollArea({
//    className,
//    children,
//    ...props
// }: React.ComponentProps<"div">) {
//    return (
//       <div className="relative grow">
//          <div
//             className={cn(
//                "absolute inset-0 overflow-y-auto overscroll-contain",
//                className,
//             )}
//             {...props}
//          >
//             {children}
//          </div>
//       </div>
//    )
// }

export function ScrollAreaScrollbar({
   className,
   ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Scrollbar>) {
   return (
      <ScrollAreaPrimitive.Scrollbar
         className={cn(
            "flex w-1.5 justify-center rounded-md bg-surface-3 opacity-0 transition-opacity delay-300",
            "data-[hovering]:opacity-100 data-[scrolling]:opacity-100 data-[hovering]:delay-100 data-[scrolling]:delay-100 data-[hovering]:duration-75 data-[scrolling]:duration-75",
            className,
         )}
         {...props}
      >
         <ScrollAreaPrimitive.Thumb
            className={"w-full rounded-[inherit] bg-surface-7"}
         />
      </ScrollAreaPrimitive.Scrollbar>
   )
}
