import { Field as FieldPrimitive } from "@base-ui-components/react/field"
import { Fieldset as FieldsetPrimitive } from "@base-ui-components/react/fieldset"
import type { VariantProps } from "class-variance-authority"
import { cn } from "../utils"
import { input } from "./input/constants"

export function Fieldset({
   className,
   ...props
}: React.ComponentProps<typeof FieldsetPrimitive.Root>) {
   return (
      <FieldsetPrimitive.Root
         className={cn("", className)}
         {...props}
      />
   )
}

export function FieldsetLegend({
   className,
   ...props
}: React.ComponentProps<typeof FieldsetPrimitive.Legend>) {
   return (
      <FieldsetPrimitive.Legend
         className={cn("font-medium text-lg", className)}
         {...props}
      />
   )
}

export function FieldGroup({
   className,
   ...props
}: React.ComponentProps<"div">) {
   return (
      <div
         className={cn("grid gap-3 md:grid-cols-2 md:gap-8", className)}
         {...props}
      />
   )
}

export function Field({
   className,
   ...props
}: React.ComponentProps<typeof FieldPrimitive.Root>) {
   return (
      <FieldPrimitive.Root
         className={cn("flex w-full flex-col items-start", className)}
         {...props}
      />
   )
}

export function FieldLabel({
   className,
   ...props
}: React.ComponentProps<typeof FieldPrimitive.Label>) {
   return (
      <FieldPrimitive.Label
         className={cn("font-medium text-sm", className)}
         {...props}
      />
   )
}

export type FieldControlProps = React.ComponentProps<
   typeof FieldPrimitive.Control
> &
   VariantProps<typeof input>

export function FieldControl({
   className,
   variant,
   size,
   ...props
}: FieldControlProps) {
   return (
      <FieldPrimitive.Control
         className={cn(input({ variant, size, className }))}
         {...props}
      />
   )
}

export function FieldError({
   className,
   ...props
}: React.ComponentProps<typeof FieldPrimitive.Error>) {
   return (
      <FieldPrimitive.Error
         className={cn("text-destructive text-sm", className)}
         {...props}
      />
   )
}

export function FieldDescription({
   className,
   ...props
}: React.ComponentProps<typeof FieldPrimitive.Description>) {
   return (
      <FieldPrimitive.Description
         className={cn("mt-1 text-foreground/75 text-sm", className)}
         {...props}
      />
   )
}
