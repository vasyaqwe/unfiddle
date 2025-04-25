import { Menu as MenuPrimitive } from "@base-ui-components/react/menu"
import { Icons } from "@ledgerblocks/ui/components/icons"
import { POPUP_STYLES } from "@ledgerblocks/ui/constants"
import { cn } from "../utils"

export const Menu = MenuPrimitive.Root
export const MenuTrigger = MenuPrimitive.Trigger
export const MenuGroup = MenuPrimitive.Group
// export const MenuRadioGroup = MenuPrimitive.RadioGroup
export const MenuRadioItem = MenuPrimitive.RadioItem
export const MenuPortal = MenuPrimitive.Portal
export const MenuBackdrop = MenuPrimitive.Backdrop
export const MenuPositioner = MenuPrimitive.Positioner
export const MenuArrow = MenuPrimitive.Arrow

export const MENU_ITEM_STYLES = {
   base: "cursor-pointer text-base h-9 md:h-[1.9rem] flex items-center select-none gap-2 rounded-[calc(var(--popup-radius)-var(--popup-padding))] px-2.5 focus-visible:border-transparent [&>svg]:size-[22px] md:[&>svg]:size-5 [&>svg]:text-primary-8 hover:[&>svg]:text-white focus:[&>svg]:text-white hover:bg-primary-10 hover:shadow-sm focus-visible:outline-none focus-visible:outline-hidden focus-visible:bg-primary-10 shadow-black/20 focus-visible:shadow-sm md:text-sm",
   destructive:
      "hover:bg-red-9 focus-visible:bg-red-9 dark:focus-visible:bg-red-9 dark:hover:bg-red-9",
}

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
         className={cn(
            MENU_ITEM_STYLES.base,
            "grid min-w-[calc(var(--anchor-width)+1.45rem)] grid-cols-[1.1rem_1fr] items-center gap-2 pr-4 pl-2",
            className,
         )}
         {...props}
      >
         <MenuPrimitive.CheckboxItemIndicator className="col-start-1">
            <Icons.check
               strokeWidth={2.5}
               className={"size-[18px] text-white/90"}
            />
         </MenuPrimitive.CheckboxItemIndicator>
         <span className={"col-start-2"}>{children}</span>
      </MenuPrimitive.CheckboxItem>
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
