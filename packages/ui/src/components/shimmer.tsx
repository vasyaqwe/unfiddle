import { cn } from "@unfiddle/ui/utils"

export function Shimmer({ className, ...props }: React.ComponentProps<"div">) {
   return (
      <div
         className={cn(
            "w-fit animate-[shimmer_4s_infinite_linear] bg-[200%_auto] bg-[linear-gradient(to_right,var(--color-primary-9)_40%,var(--color-primary-12)_60%,var(--color-primary-9)_80%)] bg-clip-text text-transparent",
            className,
         )}
         {...props}
      />
   )
}
