import { Icons } from "@unfiddle/ui/components/icons"
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
         {profit === "positive" ? (
            <Icons.arrowUpRight className="-mt-px -ml-px size-5 text-green-10" />
         ) : (
            <Icons.arrowDownRight className="-mt-px -ml-px size-5 text-red-10" />
         )}{" "}
      </span>
   )
}
