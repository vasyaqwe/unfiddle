import { cn } from "../utils"

interface Props extends React.ComponentProps<"div"> {
   expanded: boolean
}

export function Expandable({ children, className, expanded, ...props }: Props) {
   return (
      <div
         data-expanded={expanded ? "" : undefined}
         className={cn(
            "invisible grid grid-rows-[0fr] overflow-clip transition-all duration-[400ms] ease-vaul data-[expanded]:visible data-[expanded]:grid-rows-[1fr]",
            className,
         )}
         {...props}
      >
         <div className="min-h-0">{children}</div>
      </div>
   )
}
