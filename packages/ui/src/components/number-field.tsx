import { NumberField as NumberFieldPrimitive } from "@base-ui-components/react/number-field"
import { Input } from "./input"

export function NumberField({
   ...props
}: React.ComponentProps<typeof NumberFieldPrimitive.Root>) {
   return <NumberFieldPrimitive.Root {...props} />
}

export function NumberFieldInput({
   ...props
}: React.ComponentProps<typeof Input>) {
   return <NumberFieldPrimitive.Input render={<Input {...props} />} />
}
