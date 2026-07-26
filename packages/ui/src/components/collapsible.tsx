import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
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
         className={cn(
            "group flex cursor-pointer items-center gap-1.5",
            className,
         )}
         {...props}
      >
         {children}
      </CollapsiblePrimitive.Trigger>
   )
}

export function CollapsibleTriggerIcon({
   className,
   ...props
}: Omit<React.ComponentProps<typeof HugeiconsIcon>, "icon">) {
   return (
      <HugeiconsIcon
         icon={ArrowRight01Icon}
         strokeWidth={3}
         className={cn(
            "mt-px size-3.5 shrink-0 text-foreground/60 transition-all duration-150 group-data-[panel-closed]:rotate-0 group-data-[panel-open]:rotate-90 group-data-[panel-open]:text-foreground",
            className,
         )}
         {...props}
      />
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
            "h-(--collapsible-panel-height) overflow-hidden ease-out data-[ending-style]:hidden data-[starting-style]:hidden",
            className,
         )}
         {...props}
      >
         {children}
      </CollapsiblePrimitive.Panel>
   )
}
