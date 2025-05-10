import { Select as SelectPrimitive } from "@base-ui-components/react/select"
import { Icons } from "@ledgerblocks/ui/components/icons"
import { MENU_ITEM_STYLES } from "@ledgerblocks/ui/components/menu"
import { POPUP_STYLES } from "@ledgerblocks/ui/constants"
import { cn } from "../utils"

export const Select = SelectPrimitive.Root
export const SelectValue = SelectPrimitive.Value
export const SelectIcon = SelectPrimitive.Icon
export const SelectItemIndicator = SelectPrimitive.ItemIndicator
export const SelectItemText = SelectPrimitive.ItemText
export const SelectGroup = SelectPrimitive.Group
export const SelectPortal = SelectPrimitive.Portal
export const SelectBackdrop = SelectPrimitive.Backdrop
export const SelectPositioner = SelectPrimitive.Positioner
export const SelectArrow = SelectPrimitive.Arrow

export function SelectGroupLabel({
   className,
   children,
   ...props
}: React.ComponentProps<typeof SelectPrimitive.GroupLabel>) {
   return (
      <SelectPrimitive.GroupLabel
         className={cn(POPUP_STYLES.groupLabel, className)}
         {...props}
      >
         {children}
      </SelectPrimitive.GroupLabel>
   )
}

interface Props extends React.ComponentProps<typeof SelectPrimitive.Trigger> {}

export function SelectTrigger({ children, className, ...props }: Props) {
   return (
      <SelectPrimitive.Trigger
         className={cn("justify-start", className)}
         {...props}
      >
         {children}
         <SelectIcon
            data-icon
            className="-mr-[5px] ml-auto flex shrink-0"
         >
            <Icons.chevronUpDown className="size-[18px] text-foreground/75 md:size-[16px]" />
         </SelectIcon>
      </SelectPrimitive.Trigger>
   )
}

interface ItemProps extends React.ComponentProps<typeof SelectPrimitive.Item> {
   destructive?: boolean
}

export function SelectItem({
   className,
   destructive = false,
   children,
   ...props
}: ItemProps) {
   return (
      <SelectPrimitive.Item
         className={cn(
            MENU_ITEM_STYLES.base,
            destructive ? MENU_ITEM_STYLES.destructive : "",
            "grid min-w-[calc(var(--anchor-width)+1.05rem)] grid-cols-[1.2rem_1fr] items-center gap-2 pr-4 pl-2 md:min-w-[calc(var(--anchor-width)+1.65rem)]",
            className,
         )}
         {...props}
      >
         <SelectItemIndicator className="col-start-1">
            <Icons.check
               className={"-ml-[2px] size-[24px] text-white/90 md:size-[22px]"}
            />
         </SelectItemIndicator>
         <SelectItemText className={"col-start-2"}>{children}</SelectItemText>
      </SelectPrimitive.Item>
   )
}

export function SelectPopup({
   className,
   children,
   sideOffset = 0,
   ...props
}: React.ComponentProps<typeof SelectPrimitive.Positioner>) {
   return (
      <SelectPortal>
         <SelectBackdrop />
         <SelectPositioner
            sideOffset={sideOffset}
            {...props}
         >
            <SelectPrimitive.Popup
               className={cn(
                  POPUP_STYLES.base,
                  POPUP_STYLES.transition,
                  "!scale-100 min-w-36 p-(--padding) transition-none [--padding:0.2rem]",
                  className,
               )}
            >
               {children}
            </SelectPrimitive.Popup>
         </SelectPositioner>
      </SelectPortal>
   )
}

export function SelectSeparator({
   className,
   ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
   return (
      <SelectPrimitive.Separator
         className={cn(POPUP_STYLES.separator, className)}
         {...props}
      />
   )
}
