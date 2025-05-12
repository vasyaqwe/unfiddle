import { MENU_ITEM_STYLES } from "@ledgerblocks/ui/components/menu"
import {
   Command,
   CommandEmpty,
   CommandInput,
   CommandItem,
   CommandList,
} from "cmdk-base"
import * as React from "react"
import { POPUP_STYLES } from "../constants"
import { cn, cx } from "../utils"
import {} from "./button"
import { Icons } from "./icons"
import { Popover, PopoverPopup, PopoverTrigger } from "./popover"

type ComboboxSingleProps = {
   multiple?: false
   value?: string
   onValueChange?: (value: string) => void
   canBeEmpty?: boolean
}

type ComboboxMultipleProps = {
   multiple: true
   value?: string[]
   onValueChange?: (value: string[]) => void
   canBeEmpty?: boolean
}

type ComboboxProps = {
   children: React.ReactNode
} & (ComboboxSingleProps | ComboboxMultipleProps)

type ContextType = {
   isOpen: boolean
   setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
   internalValue: string | string[]
   setInternalValue: React.Dispatch<React.SetStateAction<string | string[]>>
} & (ComboboxSingleProps | ComboboxMultipleProps)

const Context = React.createContext<ContextType | undefined>(undefined)

function useContext() {
   const context = React.use(Context)
   if (!context) throw new Error("useContext must be used within a Combobox")
   return context
}

export function Combobox(props: ComboboxProps) {
   const {
      children,
      multiple,
      value: externalValue,
      onValueChange,
      canBeEmpty,
   } = props
   const [isOpen, setIsOpen] = React.useState(false)
   const [internalValue, setInternalValue] = React.useState<string | string[]>(
      multiple ? [] : "",
   )

   React.useEffect(() => {
      if (externalValue !== undefined) {
         setInternalValue(externalValue)
      }
   }, [externalValue])

   const handleValueChange = (newValue: string | string[]) => {
      if (canBeEmpty) {
         internalValue === newValue
            ? setInternalValue("")
            : setInternalValue(newValue)
      } else {
         setInternalValue(newValue)
      }
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      onValueChange?.(newValue as any)
   }

   return (
      <Context
         value={
            {
               multiple,
               value:
                  externalValue !== undefined ? externalValue : internalValue,
               onValueChange: handleValueChange,
               isOpen,
               setIsOpen,
               internalValue,
               setInternalValue,
            } as ContextType
         }
      >
         <Popover
            open={isOpen}
            onOpenChange={setIsOpen}
         >
            {children}
         </Popover>
      </Context>
   )
}

interface Props extends React.ComponentProps<typeof PopoverTrigger> {}

export function ComboboxTrigger({ className, children, ...props }: Props) {
   const { internalValue: value, multiple } = useContext()

   return (
      <PopoverTrigger
         className={cn("cursor-pointer", className)}
         {...props}
      >
         {multiple ? (
            <span
               data-active={(value as string[]).length > 0}
               className={
                  "font-medium text-[0.965rem] tabular-nums opacity-60 data-[active=true]:opacity-100"
               }
            >
               {(value as string[]).length}
               <span className="sr-only">selected</span>
            </span>
         ) : null}
         {children}
         {/* <Icons.chevronUpDown
            className={
               "-mr-[5px] ml-auto size-[18px] shrink-0 text-foreground/60 md:size-[16px]"
            }
         /> */}
      </PopoverTrigger>
   )
}

export function ComboboxTriggerIcon() {
   return (
      <Icons.chevronUpDown
         data-combobox-icon
         className="-mr-1 !ml-auto size-4 text-foreground/75"
      />
   )
}

export function ComboboxPopup({
   className,
   children,
   ...props
}: React.ComponentProps<typeof PopoverPopup>) {
   return (
      <PopoverPopup
         sideOffset={4}
         className={cn(
            "max-h-56 min-w-[calc(var(--anchor-width)+3rem)] scroll-py-1 overflow-y-auto p-1",
            className,
         )}
         {...props}
      >
         <Command>
            <CommandList>{children}</CommandList>
         </Command>
      </PopoverPopup>
   )
}

export function ComboboxInput({
   className,
   ...props
}: React.ComponentProps<typeof CommandInput>) {
   return (
      <div className="relative h-10 md:h-9">
         {/* <Icons.search className="-translate-y-1/2 absolute top-[calc(50%-3px)] left-2 size-5 text-white/55 md:top-[calc(50%-3px)] md:size-[18px]" /> */}
         <CommandInput
            placeholder="Шукати.."
            className={cn(
               "-top-[3px] absolute h-10 w-full border-transparent bg-transparent px-2 placeholder:text-white/55 focus:outline-hidden md:h-9 md:text-sm",
               className,
            )}
            {...props}
         />
         <ComboboxSeparator className="absolute bottom-0 block" />
      </div>
   )
}

export function ComboboxItem({
   children,
   value: propValue,
   className,
   ...props
}: { value: string } & React.ComponentProps<typeof CommandItem>) {
   const { multiple, internalValue, onValueChange, setIsOpen } = useContext()

   const isSelected = multiple
      ? (internalValue as string[]).includes(propValue)
      : internalValue === propValue

   const onSelect = () => {
      if (multiple) {
         const newValue = isSelected
            ? (internalValue as string[]).filter((v) => v !== propValue)
            : [...(internalValue as string[]), propValue]
         onValueChange?.(newValue)
      } else {
         onValueChange?.(propValue)
         setIsOpen(false)
      }
   }

   return (
      <CommandItem
         value={propValue}
         onSelect={onSelect}
         className={cn(MENU_ITEM_STYLES.base, "items-center", className)}
         {...props}
      >
         {children}
         <Icons.check
            strokeWidth={2.5}
            className={cx(
               "!text-white/90 -mr-1 md:-mr-0.5 ml-auto size-[25px] md:size-[22px]",
               isSelected ? "" : "invisible",
            )}
         />
      </CommandItem>
   )
}

export function ComboboxSeparator({
   className,
   ...props
}: React.ComponentProps<"span">) {
   return (
      <span
         className={cn(POPUP_STYLES.separator, className)}
         {...props}
      />
   )
}

export function ComboboxEmpty({
   className,
   children,
   ...props
}: React.ComponentProps<"div">) {
   return (
      <CommandEmpty
         className={cn(
            "flex items-center justify-center pt-2 pb-3 text-center text-sm text-white/70",
            className,
         )}
         {...props}
      >
         {children}
      </CommandEmpty>
   )
}
