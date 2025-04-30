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
         className={cn(
            "group flex cursor-pointer items-baseline gap-1.5",
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
}: React.ComponentProps<"svg">) {
   return (
      <svg
         className={cn(
            "mt-px size-2.5 shrink-0 text-foreground/60 transition-all duration-200 group-data-[panel-closed]:rotate-0 group-data-[panel-open]:rotate-90 group-data-[panel-open]:text-foreground",
            className,
         )}
         viewBox="0 0 79 91"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         {...props}
      >
         <path
            d="M71.1338 32.4487C79.5945 36.784 79.8946 48.7674 71.6616 53.5207L18 84.5022C10 89.121 0 83.3475 0 74.1099V15.6324C0 6.65996 9.48705 0.861131 17.4722 4.95271L71.1338 32.4487Z"
            fill="currentColor"
         />
      </svg>
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
            "h-(--collapsible-panel-height) overflow-hidden ease-out data-[ending-style]:h-0 data-[starting-style]:h-0",
            className,
         )}
         {...props}
      >
         {children}
      </CollapsiblePrimitive.Panel>
   )
}
