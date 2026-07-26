import { ContextMenu as ContextMenuPrimitive } from "@base-ui/react/context-menu"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { MenuCheckboxItemIndicator } from "@unfiddle/ui/components/menu"
import { MENU_ITEM_STYLES } from "@unfiddle/ui/components/menu/constants"
import { POPUP_STYLES } from "@unfiddle/ui/constants"
import { cn } from "../../utils"

export const ContextMenu = ContextMenuPrimitive.Root
export const Submenu = ContextMenuPrimitive.Root
export const ContextMenuTrigger = ContextMenuPrimitive.Trigger
export const ContextMenuGroup = ContextMenuPrimitive.Group
// export const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup
export const ContextMenuRadioItem = ContextMenuPrimitive.RadioItem
const ContextMenuPortal = ContextMenuPrimitive.Portal
const ContextMenuBackdrop = ContextMenuPrimitive.Backdrop
const ContextMenuPositioner = ContextMenuPrimitive.Positioner

export function ContextMenuGroupLabel({
   className,
   children,
   ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.GroupLabel>) {
   return (
      <ContextMenuPrimitive.GroupLabel
         className={cn(POPUP_STYLES.groupLabel, className)}
         {...props}
      >
         {children}
      </ContextMenuPrimitive.GroupLabel>
   )
}

interface Props extends React.ComponentProps<typeof ContextMenuPrimitive.Item> {
   destructive?: boolean
}

export function ContextMenuItem({
   className,
   destructive = false,
   children,
   ...props
}: Props) {
   return (
      <ContextMenuPrimitive.Item
         className={cn(
            MENU_ITEM_STYLES.base,
            destructive ? MENU_ITEM_STYLES.destructive : "",
            className,
         )}
         {...props}
      >
         {children}
      </ContextMenuPrimitive.Item>
   )
}

export function ContextMenuCheckboxItem({
   className,
   children,
   ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.CheckboxItem>) {
   return (
      <ContextMenuPrimitive.CheckboxItem
         className={cn(MENU_ITEM_STYLES.base, className)}
         {...props}
      >
         {children}
      </ContextMenuPrimitive.CheckboxItem>
   )
}

export function ContextMenuCheckboxItemIndicator() {
   return <MenuCheckboxItemIndicator />
}

export function ContextMenuPopup({
   className,
   children,
   sideOffset = 4,
   ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Positioner>) {
   return (
      <ContextMenuPortal>
         <ContextMenuBackdrop />
         <ContextMenuPositioner
            sideOffset={sideOffset}
            {...props}
         >
            <ContextMenuPrimitive.Popup
               className={cn(
                  POPUP_STYLES.base,
                  POPUP_STYLES.transition,
                  "min-w-36 p-(--popup-padding) text-base",
                  className,
               )}
            >
               {children}
            </ContextMenuPrimitive.Popup>
         </ContextMenuPositioner>
      </ContextMenuPortal>
   )
}

export function ContextMenuSubmenuTrigger({
   className,
   children,
   ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Trigger>) {
   return (
      <ContextMenuPrimitive.Trigger
         className={cn(MENU_ITEM_STYLES.base, className)}
         {...props}
      >
         {children}
         <HugeiconsIcon
            icon={ArrowRight01Icon}
            strokeWidth={2}
            className="ml-auto size-3.5!"
         />
      </ContextMenuPrimitive.Trigger>
   )
}

export function ContextMenuSeparator({
   className,
   ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Separator>) {
   return (
      <ContextMenuPrimitive.Separator
         className={cn(POPUP_STYLES.separator, className)}
         {...props}
      />
   )
}
