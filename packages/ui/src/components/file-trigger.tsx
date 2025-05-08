import * as React from "react"
import { Button } from "./button"

interface Props extends Omit<React.ComponentProps<typeof Button>, "onChange"> {
   onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
   multiple?: boolean
}

export function FileTrigger({
   children,
   onClick,
   onChange,
   multiple = true,
   ...props
}: Props) {
   const inputRef = React.useRef<HTMLInputElement>(null)

   return (
      <Button
         type="button"
         aria-label="Add files"
         {...props}
         onClick={(e) => {
            inputRef?.current?.click()
            onClick?.(e)
         }}
      >
         <input
            type="file"
            hidden
            ref={inputRef}
            multiple={multiple}
            onChange={(e) => {
               onChange(e)
            }}
         />
         {children}
      </Button>
   )
}
