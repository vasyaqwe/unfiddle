import {
   format,
   getDateTimeLocal,
   parseDateTime,
} from "@unfiddle/ui/components/date-input/utils"
import { input } from "@unfiddle/ui/components/input/constants"
import { cn } from "@unfiddle/ui/utils"
import * as React from "react"

interface Props extends Omit<React.ComponentProps<"input">, "value"> {
   value: Date | null
   onValueChange: (value: Date | null) => void
}

export function DateInput({
   className,
   value,
   onValueChange,
   ...props
}: Props) {
   const inputRef = React.useRef<HTMLInputElement>(null)

   React.useEffect(() => {
      if (inputRef.current)
         inputRef.current.value = value ? format(new Date(value)) : ""
   }, [value])

   return (
      <div
         className={cn(
            "flex w-full items-center focus-within:border-surface-6",
            input(),
            className,
         )}
      >
         <input
            ref={inputRef}
            type="text"
            placeholder='Напр. "за тиждень"'
            defaultValue={value ? format(new Date(value)) : ""}
            onBlur={(e) => {
               if (e.target.value.length > 0) {
                  const parsedDateTime = parseDateTime(e.target.value)
                  if (parsedDateTime) {
                     onValueChange(parsedDateTime)
                  } else {
                     onValueChange(null)
                     e.target.value = ""
                  }
               } else {
                  onValueChange(null)
               }
            }}
            className="w-full grow text-[0.975rem] placeholder:text-foreground/40 focus:outline-hidden md:text-[0.95rem]"
            {...props}
         />
         <input
            type="date"
            id={props.id ? `${props.id}-date` : "date"}
            name={props.name}
            value={value ? getDateTimeLocal(new Date(value)) : ""}
            onChange={(e) => {
               const value = new Date(e.target.value)
               if (!Number.isNaN(value.getTime())) {
                  onValueChange(value)
                  if (inputRef.current) inputRef.current.value = format(value)
               } else {
                  onValueChange(null)
                  if (inputRef.current) {
                     inputRef.current.value = ""
                  }
               }
            }}
            className="w-[20px] border-none bg-transparent text-sm focus:outline-hidden"
            tabIndex={-1}
         />
      </div>
   )
}
