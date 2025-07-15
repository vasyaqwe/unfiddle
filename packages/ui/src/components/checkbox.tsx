import { Checkbox as CheckboxPrimitive } from "@base-ui-components/react/checkbox"
import { FOCUS_STYLES } from "@unfiddle/ui/constants"
import { cn } from "../utils"
import { Icons } from "./icons"

export function Checkbox({
   className,
   ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
   return (
      <CheckboxPrimitive.Root
         className={cn(
            FOCUS_STYLES,
            "grid size-5 shrink-0 cursor-pointer place-items-center rounded-sm border-surface-5 bg-background text-white shadow-xs data-[unchecked]:border data-[checked]:bg-primary-6 dark:bg-surface-3",
            className,
         )}
         {...props}
      >
         <CheckboxIndicator>
            <Icons.check className="size-4.5 drop-shadow-xs" />
         </CheckboxIndicator>
      </CheckboxPrimitive.Root>
   )
}

export function CheckboxIndicator({
   ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Indicator>) {
   return <CheckboxPrimitive.Indicator {...props} />
}
