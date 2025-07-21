import { ContextMenu as ContextMenuPrimitive } from "@base-ui-components/react/context-menu"
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
export const ContextMenuPortal = ContextMenuPrimitive.Portal
export const ContextMenuBackdrop = ContextMenuPrimitive.Backdrop
export const ContextMenuPositioner = ContextMenuPrimitive.Positioner
export const ContextMenuArrow = ContextMenuPrimitive.Arrow

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
         className={cn(MENU_ITEM_STYLES.base, "", className)}
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
         <svg
            className="!size-2 ml-auto"
            viewBox="0 0 79 91"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
         >
            <path
               d="M71.1338 32.4487C79.5945 36.784 79.8946 48.7674 71.6616 53.5207L18 84.5022C10 89.121 0 83.3475 0 74.1099V15.6324C0 6.65996 9.48705 0.861131 17.4722 4.95271L71.1338 32.4487Z"
               fill="currentColor"
            />
         </svg>
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
