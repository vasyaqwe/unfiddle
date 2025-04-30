import { Collapsible as CollapsiblePrimitive } from "@base-ui-components/react/collapsible"
import { cn } from "../utils"

export function Collapsible({
   className,
   ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
   return (
      <CollapsiblePrimitive.Root
         className={cn("flex w-full flex-col justify-center", className)}
         {...props}
      />
   )
}

export function CollapsibleTrigger({
   className,
   children,
   ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Trigger>) {
   return (
      <CollapsiblePrimitive.Trigger
         className={cn("group cursor-pointer", className)}
         {...props}
      >
         {children}
      </CollapsiblePrimitive.Trigger>
   )
}

export function CollapsiblePanel({
   className,
   children,
   ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Panel>) {
   return (
      <CollapsiblePrimitive.Panel
         className={cn(
            "h-(--collapsible-panel-height) overflow-hidden transition-[height] ease-out data-[ending-style]:h-0 data-[starting-style]:h-0",
            className,
         )}
         {...props}
      >
         {children}
      </CollapsiblePrimitive.Panel>
   )
}
