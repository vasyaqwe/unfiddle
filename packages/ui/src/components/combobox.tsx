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

type ComboboxContextType = {
   isOpen: boolean
   setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
   internalValue: string | string[]
   setInternalValue: React.Dispatch<React.SetStateAction<string | string[]>>
} & (ComboboxSingleProps | ComboboxMultipleProps)

const ComboboxContext = React.createContext<ComboboxContextType | undefined>(
   undefined,
)

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
      <ComboboxContext.Provider
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
            } as ComboboxContextType
         }
      >
         <Popover
            open={isOpen}
            onOpenChange={setIsOpen}
         >
            {children}
         </Popover>
      </ComboboxContext.Provider>
   )
}

interface Props extends React.ComponentProps<typeof PopoverTrigger> {}

export function ComboboxTrigger({ children, ...props }: Props) {
   const context = React.useContext(ComboboxContext)
   if (!context)
      throw new Error("ComboboxTrigger must be used within a Combobox")

   const { internalValue: value, multiple } = context

   return (
      <PopoverTrigger {...props}>
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

export function ComboboxPopup({
   className,
   children,
   ...props
}: React.ComponentProps<typeof PopoverPopup>) {
   return (
      <PopoverPopup
         sideOffset={4}
         className={cn(
            "max-h-56 min-w-(--anchor-width) scroll-py-1 overflow-y-auto p-1",
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
      <div className="relative">
         <Icons.search className="-translate-y-1/2 absolute top-[48%] left-2 size-5 text-white/55 md:top-[47%] md:size-[18px]" />
         <CommandInput
            placeholder="Шукати.."
            className={cn(
               "h-9 w-full border-transparent bg-transparent pr-2 pl-9 placeholder:text-white/55 focus:outline-hidden md:h-8 md:text-sm",
               className,
            )}
            {...props}
         />
         <ComboboxSeparator className="mt-0 block" />
      </div>
   )
}

export function ComboboxItem({
   children,
   value: propValue,
   className,
   ...props
}: { value: string } & React.ComponentProps<typeof CommandItem>) {
   const context = React.useContext(ComboboxContext)
   if (!context) throw new Error("ComboboxItem must be used within a Combobox")

   const { multiple, internalValue, onValueChange, setIsOpen } = context

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
         className={cn(
            MENU_ITEM_STYLES.base,
            "grid min-w-[calc(var(--anchor-width)+1.45rem)] grid-cols-[1.4rem_1fr] items-center md:grid-cols-[20px_1fr]",
            className,
         )}
         {...props}
      >
         <Icons.check
            strokeWidth={2.5}
            className={cx(
               "!text-white/90 size-[23px] md:size-[22px]",
               isSelected ? "" : "invisible",
            )}
         />
         {children}
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
            "flex h-10 items-center justify-center text-center text-sm text-white/70 md:h-8",
            className,
         )}
         {...props}
      >
         {children}
      </CommandEmpty>
   )
}
