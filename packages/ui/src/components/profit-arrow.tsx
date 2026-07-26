import {
   ArrowDownRight01Icon,
   ArrowUpRight01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "@unfiddle/ui/utils"

interface Props extends React.ComponentProps<"span"> {
   profit: "positive" | "negative"
}

export function ProfitArrow({ className, profit, ...props }: Props) {
   return (
      <span
         className={cn(
            "inline-block size-4.5 rounded-xs",
            profit === "positive" ? "bg-green-3" : "bg-red-3",
            className,
         )}
         {...props}
      >
         <HugeiconsIcon
            icon={
               profit === "positive" ? ArrowUpRight01Icon : ArrowDownRight01Icon
            }
            className={cn(
               "-mt-px -ml-px size-5",
               profit === "positive" ? "text-green-10" : "text-red-10",
            )}
         />{" "}
      </span>
   )
}
