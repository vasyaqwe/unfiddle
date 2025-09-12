import { Menu as MenuPrimitive } from "@base-ui-components/react/menu"
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
export const MenuPortal = MenuPrimitive.Portal
export const MenuBackdrop = MenuPrimitive.Backdrop
export const MenuPositioner = MenuPrimitive.Positioner
export const MenuArrow = MenuPrimitive.Arrow

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
         className={"-mr-1 md:-mr-0.5 ml-auto"}
      >
         <Icons.check
            strokeWidth={2.5}
            className={"size-[25px] text-white/90 md:size-[22px]"}
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
