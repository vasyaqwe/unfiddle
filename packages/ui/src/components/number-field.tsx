import { NumberField as NumberFieldPrimitive } from "@base-ui-components/react/number-field"
import { cn } from "@unfiddle/ui/utils"
import { type Input, input } from "./input"

export function NumberField({
   children,
   ...props
}: React.ComponentProps<typeof NumberFieldPrimitive.Root>) {
   return (
      <NumberFieldPrimitive.Root {...props}>
         <NumberFieldPrimitive.ScrubArea>
            <NumberFieldPrimitive.ScrubAreaCursor />
         </NumberFieldPrimitive.ScrubArea>
         {children}
      </NumberFieldPrimitive.Root>
   )
}

export function NumberFieldInput({
   className,
   ...props
}: React.ComponentProps<typeof Input>) {
   return (
      <NumberFieldPrimitive.Group>
         <NumberFieldPrimitive.Decrement />
         <NumberFieldPrimitive.Input
            className={cn(input(), className)}
            {...props}
         />
         <NumberFieldPrimitive.Increment />
      </NumberFieldPrimitive.Group>
   )
}
