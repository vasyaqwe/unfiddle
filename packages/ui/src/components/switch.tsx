import { Switch as SwitchPrimitive } from "@base-ui-components/react/switch"
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
            "inline-flex h-[28px] w-[47px] cursor-pointer items-center rounded-full bg-primary-7 shadow-xs hover:bg-primary-8 data-checked:bg-accent-8 data-checked:hover:bg-accent-8/90 md:h-[23px] md:w-[38px]",
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
            "ml-[4px] block size-[20px] rounded-full bg-white shadow-sm transition-transform ease-vaul data-checked:translate-x-[calc(100%-1px)] md:ml-[3px] md:size-[17px] md:data-checked:translate-x-[calc(100%-2px)]",
            className,
         )}
         {...props}
      />
   )
}

export { Switch, SwitchThumb }
