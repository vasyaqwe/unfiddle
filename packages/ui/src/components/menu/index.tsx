import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Icons } from "@unfiddle/ui/components/icons"
import { MENU_ITEM_STYLES } from "@unfiddle/ui/components/menu/constants"
import { POPUP_STYLES } from "@unfiddle/ui/constants"
import { cn } from "../../utils"

export const Menu = MenuPrimitive.Root
export const Submenu = MenuPrimitive.SubmenuRoot
export const MenuTrigger = MenuPrimitive.Trigger
export const SubmenuTrigger = MenuPrimitive.SubmenuTrigger
export const MenuGroup = MenuPrimitive.Group
// export const MenuRadioGroup = MenuPrimitive.RadioGroup
export const MenuRadioItem = MenuPrimitive.RadioItem
const MenuPortal = MenuPrimitive.Portal
const MenuBackdrop = MenuPrimitive.Backdrop
const MenuPositioner = MenuPrimitive.Positioner

export function MenuGroupLabel({
   className,
   children,
   ...props
}: React.ComponentProps<typeof MenuPrimitive.GroupLabel>) {
   return (
      <MenuPrimitive.GroupLabel
         className={cn(POPUP_STYLES.groupLabel, className)}
         {...props}
      >
         {children}
      </MenuPrimitive.GroupLabel>
   )
}

interface Props extends React.ComponentProps<typeof MenuPrimitive.Item> {
   destructive?: boolean
}

export function MenuItem({
   className,
   destructive = false,
   children,
   ...props
}: Props) {
   return (
      <MenuPrimitive.Item
         className={cn(
            MENU_ITEM_STYLES.base,
            destructive ? MENU_ITEM_STYLES.destructive : "",
            className,
         )}
         {...props}
      >
         {children}
      </MenuPrimitive.Item>
   )
}

export function MenuCheckboxItem({
   className,
   children,
   ...props
}: React.ComponentProps<typeof MenuPrimitive.CheckboxItem>) {
   return (
      <MenuPrimitive.CheckboxItem
         className={cn(MENU_ITEM_STYLES.base, "", className)}
         {...props}
      >
         {children}
      </MenuPrimitive.CheckboxItem>
   )
}

export function MenuCheckboxItemIndicator() {
   return (
      <MenuPrimitive.CheckboxItemIndicator
         className={"-mr-1 ml-auto md:-mr-0.5"}
      >
         <HugeiconsIcon
            icon={Icons.check}
            strokeWidth={2.5}
            className={"size-5.75 text-white/90 md:size-5"}
         />
      </MenuPrimitive.CheckboxItemIndicator>
   )
}

export function MenuPopup({
   className,
   children,
   sideOffset = 4,
   ...props
}: React.ComponentProps<typeof MenuPrimitive.Positioner>) {
   return (
      <MenuPortal>
         <MenuBackdrop />
         <MenuPositioner
            sideOffset={sideOffset}
            {...props}
         >
            <MenuPrimitive.Popup
               className={cn(
                  POPUP_STYLES.base,
                  POPUP_STYLES.transition,
                  "min-w-36 p-(--popup-padding) text-base",
                  className,
               )}
            >
               {children}
            </MenuPrimitive.Popup>
         </MenuPositioner>
      </MenuPortal>
   )
}

export function MenuSubmenuTrigger({
   className,
   children,
   ...props
}: React.ComponentProps<typeof MenuPrimitive.SubmenuTrigger>) {
   return (
      <MenuPrimitive.SubmenuTrigger
         className={cn(MENU_ITEM_STYLES.base, className)}
         {...props}
      >
         {children}
         <HugeiconsIcon
            icon={ArrowRight01Icon}
            strokeWidth={2}
            className="ml-auto size-3.5!"
         />
      </MenuPrimitive.SubmenuTrigger>
   )
}

export function MenuSeparator({
   className,
   ...props
}: React.ComponentProps<typeof MenuPrimitive.Separator>) {
   return (
      <MenuPrimitive.Separator
         className={cn(POPUP_STYLES.separator, className)}
         {...props}
      />
   )
}
