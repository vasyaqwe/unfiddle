import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"
import { POPUP_STYLES } from "../constants"
import { cn } from "../utils"

export function Tooltip(
   props: React.ComponentProps<typeof TooltipPrimitive.Root>,
) {
   return <TooltipPrimitive.Root {...props} />
}

export const TooltipProvider = TooltipPrimitive.Provider
export const TooltipPortal = TooltipPrimitive.Portal
export const TooltipPositioner = TooltipPrimitive.Positioner
export const TooltipArrow = TooltipPrimitive.Arrow

export function TooltipTrigger({
   delay = 200,
   ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
   return (
      <TooltipPrimitive.Trigger
         delay={delay}
         {...props}
      />
   )
}

export function TooltipPopup({
   className,
   children,
   sideOffset = 7,
   ...props
}: React.ComponentProps<typeof TooltipPrimitive.Positioner>) {
   return (
      <TooltipPortal>
         <TooltipPositioner
            sideOffset={sideOffset}
            {...props}
         >
            <TooltipPrimitive.Popup
               className={cn(
                  POPUP_STYLES.base,
                  POPUP_STYLES.transition,
                  "flex items-center gap-px rounded-md px-2 py-1 text-sm has-[[data-kbd]]:pr-1",
                  className,
               )}
            >
               {children}
            </TooltipPrimitive.Popup>
         </TooltipPositioner>
      </TooltipPortal>
   )
}
