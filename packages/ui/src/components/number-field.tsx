import { NumberField as NumberFieldPrimitive } from "@base-ui-components/react/number-field"
import { cn } from "@unfiddle/ui/utils"
import { input } from "./input/constants"

export function NumberField({
   children,
   placeholder,
   className,
   ...props
}: React.ComponentProps<typeof NumberFieldPrimitive.Root> & {
   placeholder?: string | undefined
}) {
   return (
      <NumberFieldPrimitive.Root
         inputMode="numeric"
         className={cn("w-full", className)}
         {...props}
      >
         <NumberFieldPrimitive.ScrubArea>
            <NumberFieldPrimitive.ScrubAreaCursor />
         </NumberFieldPrimitive.ScrubArea>
         <NumberFieldPrimitive.Group>
            <NumberFieldPrimitive.Decrement />
            <NumberFieldPrimitive.Input
               placeholder={placeholder}
               className={cn(input(), className)}
            />
            <NumberFieldPrimitive.Increment />
         </NumberFieldPrimitive.Group>
      </NumberFieldPrimitive.Root>
   )
}
