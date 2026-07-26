import { Copy01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@unfiddle/ui/components/button"
import { Icons } from "@unfiddle/ui/components/icons"
import { cn } from "@unfiddle/ui/utils"
import * as React from "react"

interface CopyButtonProps extends React.ComponentProps<typeof Button> {
   value: string
}

export function CopyButton({
   value,
   className,
   variant = "ghost",
   onClick,
   ...props
}: CopyButtonProps) {
   const [hasCopied, setHasCopied] = React.useState(false)

   React.useEffect(() => {
      setTimeout(() => {
         setHasCopied(false)
      }, 2000)
   }, [hasCopied])

   return (
      <Button
         kind="icon"
         variant={variant}
         className={cn("shrink-0", className)}
         onClick={(e) => {
            navigator.clipboard.writeText(value)
            setHasCopied(true)
            onClick?.(e)
         }}
         aria-label="Copy"
         {...props}
      >
         <HugeiconsIcon icon={hasCopied ? Icons.check : Copy01Icon} />
      </Button>
   )
}
