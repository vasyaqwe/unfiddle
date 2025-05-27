import { Tabs as TabsPrimitive } from "@base-ui-components/react/tabs"
import { Separator } from "@unfiddle/ui/components/separator"
import { FOCUS_STYLES } from "@unfiddle/ui/constants"
import { cn } from "../utils"

export const Tabs = TabsPrimitive.Root

export function TabsList({
   className,
   children,
   ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
   return (
      <>
         <TabsPrimitive.List
            className={cn("flex gap-3 pb-2", className)}
            {...props}
         >
            {children}
         </TabsPrimitive.List>
         <Separator />
      </>
   )
}

export function TabsTab({
   className,
   ...props
}: React.ComponentProps<typeof TabsPrimitive.Tab>) {
   return (
      <TabsPrimitive.Tab
         className={cn(
            "inline-flex h-9 cursor-pointer items-center justify-center rounded-md px-3 font-[450] text-foreground/75 hover:bg-surface-3 hover:text-foreground aria-selected:text-foreground md:h-7 md:px-2 md:text-sm",
            "after:-mb-[calc(1px+0.5rem)] relative after:absolute after:inset-x-0 after:bottom-0 after:mx-auto after:h-0.5 after:w-full after:rounded-sm after:bg-transparent aria-selected:after:bg-foreground",
            "transition-colors duration-75 after:transition-colors after:duration-100 disabled:cursor-not-allowed disabled:opacity-75",
            FOCUS_STYLES,
            className,
         )}
         {...props}
      />
   )
}

export function TabsIndicator({
   className,
   ...props
}: React.ComponentProps<typeof TabsPrimitive.Indicator>) {
   return (
      <TabsPrimitive.Indicator
         className={cn("", className)}
         {...props}
      />
   )
}

export function TabsPanel({
   className,
   ...props
}: React.ComponentProps<typeof TabsPrimitive.Panel>) {
   return (
      <TabsPrimitive.Panel
         className={cn("", className)}
         {...props}
      />
   )
}
