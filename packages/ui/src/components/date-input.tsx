import { input } from "@unfiddle/ui/components/input/constants"
import { cn } from "@unfiddle/ui/utils"
import * as chrono from "chrono-node"
import * as React from "react"

const parseDateTime = (str: Date | string) => {
   if (str instanceof Date) return str
   return chrono.uk.parseDate(str)
}

const format = (date: Date | string) =>
   new Intl.DateTimeFormat("uk-UA", {
      month: "short",
      day: "numeric",
      year: "numeric",
   }).format(new Date(date))

const getDateTimeLocal = (timestamp?: Date): string => {
   const d = timestamp ? new Date(timestamp) : new Date()
   if (d.toString() === "Invalid Date") return ""
   return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .split(":")
      .slice(0, 2)
      .join(":")
}

interface Props extends Omit<React.ComponentProps<"input">, "value"> {
   value: Date | null
   onValueChange: (date: Date | null) => void
}

export function DateInput({
   className,
   value,
   onValueChange,
   ...props
}: Props) {
   const inputRef = React.useRef<HTMLInputElement>(null)

   React.useEffect(() => {
      if (inputRef.current) inputRef.current.value = value ? format(value) : ""
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
            placeholder='"минулого понеділка" або "два дні тому"'
            defaultValue={value ? format(value) : ""}
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
            className="w-full grow text-sm focus:outline-hidden"
            {...props}
         />
         <input
            type="date"
            id={props.id ? `${props.id}-datetime-local` : "datetime-local"}
            name={props.name}
            value={value ? getDateTimeLocal(value) : ""}
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
