import { Separator as SeparatorPrimitive } from "@base-ui-components/react/separator"
import { cn } from "../utils"

export function Separator({
   className,
   ...props
}: React.ComponentProps<typeof SeparatorPrimitive>) {
   return (
      <SeparatorPrimitive
         className={cn("h-px bg-neutral", className)}
         {...props}
      />
   )
}
