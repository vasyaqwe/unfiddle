import { Switch as SwitchPrimitive } from "@base-ui/react/switch"
import { FOCUS_STYLES } from "../constants"
import { cn } from "../utils"

function Switch({
   className,
   children,
   onCheckedChange,
   ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
   return (
      <SwitchPrimitive.Root
         onCheckedChange={(checked, e) => {
            onCheckedChange?.(checked, e)
         }}
         className={cn(
            "inline-flex h-7 w-11.75 cursor-pointer items-center rounded-full bg-surface-7 shadow-xs hover:bg-surface-8 data-checked:bg-primary-8 data-checked:hover:bg-primary-8/90 md:h-5.75 md:w-9.5",
            FOCUS_STYLES,
            className,
         )}
         {...props}
      >
         {children}
         <SwitchThumb />
      </SwitchPrimitive.Root>
   )
}

function SwitchThumb({
   className,
   ...props
}: React.ComponentProps<typeof SwitchPrimitive.Thumb>) {
   return (
      <SwitchPrimitive.Thumb
         className={cn(
            "ml-1 block size-5 rounded-full bg-white shadow-sm transition-transform ease-vaul data-checked:translate-x-[calc(100%-1px)] md:ml-0.75 md:size-4.25 md:data-checked:translate-x-[calc(100%-2px)]",
            className,
         )}
         {...props}
      />
   )
}

export { Switch, SwitchThumb }
