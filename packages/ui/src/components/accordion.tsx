import { Accordion as AccordionPrimitive } from "@base-ui-components/react/accordion"
import { cn } from "../utils"

export function Accordion({
   className,
   ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
   return (
      <AccordionPrimitive.Root
         className={cn("flex w-full flex-col justify-center", className)}
         {...props}
      />
   )
}

export function AccordionItem({
   className,
   ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
   return (
      <AccordionPrimitive.Item
         className={cn("", className)}
         {...props}
      />
   )
}

export function AccordionTrigger({
   className,
   children,
   ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
   return (
      <AccordionPrimitive.Header>
         <AccordionPrimitive.Trigger
            className={cn(
               "group flex w-full cursor-pointer items-baseline",
               className,
            )}
            {...props}
         >
            {children}
         </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
   )
}

export function AccordionPanel({
   className,
   children,
   ...props
}: React.ComponentProps<typeof AccordionPrimitive.Panel>) {
   return (
      <AccordionPrimitive.Panel
         className={cn(
            "h-(--accordion-panel-height) overflow-hidden transition-[height] ease-out data-[ending-style]:h-0 data-[starting-style]:h-0",
            className,
         )}
         {...props}
      >
         {children}
      </AccordionPrimitive.Panel>
   )
}
